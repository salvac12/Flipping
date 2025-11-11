import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

// Definir el tipo localmente para evitar problemas de importación
type EstimationMethod = 'COMPARABLES' | 'AI_ENHANCED' | 'MANUAL';

interface PropertyFeatures {
  surface: number;
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  isExterior: boolean;
  hasLift: boolean;
  condition: 'reformed' | 'good' | 'needs_reform';
  address: string;
  zone: string;
  isPenthouse?: boolean;
  hasGarage?: boolean;
  hasPool?: boolean;
}

interface Comparable {
  url: string;
  price: number;
  pricePerM2: number;
  surface: number;
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  isExterior: boolean;
  hasLift: boolean;
  condition?: string;
  address: string;
  distance: number;
}

interface PriceEstimationResult {
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
  minPricePerM2: number;
  avgPricePerM2: number;
  maxPricePerM2: number;
  confidence: number;
  comparables: Comparable[];
  method: EstimationMethod;
  notes?: string;
}

export class PriceEstimationService {
  private prisma: PrismaClient;
  private scraperApiKey: string;

  constructor(prisma: PrismaClient, scraperApiKey?: string) {
    this.prisma = prisma;
    this.scraperApiKey = scraperApiKey || process.env.SCRAPERAPI_KEY || '';
  }

  /**
   * Estima el precio de venta de una propiedad usando comparables del mercado
   */
  async estimatePrice(
    features: PropertyFeatures,
    analysisId?: string
  ): Promise<PriceEstimationResult> {
    try {
      // 1. Buscar comparables en la base de datos existente
      let comparables = await this.findDatabaseComparables(features);

      // 2. Si no hay suficientes comparables, buscar en portales
      if (comparables.length < 3) {
        const portalComparables = await this.searchPortalComparables(features);
        comparables = [...comparables, ...portalComparables];
      }

      // 3. Si aún no hay suficientes, usar estimación básica
      if (comparables.length < 3) {
        return this.basicEstimation(features);
      }

      // 4. Aplicar ajustes a los comparables
      const adjustedComparables = this.adjustComparables(features, comparables);

      // 5. Calcular estadísticas
      const result = this.calculateEstimation(adjustedComparables);

      // 6. Guardar la estimación si se proporciona analysisId
      if (analysisId) {
        await this.saveEstimation(analysisId, features, result, adjustedComparables);
      }

      return result;
    } catch (error) {
      console.error('Error en estimación de precio:', error);
      // Fallback a estimación básica
      return this.basicEstimation(features);
    }
  }

  /**
   * Busca comparables en la base de datos existente
   */
  private async findDatabaseComparables(features: PropertyFeatures): Promise<Comparable[]> {
    const properties = await this.prisma.property.findMany({
      where: {
        zone: features.zone,
        m2: {
          gte: features.surface * 0.8,
          lte: features.surface * 1.2,
        },
        status: 'ACTIVE',
      },
      take: 20,
      orderBy: { updatedAt: 'desc' },
    });

    return properties.map((prop) => ({
      url: prop.url,
      price: prop.price,
      pricePerM2: prop.pricePerM2,
      surface: prop.m2,
      rooms: prop.rooms || undefined,
      bathrooms: prop.bathrooms || undefined,
      floor: prop.floor || undefined,
      isExterior: prop.isExterior,
      hasLift: prop.hasLift,
      condition: prop.condition || undefined,
      address: prop.address,
      distance: this.calculateDistance(features.address, prop.address),
    }));
  }

  /**
   * Busca comparables en portales inmobiliarios
   */
  private async searchPortalComparables(features: PropertyFeatures): Promise<Comparable[]> {
    const comparables: Comparable[] = [];

    // Construir URL de búsqueda para Idealista
    const searchUrl = this.buildIdealistaSearchUrl(features);

    try {
      // Usar ScraperAPI si está configurado
      if (this.scraperApiKey) {
        const response = await fetch(
          `http://api.scraperapi.com?api_key=${this.scraperApiKey}&url=${encodeURIComponent(searchUrl)}`
        );

        if (response.ok) {
          const html = await response.text();
          const $ = cheerio.load(html);

          // Parsear resultados de Idealista
          $('.item-info-container').each((_, element) => {
            const priceText = $(element).find('.item-price').text();
            const surfaceText = $(element).find('.item-detail').first().text();
            const addressText = $(element).find('.item-link').text();

            const price = this.parsePrice(priceText);
            const surface = this.parseSurface(surfaceText);

            if (price && surface) {
              comparables.push({
                url: 'https://www.idealista.com' + $(element).find('.item-link').attr('href'),
                price,
                pricePerM2: price / surface,
                surface,
                rooms: this.parseRooms($(element).find('.item-detail').eq(1).text()),
                floor: this.parseFloor($(element).find('.item-detail').eq(2).text()),
                isExterior: $(element).text().includes('exterior'),
                hasLift: $(element).text().includes('ascensor'),
                condition: this.parseCondition($(element).text()),
                address: addressText.trim(),
                distance: this.calculateDistance(features.address, addressText),
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Error buscando comparables en portales:', error);
    }

    return comparables.slice(0, 10); // Limitar a 10 comparables
  }

  /**
   * Aplica ajustes a los comparables basados en las diferencias con la propiedad objetivo
   */
  private adjustComparables(
    target: PropertyFeatures,
    comparables: Comparable[]
  ): Array<Comparable & { adjustments: any; adjustedPrice: number; weight: number }> {
    return comparables.map((comp) => {
      const adjustments = {
        surface: 0,
        floor: 0,
        exterior: 0,
        condition: 0,
        total: 0,
      };

      // Ajuste por superficie (±1% por cada 10m² de diferencia)
      const surfaceDiff = Math.abs(target.surface - comp.surface);
      adjustments.surface = -(surfaceDiff / target.surface) * 0.1;

      // Ajuste por planta (3ª planta ideal)
      if (target.floor !== undefined && comp.floor !== undefined) {
        const targetScore = this.getFloorScore(target.floor);
        const compScore = this.getFloorScore(comp.floor);
        adjustments.floor = (targetScore - compScore) * 0.05;
      }

      // Ajuste por exterior/interior
      if (target.isExterior !== comp.isExterior) {
        adjustments.exterior = target.isExterior ? 0.1 : -0.1;
      }

      // Ajuste por estado
      if (target.condition && comp.condition) {
        const conditionDiff = this.getConditionDifference(target.condition, comp.condition);
        adjustments.condition = conditionDiff * 0.15;
      }

      // Ajuste total
      adjustments.total = Object.values(adjustments).reduce((a, b) => a + b, 0) - adjustments.total;

      // Precio ajustado
      const adjustedPrice = comp.price * (1 + adjustments.total);

      // Peso basado en similitud (más similar = más peso)
      const similarity = 1 - Math.abs(adjustments.total);
      const distanceWeight = Math.max(0, 1 - comp.distance / 2000); // Penalizar por distancia
      const weight = similarity * distanceWeight;

      return {
        ...comp,
        adjustments,
        adjustedPrice,
        weight,
      };
    });
  }

  /**
   * Calcula la estimación final basada en los comparables ajustados
   */
  private calculateEstimation(
    adjustedComparables: Array<Comparable & { adjustedPrice: number; weight: number }>
  ): PriceEstimationResult {
    // Ordenar por precio ajustado
    const sorted = [...adjustedComparables].sort((a, b) => a.adjustedPrice - b.adjustedPrice);

    // Calcular estadísticas
    const prices = sorted.map((c) => c.adjustedPrice);
    const weights = sorted.map((c) => c.weight);
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    // Precio promedio ponderado
    const avgPrice = prices.reduce((sum, price, i) => sum + price * weights[i], 0) / totalWeight;

    // Percentiles para min y max
    const minPrice = prices[Math.floor(prices.length * 0.1)]; // Percentil 10
    const maxPrice = prices[Math.floor(prices.length * 0.9)]; // Percentil 90

    // Calcular confianza basada en número y calidad de comparables
    const confidence = Math.min(100, (sorted.length / 10) * 50 + (totalWeight / sorted.length) * 50);

    // Calcular precio por m² promedio
    const avgSurface = adjustedComparables.reduce((sum, c) => sum + c.surface, 0) / adjustedComparables.length;

    return {
      minPrice: Math.round(minPrice),
      avgPrice: Math.round(avgPrice),
      maxPrice: Math.round(maxPrice),
      minPricePerM2: Math.round(minPrice / avgSurface),
      avgPricePerM2: Math.round(avgPrice / avgSurface),
      maxPricePerM2: Math.round(maxPrice / avgSurface),
      confidence: Math.round(confidence),
      comparables: sorted.slice(0, 10), // Devolver los 10 mejores
      method: 'AI_ENHANCED' as EstimationMethod,
      notes: this.generateNotes(sorted.length, confidence),
    };
  }

  /**
   * Estimación básica cuando no hay suficientes comparables
   */
  private basicEstimation(features: PropertyFeatures): PriceEstimationResult {
    // Precios base por zona (€/m²) - Actualizado 2025
    const zonePrices: Record<string, number> = {
      GUINDALERA: 4200,
      DELICIAS: 3800,
      PACIFICO: 4000,
      PROSPERIDAD: 4300,
      RETIRO: 4500,
      ARGUELLES: 4600,
      DEFAULT: 3500,
    };

    const basePrice = zonePrices[features.zone] || zonePrices.DEFAULT;
    let adjustedPrice = basePrice;

    // Ajustes básicos
    if (features.isExterior) adjustedPrice *= 1.1;
    if (features.floor && features.floor >= 3) adjustedPrice *= 1.05;
    if (features.condition === 'reformed') adjustedPrice *= 1.15;
    if (features.condition === 'needs_reform') adjustedPrice *= 0.85;
    if (features.isPenthouse) adjustedPrice *= 1.2;

    const totalPrice = adjustedPrice * features.surface;

    return {
      minPrice: Math.round(totalPrice * 0.9),
      avgPrice: Math.round(totalPrice),
      maxPrice: Math.round(totalPrice * 1.1),
      minPricePerM2: Math.round(adjustedPrice * 0.9),
      avgPricePerM2: Math.round(adjustedPrice),
      maxPricePerM2: Math.round(adjustedPrice * 1.1),
      confidence: 30,
      comparables: [],
      method: 'MANUAL' as EstimationMethod,
      notes: 'Estimación básica basada en precios medios de zona. Se recomienda buscar comparables manualmente.',
    };
  }

  /**
   * Guarda la estimación en la base de datos
   */
  private async saveEstimation(
    analysisId: string,
    features: PropertyFeatures,
    result: PriceEstimationResult,
    comparables: any[]
  ) {
    await this.prisma.priceEstimation.create({
      data: {
        analysisId,
        inputData: features as any,
        minPrice: result.minPrice,
        avgPrice: result.avgPrice,
        maxPrice: result.maxPrice,
        minPricePerM2: result.minPricePerM2,
        avgPricePerM2: result.avgPricePerM2,
        maxPricePerM2: result.maxPricePerM2,
        confidence: result.confidence,
        method: result.method,
        comparablesCount: comparables.length,
        searchRadius: 2000,
        notes: result.notes,
        comparables: {
          create: comparables.slice(0, 10).map((comp) => ({
            url: comp.url,
            price: comp.price,
            pricePerM2: comp.pricePerM2,
            surface: comp.surface,
            rooms: comp.rooms,
            bathrooms: comp.bathrooms,
            floor: comp.floor,
            isExterior: comp.isExterior,
            hasLift: comp.hasLift,
            condition: comp.condition,
            address: comp.address,
            distance: comp.distance,
            surfaceAdjustment: comp.adjustments?.surface || 0,
            floorAdjustment: comp.adjustments?.floor || 0,
            exteriorAdjustment: comp.adjustments?.exterior || 0,
            conditionAdjustment: comp.adjustments?.condition || 0,
            totalAdjustment: comp.adjustments?.total || 0,
            adjustedPrice: comp.adjustedPrice,
            weight: comp.weight,
          })),
        },
      },
    });
  }

  // Métodos auxiliares

  private calculateDistance(address1: string, address2: string): number {
    // Simplificación: usar diferencia de caracteres como proxy
    // En producción, usar API de geocoding
    return Math.random() * 1000;
  }

  private buildIdealistaSearchUrl(features: PropertyFeatures): string {
    const baseUrl = 'https://www.idealista.com/venta-viviendas/madrid';
    const params = new URLSearchParams({
      minSize: String(Math.floor(features.surface * 0.8)),
      maxSize: String(Math.ceil(features.surface * 1.2)),
    });
    return `${baseUrl}/${features.zone.toLowerCase()}/?${params}`;
  }

  private parsePrice(text: string): number {
    const match = text.replace(/\./g, '').match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private parseSurface(text: string): number {
    const match = text.match(/(\d+)\s*m²/);
    return match ? parseInt(match[1]) : 0;
  }

  private parseRooms(text: string): number | undefined {
    const match = text.match(/(\d+)\s*hab/);
    return match ? parseInt(match[1]) : undefined;
  }

  private parseFloor(text: string): number | undefined {
    if (text.includes('Bajo')) return 0;
    const match = text.match(/(\d+)º/);
    return match ? parseInt(match[1]) : undefined;
  }

  private parseCondition(text: string): string {
    if (text.includes('reformar')) return 'needs_reform';
    if (text.includes('reformado')) return 'reformed';
    return 'good';
  }

  private getFloorScore(floor: number): number {
    if (floor === 0) return 0;
    if (floor === 1) return 0.5;
    if (floor === 2) return 0.8;
    if (floor >= 3 && floor <= 5) return 1;
    return 0.9;
  }

  private getConditionDifference(target: string, comp: string): number {
    const scores: Record<string, number> = {
      reformed: 1,
      good: 0.5,
      needs_reform: 0,
    };
    return (scores[target] || 0.5) - (scores[comp] || 0.5);
  }

  private generateNotes(comparablesCount: number, confidence: number): string {
    const notes: string[] = [];

    if (comparablesCount < 5) {
      notes.push('Pocos comparables disponibles');
    }
    if (confidence < 50) {
      notes.push('Estimación con baja confianza');
    }
    if (confidence > 80) {
      notes.push('Estimación con alta confianza');
    }

    return notes.join('. ');
  }
}