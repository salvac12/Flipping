import { NextRequest, NextResponse } from 'next/server';
import { estimateSalePrice, PropertyForEstimation } from '@/lib/pricing/price-estimator';
import { estimateReformCost } from '@/lib/pricing/reform-cost-estimator';
import { ReformType, ReformQuality } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/pricing/estimate
 *
 * Estima el precio de venta de una propiedad reformada y el coste de reforma
 *
 * Body:
 * {
 *   property: {
 *     latitude: number,
 *     longitude: number,
 *     surface: number,
 *     rooms?: number,
 *     bathrooms?: number,
 *     floor?: number,
 *     isExterior: boolean,
 *     hasLift: boolean,
 *     buildYear?: number,
 *     condition?: string,
 *     zone?: string
 *   },
 *   reformType?: "INTEGRAL" | "PARTIAL" | "COSMETIC" | "STRUCTURAL",
 *   reformQuality?: "BASIC" | "MEDIUM" | "HIGH" | "LUXURY",
 *   options?: {
 *     maxRadius?: number,
 *     minComparables?: number,
 *     targetMargin?: number
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { property, reformType, reformQuality, options } = body;

    // Validación
    if (!property) {
      return NextResponse.json(
        { error: 'Property data is required' },
        { status: 400 }
      );
    }

    const {
      latitude,
      longitude,
      surface,
      rooms,
      bathrooms,
      floor,
      isExterior,
      hasLift,
      buildYear,
      condition,
      zone,
    } = property;

    if (!latitude || !longitude || !surface) {
      return NextResponse.json(
        { error: 'latitude, longitude, and surface are required' },
        { status: 400 }
      );
    }

    // Crear objeto de propiedad para estimación
    const propertyForEstimation: PropertyForEstimation = {
      latitude,
      longitude,
      surface,
      rooms,
      bathrooms,
      floor,
      isExterior: isExterior ?? true,
      hasLift: hasLift ?? false,
      buildYear,
      condition,
      zone,
    };

    // 1. Estimar precio de venta
    console.log('📊 Estimating sale price...');
    const priceEstimation = await estimateSalePrice(
      propertyForEstimation,
      options || {}
    );

    // 2. Estimar coste de reforma
    console.log('🔨 Estimating reform cost...');
    const rType: ReformType = reformType || ReformType.INTEGRAL;
    const rQuality: ReformQuality = reformQuality || ReformQuality.MEDIUM;

    const reformCostEstimation = await estimateReformCost(
      surface,
      rType,
      rQuality,
      zone
    );

    // 3. Calcular ROI y viabilidad
    const purchasePrice = property.purchasePrice || 0; // Si se proporciona
    const totalInvestment = purchasePrice + reformCostEstimation.totalCost;
    const expectedProfit = priceEstimation.avgPrice - totalInvestment;
    const roi = purchasePrice > 0 ? (expectedProfit / totalInvestment) * 100 : 0;

    // Criterios de viabilidad
    const minProfitMargin = 20000; // Mínimo 20k de beneficio
    const minROI = 15; // Mínimo 15% ROI

    const isViable =
      expectedProfit >= minProfitMargin &&
      (purchasePrice === 0 || roi >= minROI) &&
      priceEstimation.confidence >= 50;

    // 4. Construir respuesta
    const response = {
      priceEstimation: {
        ...priceEstimation,
        comparables: priceEstimation.comparables.map((c) => ({
          id: c.id,
          distance: c.distance,
          similarity: c.similarity,
          price: c.price,
          pricePerM2: c.pricePerM2,
          adjustedPrice: c.adjustedPrice,
          adjustedPricePerM2: c.adjustedPricePerM2,
          surface: c.surface,
          address: c.comparable.address,
          rooms: c.comparable.rooms,
          floor: c.comparable.floor,
          isExterior: c.comparable.isExterior,
          wasReformed: c.comparable.wasReformed,
          adjustments: c.adjustments,
        })),
      },
      reformCostEstimation,
      analysis: {
        purchasePrice,
        reformCost: reformCostEstimation.totalCost,
        totalInvestment,
        estimatedSalePrice: priceEstimation.avgPrice,
        expectedProfit,
        roi: Math.round(roi * 10) / 10,
        isViable,
        viabilityReasons: [] as string[],
      },
      recommendations: [] as string[],
    };

    // Agregar razones de viabilidad
    if (!isViable) {
      if (expectedProfit < minProfitMargin) {
        response.analysis.viabilityReasons.push(
          `Beneficio esperado (${Math.round(expectedProfit).toLocaleString()}€) menor al mínimo (${minProfitMargin.toLocaleString()}€)`
        );
      }
      if (roi < minROI && purchasePrice > 0) {
        response.analysis.viabilityReasons.push(
          `ROI (${roi.toFixed(1)}%) menor al mínimo (${minROI}%)`
        );
      }
      if (priceEstimation.confidence < 50) {
        response.analysis.viabilityReasons.push(
          `Confianza de estimación baja (${priceEstimation.confidence}%)`
        );
      }
    }

    // Recomendaciones
    if (priceEstimation.confidence < 70) {
      response.recommendations.push(
        'Confianza de estimación moderada. Recomendamos obtener más comparables o una tasación profesional.'
      );
    }

    if (reformCostEstimation.reformType === ReformType.STRUCTURAL) {
      response.recommendations.push(
        'Reforma estructural requerida. Consultar con arquitecto/ingeniero antes de proceder.'
      );
    }

    if (roi > 30) {
      response.recommendations.push(
        'Excelente oportunidad con ROI superior al 30%. Priorizar análisis detallado.'
      );
    }

    if (priceEstimation.warnings.length > 0) {
      response.recommendations.push(...priceEstimation.warnings);
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error estimating price:', error);
    return NextResponse.json(
      {
        error: 'Failed to estimate price',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
