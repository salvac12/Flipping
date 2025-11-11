import { PrismaClient, ReformType, ReformQuality } from '@prisma/client';

const prisma = new PrismaClient();

export interface PropertyCondition {
  needsStructural: boolean; // Necesita reforma estructural
  needsElectrical: boolean; // Necesita renovar electricidad
  needsPlumbing: boolean; // Necesita renovar fontanería
  needsKitchen: boolean; // Necesita cocina nueva
  needsBathroom: boolean; // Necesita baño nuevo
  needsFlooring: boolean; // Necesita cambiar suelos
  needsPainting: boolean; // Necesita pintura
  needsWindows: boolean; // Necesita ventanas nuevas
  needsHeating: boolean; // Necesita calefacción/climatización
}

export interface ReformEstimate {
  reformType: ReformType;
  quality: ReformQuality;
  costPerM2: number;
  totalCost: number;
  minCost: number;
  maxCost: number;
  breakdown: {
    item: string;
    cost: number;
    percentage: number;
  }[];
  timeline: {
    weeks: number;
    description: string;
  };
  includesItems: string[];
  excludesItems: string[];
  notes: string[];
}

/**
 * Determina el tipo de reforma necesaria basándose en el estado de la propiedad
 */
export function determineReformType(condition: Partial<PropertyCondition>): ReformType {
  // Si necesita estructura, es reforma estructural
  if (condition.needsStructural) {
    return ReformType.STRUCTURAL;
  }

  // Contar cuántas cosas necesita
  const needsCount = [
    condition.needsElectrical,
    condition.needsPlumbing,
    condition.needsKitchen,
    condition.needsBathroom,
    condition.needsFlooring,
    condition.needsWindows,
    condition.needsHeating,
  ].filter(Boolean).length;

  // Si necesita más de 4 cosas, es integral
  if (needsCount >= 5) {
    return ReformType.INTEGRAL;
  }

  // Si necesita cocina o baño, es parcial
  if (condition.needsKitchen || condition.needsBathroom) {
    return ReformType.PARTIAL;
  }

  // Si solo necesita pintura y/o suelos, es cosmética
  if (condition.needsPainting || condition.needsFlooring) {
    return ReformType.COSMETIC;
  }

  // Por defecto, cosmética
  return ReformType.COSMETIC;
}

/**
 * Estima el coste de reforma basándose en:
 * - Superficie
 * - Tipo de reforma necesaria
 * - Calidad deseada
 * - Zona (puede afectar costes)
 */
export async function estimateReformCost(
  surface: number,
  reformType: ReformType,
  quality: ReformQuality,
  zone?: string
): Promise<ReformEstimate> {
  // Buscar coste base en la BD
  const reformCost = await prisma.reformCost.findFirst({
    where: {
      reformType,
      quality,
      isActive: true,
      OR: [{ zone: zone }, { zone: null }],
    },
    orderBy: [
      { zone: 'desc' }, // Priorizar zona específica
      { year: 'desc' }, // Más reciente
    ],
  });

  if (!reformCost) {
    throw new Error(
      `No se encontró información de costes para ${reformType} - ${quality}`
    );
  }

  // Cálculo base
  const baseCostPerM2 = reformCost.costPerM2;
  let adjustedCostPerM2 = baseCostPerM2;

  // Ajustes por superficie
  // Superficies muy grandes pueden tener economías de escala
  if (surface > 200) {
    adjustedCostPerM2 = baseCostPerM2 * 0.95; // 5% descuento
  } else if (surface < 80) {
    adjustedCostPerM2 = baseCostPerM2 * 1.1; // 10% extra (menos eficiente)
  }

  // Cálculo total
  const totalCost = Math.round(adjustedCostPerM2 * surface);

  // Rango de variación (±15%)
  const minCost = Math.round(totalCost * 0.85);
  const maxCost = Math.round(totalCost * 1.15);

  // Desglose estimado por conceptos
  const breakdown = generateCostBreakdown(reformType, totalCost);

  // Timeline estimado
  const timeline = estimateTimeline(reformType, surface);

  // Notas adicionales
  const notes: string[] = [];
  if (surface > 200) {
    notes.push('Descuento por superficie aplicado (-5%)');
  } else if (surface < 80) {
    notes.push('Incremento por superficie pequeña (+10%)');
  }

  if (reformType === ReformType.STRUCTURAL) {
    notes.push('IMPORTANTE: Requiere proyecto técnico de arquitecto/ingeniero');
    notes.push('Requiere licencia de obras mayor del ayuntamiento');
  } else if (reformType === ReformType.INTEGRAL) {
    notes.push('Requiere licencia de obras menor del ayuntamiento');
  }

  notes.push(`Costes actualizados para año ${reformCost.year}`);

  return {
    reformType,
    quality,
    costPerM2: Math.round(adjustedCostPerM2),
    totalCost,
    minCost,
    maxCost,
    breakdown,
    timeline,
    includesItems: reformCost.includesItems,
    excludesItems: reformCost.excludesItems,
    notes,
  };
}

/**
 * Genera desglose detallado de costes por conceptos
 */
function generateCostBreakdown(
  reformType: ReformType,
  totalCost: number
): ReformEstimate['breakdown'] {
  let distribution: { [key: string]: number } = {};

  switch (reformType) {
    case ReformType.INTEGRAL:
      distribution = {
        'Demolición y obra civil': 0.15,
        'Electricidad': 0.12,
        'Fontanería': 0.12,
        'Cocina': 0.18,
        'Baños': 0.15,
        'Suelos y alicatados': 0.12,
        'Carpintería y puertas': 0.08,
        'Pintura': 0.05,
        'Varios y imprevistos': 0.03,
      };
      break;

    case ReformType.PARTIAL:
      distribution = {
        'Cocina completa': 0.45,
        'Baño completo': 0.35,
        'Fontanería y electricidad': 0.12,
        'Varios': 0.08,
      };
      break;

    case ReformType.COSMETIC:
      distribution = {
        'Pintura': 0.35,
        'Suelos': 0.45,
        'Pequeñas reparaciones': 0.15,
        'Limpieza final': 0.05,
      };
      break;

    case ReformType.STRUCTURAL:
      distribution = {
        'Proyecto técnico': 0.15,
        'Licencias': 0.05,
        'Refuerzo estructural': 0.5,
        'Vigas y pilares': 0.2,
        'Seguridad y andamios': 0.1,
      };
      break;
  }

  return Object.entries(distribution).map(([item, percentage]) => ({
    item,
    cost: Math.round(totalCost * percentage),
    percentage: percentage * 100,
  }));
}

/**
 * Estima el tiempo de ejecución de la reforma
 */
function estimateTimeline(
  reformType: ReformType,
  surface: number
): ReformEstimate['timeline'] {
  let baseWeeks = 0;
  let description = '';

  switch (reformType) {
    case ReformType.INTEGRAL:
      baseWeeks = 12;
      description = 'Reforma integral completa incluyendo licencias';
      // Ajuste por superficie
      if (surface > 150) baseWeeks = 16;
      if (surface > 200) baseWeeks = 20;
      break;

    case ReformType.PARTIAL:
      baseWeeks = 6;
      description = 'Reforma de cocina y baño';
      break;

    case ReformType.COSMETIC:
      baseWeeks = 3;
      description = 'Reforma cosmética (pintura y suelos)';
      break;

    case ReformType.STRUCTURAL:
      baseWeeks = 20;
      description = 'Proyecto completo incluyendo tramitación de licencias';
      if (surface > 150) baseWeeks = 24;
      break;
  }

  return { weeks: baseWeeks, description };
}

/**
 * Obtiene todas las combinaciones de reforma disponibles con sus costes
 */
export async function getAvailableReformOptions(
  surface: number,
  zone?: string
): Promise<ReformEstimate[]> {
  const estimates: ReformEstimate[] = [];

  const reformTypes = [
    ReformType.COSMETIC,
    ReformType.PARTIAL,
    ReformType.INTEGRAL,
    ReformType.STRUCTURAL,
  ];

  const qualities = [ReformQuality.BASIC, ReformQuality.MEDIUM, ReformQuality.HIGH];

  for (const reformType of reformTypes) {
    for (const quality of qualities) {
      try {
        const estimate = await estimateReformCost(surface, reformType, quality, zone);
        estimates.push(estimate);
      } catch (error) {
        // Si no hay datos para esta combinación, continuar
        continue;
      }
    }
  }

  return estimates;
}

/**
 * Calcula el coste de reforma óptimo para flipping
 * Basado en: no gastar más del 15% del precio de venta estimado
 */
export function getOptimalReformBudget(
  estimatedSalePrice: number,
  maxBudgetPercentage: number = 15
): {
  maxBudget: number;
  recommendedQuality: ReformQuality;
  notes: string[];
} {
  const maxBudget = estimatedSalePrice * (maxBudgetPercentage / 100);
  let recommendedQuality: ReformQuality;
  const notes: string[] = [];

  // Determinar calidad recomendada según presupuesto y precio de venta
  if (estimatedSalePrice > 600000) {
    recommendedQuality = ReformQuality.HIGH;
    notes.push('Zona premium: se recomienda acabados de alta calidad');
  } else if (estimatedSalePrice > 400000) {
    recommendedQuality = ReformQuality.MEDIUM;
    notes.push('Zona media-alta: acabados de calidad media-alta');
  } else {
    recommendedQuality = ReformQuality.BASIC;
    notes.push('Optimizar costes: acabados básicos funcionales');
  }

  notes.push(
    `Presupuesto máximo recomendado: ${Math.round(
      maxBudget
    ).toLocaleString()}€ (${maxBudgetPercentage}% del precio de venta)`
  );

  return {
    maxBudget,
    recommendedQuality,
    notes,
  };
}
