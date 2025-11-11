import { PrismaClient } from '@prisma/client';
import { calculateDistance } from '../utils/zones';

const prisma = new PrismaClient();

export interface PropertyForEstimation {
  latitude: number;
  longitude: number;
  surface: number;
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  isExterior: boolean;
  hasLift: boolean;
  buildYear?: number;
  condition?: string;
  zone?: string;
}

export interface ComparableMatch {
  id: string;
  url: string;
  price: number;
  pricePerM2: number;
  surface: number;
  distance: number; // metros
  similarity: number; // 0-100
  adjustedPrice: number;
  adjustedPricePerM2: number;
  weight: number; // peso en el cálculo final
  adjustments: {
    surface: number;
    floor: number;
    exterior: number;
    condition: number;
    age: number;
    total: number;
  };
  comparable: {
    address: string;
    rooms?: number;
    floor?: number;
    isExterior: boolean;
    condition?: string;
    wasReformed: boolean;
  };
}

export interface PriceEstimationResult {
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
  minPricePerM2: number;
  avgPricePerM2: number;
  maxPricePerM2: number;
  confidence: number; // 0-100
  comparablesUsed: number;
  searchRadius: number;
  comparables: ComparableMatch[];
  notes: string[];
  warnings: string[];
}

/**
 * Calcula la similitud entre dos propiedades (0-100)
 */
function calculateSimilarity(
  target: PropertyForEstimation,
  comparable: {
    surface: number;
    rooms?: number;
    floor?: number;
    isExterior: boolean;
    buildYear?: number;
    distance: number;
  }
): number {
  let similarity = 100;

  // Penalización por diferencia de superficie (±15% es ideal)
  const surfaceDiff = Math.abs(target.surface - comparable.surface) / target.surface;
  if (surfaceDiff > 0.15) {
    similarity -= Math.min(30, surfaceDiff * 100); // Hasta -30 puntos
  }

  // Penalización por distancia (cada 100m = -2 puntos, max -20)
  const distancePenalty = Math.min(20, (comparable.distance / 100) * 2);
  similarity -= distancePenalty;

  // Penalización por diferencia de habitaciones (si disponible)
  if (target.rooms && comparable.rooms) {
    const roomsDiff = Math.abs(target.rooms - comparable.rooms);
    similarity -= roomsDiff * 5; // -5 puntos por habitación de diferencia
  }

  // Penalización si exterior/interior no coincide (-15 puntos)
  if (target.isExterior !== comparable.isExterior) {
    similarity -= 15;
  }

  // Penalización por diferencia de planta
  if (target.floor !== undefined && comparable.floor !== undefined) {
    const floorDiff = Math.abs(target.floor - comparable.floor);
    similarity -= Math.min(10, floorDiff * 3); // Hasta -10 puntos
  }

  // Penalización por diferencia de antigüedad
  if (target.buildYear && comparable.buildYear) {
    const ageDiff = Math.abs(target.buildYear - comparable.buildYear);
    if (ageDiff > 20) {
      similarity -= Math.min(15, (ageDiff - 20) / 2); // Hasta -15 puntos
    }
  }

  return Math.max(0, similarity);
}

/**
 * Calcula los ajustes de precio necesarios para un comparable
 */
function calculatePriceAdjustments(
  target: PropertyForEstimation,
  comparable: {
    surface: number;
    pricePerM2: number;
    floor?: number;
    isExterior: boolean;
    condition?: string;
    wasReformed: boolean;
    buildYear?: number;
  }
): ComparableMatch['adjustments'] {
  let surfaceAdj = 0;
  let floorAdj = 0;
  let exteriorAdj = 0;
  let conditionAdj = 0;
  let ageAdj = 0;

  // Ajuste por superficie (propiedades más grandes suelen tener menor precio/m²)
  const surfaceDiff = comparable.surface - target.surface;
  surfaceAdj = -(surfaceDiff / target.surface) * 3; // ±3% por cada 100% diferencia

  // Ajuste por planta
  if (target.floor !== undefined && comparable.floor !== undefined) {
    const floorDiff = comparable.floor - target.floor;
    floorAdj = floorDiff * 1.5; // 1.5% por planta
  }

  // Ajuste por exterior/interior
  if (target.isExterior && !comparable.isExterior) {
    exteriorAdj = -8; // -8% si comparable es interior
  } else if (!target.isExterior && comparable.isExterior) {
    exteriorAdj = 8; // +8% si comparable es exterior
  }

  // Ajuste por estado/reforma
  // Si el comparable está reformado y queremos estimar precio reformado, no ajustar
  // Si el comparable NO está reformado y queremos precio reformado, ajustar +
  if (comparable.wasReformed) {
    conditionAdj = 0; // Ya está reformado, es lo que queremos
  } else {
    // No está reformado, vale menos
    conditionAdj = -12; // -12% por no estar reformado
  }

  // Ajuste por antigüedad del edificio
  if (target.buildYear && comparable.buildYear) {
    const ageDiff = comparable.buildYear - target.buildYear;
    ageAdj = (ageDiff / 10) * 0.5; // 0.5% por cada 10 años
  }

  const total = surfaceAdj + floorAdj + exteriorAdj + conditionAdj + ageAdj;

  return {
    surface: Number(surfaceAdj.toFixed(2)),
    floor: Number(floorAdj.toFixed(2)),
    exterior: Number(exteriorAdj.toFixed(2)),
    condition: Number(conditionAdj.toFixed(2)),
    age: Number(ageAdj.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

/**
 * Busca propiedades vendidas comparables en la base de datos
 */
async function findComparables(
  target: PropertyForEstimation,
  maxRadius: number = 2000, // 2km por defecto
  minComparables: number = 5
): Promise<ComparableMatch[]> {
  // Buscar propiedades vendidas en la BD
  const soldProperties = await prisma.soldProperty.findMany({
    where: {
      wasReformed: true, // Solo comparables reformados
      saleDate: {
        gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Último año
      },
    },
    orderBy: {
      saleDate: 'desc',
    },
  });

  const comparablesWithDistance = soldProperties
    .map((prop) => {
      const distance = calculateDistance(
        target.latitude,
        target.longitude,
        prop.latitude,
        prop.longitude
      );

      return {
        ...prop,
        distance,
      };
    })
    .filter((prop) => prop.distance <= maxRadius)
    .sort((a, b) => a.distance - b.distance);

  // Calcular similitud y ajustes para cada comparable
  const comparablesWithScores: ComparableMatch[] = comparablesWithDistance.map((comp) => {
    const similarity = calculateSimilarity(target, {
      surface: comp.surface,
      rooms: comp.rooms ?? undefined,
      floor: comp.floor ?? undefined,
      isExterior: comp.isExterior,
      buildYear: comp.buildYear ?? undefined,
      distance: comp.distance,
    });

    const adjustments = calculatePriceAdjustments(target, {
      surface: comp.surface,
      pricePerM2: comp.salePricePerM2,
      floor: comp.floor ?? undefined,
      isExterior: comp.isExterior,
      condition: comp.condition ?? undefined,
      wasReformed: comp.wasReformed,
      buildYear: comp.buildYear ?? undefined,
    });

    const adjustedPricePerM2 = comp.salePricePerM2 * (1 + adjustments.total / 100);
    const adjustedPrice = adjustedPricePerM2 * target.surface;

    // El peso se basa en la similitud (normalizado)
    const weight = similarity / 100;

    return {
      id: comp.id,
      url: comp.url || '',
      price: comp.salePrice,
      pricePerM2: comp.salePricePerM2,
      surface: comp.surface,
      distance: Math.round(comp.distance),
      similarity: Math.round(similarity),
      adjustedPrice: Math.round(adjustedPrice),
      adjustedPricePerM2: Math.round(adjustedPricePerM2),
      weight,
      adjustments,
      comparable: {
        address: comp.address,
        rooms: comp.rooms ?? undefined,
        floor: comp.floor ?? undefined,
        isExterior: comp.isExterior,
        condition: comp.condition ?? undefined,
        wasReformed: comp.wasReformed,
      },
    };
  });

  // Ordenar por similitud y tomar los mejores
  return comparablesWithScores
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, Math.max(minComparables, 10)); // Máximo 10 comparables
}

/**
 * Estima el precio de venta de una propiedad reformada usando comparables
 */
export async function estimateSalePrice(
  property: PropertyForEstimation,
  options: {
    maxRadius?: number;
    minComparables?: number;
    targetMargin?: number; // Margen de error objetivo (7% por defecto)
  } = {}
): Promise<PriceEstimationResult> {
  const { maxRadius = 2000, minComparables = 5, targetMargin = 7 } = options;

  const notes: string[] = [];
  const warnings: string[] = [];

  // 1. Buscar comparables
  let comparables = await findComparables(property, maxRadius, minComparables);

  // Si no hay suficientes comparables, ampliar radio
  let searchRadius = maxRadius;
  if (comparables.length < minComparables) {
    warnings.push(
      `Solo se encontraron ${comparables.length} comparables en ${maxRadius}m. Ampliando búsqueda...`
    );
    searchRadius = maxRadius * 2;
    comparables = await findComparables(property, searchRadius, minComparables);

    if (comparables.length < 3) {
      warnings.push(
        'ADVERTENCIA: Muy pocos comparables encontrados. Estimación poco fiable.'
      );
    }
  }

  if (comparables.length === 0) {
    // Fallback: usar precios de zona
    const zone = await prisma.marketZone.findFirst({
      where: {
        name: property.zone || '',
      },
    });

    if (zone && zone.avgReformedPricePerM2) {
      const avgPrice = zone.avgReformedPricePerM2 * property.surface;
      const margin = avgPrice * (targetMargin / 100);

      warnings.push('No se encontraron comparables vendidos recientes.');
      warnings.push(
        'Estimación basada en precios medios de la zona. Fiabilidad baja.'
      );

      return {
        minPrice: Math.round(avgPrice - margin),
        avgPrice: Math.round(avgPrice),
        maxPrice: Math.round(avgPrice + margin),
        minPricePerM2: Math.round(zone.avgReformedPricePerM2 - margin / property.surface),
        avgPricePerM2: zone.avgReformedPricePerM2,
        maxPricePerM2: Math.round(zone.avgReformedPricePerM2 + margin / property.surface),
        confidence: 30,
        comparablesUsed: 0,
        searchRadius,
        comparables: [],
        notes,
        warnings,
      };
    }

    throw new Error(
      'No se encontraron comparables ni datos de zona para hacer la estimación'
    );
  }

  // 2. Calcular precio usando media ponderada
  const totalWeight = comparables.reduce((sum, c) => sum + c.weight, 0);
  const weightedAvgPricePerM2 =
    comparables.reduce((sum, c) => sum + c.adjustedPricePerM2 * c.weight, 0) / totalWeight;
  const avgPrice = weightedAvgPricePerM2 * property.surface;

  // 3. Calcular intervalo de confianza
  // Variabilidad basada en la dispersión de los comparables
  const pricesPerM2 = comparables.map((c) => c.adjustedPricePerM2);
  const stdDev = calculateStdDev(pricesPerM2);
  const coefficientOfVariation = stdDev / weightedAvgPricePerM2;

  // Ajustar margen según variabilidad
  let marginPercentage = targetMargin;
  if (coefficientOfVariation > 0.15) {
    marginPercentage = Math.min(15, targetMargin * 1.5); // Aumentar margen si hay mucha variabilidad
    warnings.push(
      `Alta variabilidad en comparables. Intervalo ampliado al ${marginPercentage}%`
    );
  }

  const margin = avgPrice * (marginPercentage / 100);
  const minPrice = avgPrice - margin;
  const maxPrice = avgPrice + margin;

  // 4. Calcular nivel de confianza (0-100)
  let confidence = 100;

  // Penalización por pocos comparables
  if (comparables.length < 5) {
    confidence -= (5 - comparables.length) * 10;
  }

  // Penalización por baja similitud promedio
  const avgSimilarity =
    comparables.reduce((sum, c) => sum + c.similarity, 0) / comparables.length;
  if (avgSimilarity < 70) {
    confidence -= 15;
  }

  // Penalización por radio de búsqueda muy amplio
  if (searchRadius > 1500) {
    confidence -= 10;
  }

  // Penalización por alta variabilidad
  if (coefficientOfVariation > 0.15) {
    confidence -= 15;
  }

  confidence = Math.max(20, confidence); // Mínimo 20%

  // 5. Generar notas
  notes.push(
    `Estimación basada en ${comparables.length} propiedades vendidas reformadas`
  );
  notes.push(`Radio de búsqueda: ${searchRadius}m`);
  notes.push(
    `Similitud promedio: ${Math.round(avgSimilarity)}%`
  );
  notes.push(`Nivel de confianza: ${Math.round(confidence)}%`);

  if (comparables.length >= 8) {
    notes.push('Excelente cantidad de comparables para estimación precisa');
  }

  return {
    minPrice: Math.round(minPrice),
    avgPrice: Math.round(avgPrice),
    maxPrice: Math.round(maxPrice),
    minPricePerM2: Math.round(minPrice / property.surface),
    avgPricePerM2: Math.round(weightedAvgPricePerM2),
    maxPricePerM2: Math.round(maxPrice / property.surface),
    confidence: Math.round(confidence),
    comparablesUsed: comparables.length,
    searchRadius,
    comparables: comparables.slice(0, 5), // Solo devolver los 5 mejores
    notes,
    warnings,
  };
}

/**
 * Calcula la desviación estándar de un array de números
 */
function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

  return Math.sqrt(variance);
}
