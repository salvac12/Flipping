import { MADRID_ZONES, isInPriorityZone } from '../utils/zones';

// Precios medios por m2 por zona (datos aproximados, ajustar según mercado real)
const AVERAGE_PRICE_PER_M2_BY_ZONE: Record<string, number> = {
  GUINDALERA: 4500,
  DELICIAS: 3800,
  PACIFICO: 4200,
  PROSPERIDAD: 4600,
  RETIRO: 5500,
  ARGUELLES: 5000,
};

// Años ideales de construcción (edificios de los 70)
const IDEAL_BUILD_YEARS = { min: 1970, max: 1979 };

// Años a evitar (estructura de madera)
const EXCLUDED_BUILD_YEARS = { min: 1890, max: 1920 };

export interface ScoringDetails {
  priceDiscountScore: number;
  surfaceScore: number;
  floorScore: number;
  buildYearScore: number;
  zoneScore: number;
  totalScore: number;
  breakdown: {
    priceDiscount?: number;
    avgPricePerM2?: number;
    discountPercentage?: number;
    isInPriorityZone: boolean;
    zoneName?: string;
    meetsMinimumCriteria: boolean;
    reasons: string[];
  };
}

export interface PropertyData {
  price: number;
  m2: number;
  pricePerM2: number;
  zone?: string;
  latitude?: number;
  longitude?: number;
  floor?: number;
  buildYear?: number;
  isExterior: boolean;
  needsReform: boolean;
  rooms?: number;
}

/**
 * Calcula el scoring de una propiedad basado en múltiples criterios
 */
export function calculatePropertyScore(property: PropertyData): ScoringDetails {
  let totalScore = 0;
  const breakdown: ScoringDetails['breakdown'] = {
    isInPriorityZone: false,
    meetsMinimumCriteria: true,
    reasons: [],
  };

  // 1. DESCUENTO SOBRE PRECIO MEDIO (40 puntos máximo)
  let priceDiscountScore = 0;
  if (property.zone && property.latitude && property.longitude) {
    const zoneInfo = isInPriorityZone(property.latitude, property.longitude);

    if (zoneInfo.inZone && zoneInfo.zone) {
      breakdown.isInPriorityZone = true;
      breakdown.zoneName = zoneInfo.zone.displayName;

      const avgPrice = AVERAGE_PRICE_PER_M2_BY_ZONE[zoneInfo.zone.name] || 4000;
      breakdown.avgPricePerM2 = avgPrice;

      const discountPercentage = ((avgPrice - property.pricePerM2) / avgPrice) * 100;
      breakdown.discountPercentage = discountPercentage;

      // Máximo 40 puntos si el descuento es >= 30%
      if (discountPercentage >= 30) {
        priceDiscountScore = 40;
        breakdown.reasons.push(`Excelente descuento: ${discountPercentage.toFixed(1)}%`);
      } else if (discountPercentage >= 20) {
        priceDiscountScore = 30;
        breakdown.reasons.push(`Buen descuento: ${discountPercentage.toFixed(1)}%`);
      } else if (discountPercentage >= 10) {
        priceDiscountScore = 20;
        breakdown.reasons.push(`Descuento moderado: ${discountPercentage.toFixed(1)}%`);
      } else if (discountPercentage > 0) {
        priceDiscountScore = 10;
      }
    }
  }
  totalScore += priceDiscountScore;

  // 2. SUPERFICIE (20 puntos máximo)
  let surfaceScore = 0;
  if (property.m2 >= 150) {
    surfaceScore = 20;
    breakdown.reasons.push(`Gran superficie: ${property.m2}m²`);
  } else if (property.m2 >= 130) {
    surfaceScore = 15;
    breakdown.reasons.push(`Buena superficie: ${property.m2}m²`);
  } else if (property.m2 >= 120) {
    surfaceScore = 10;
  }
  totalScore += surfaceScore;

  // 3. PLANTA (15 puntos máximo)
  let floorScore = 0;
  if (property.floor !== undefined) {
    if (property.floor >= 3) {
      floorScore = 15;
      breakdown.reasons.push(`Planta ideal: ${property.floor}º`);
    } else if (property.floor === 2) {
      floorScore = 10;
    } else if (property.floor === 1) {
      floorScore = 3;
    } else if (property.floor === 0) {
      // Penalización por planta baja
      floorScore = 0;
      breakdown.reasons.push('⚠️ Planta baja (no recomendado)');
      breakdown.meetsMinimumCriteria = false;
    }
  }
  totalScore += floorScore;

  // 4. AÑO DE CONSTRUCCIÓN (10 puntos máximo)
  let buildYearScore = 0;
  if (property.buildYear) {
    // Verificar si está en el rango excluido (estructura de madera)
    if (
      property.buildYear >= EXCLUDED_BUILD_YEARS.min &&
      property.buildYear <= EXCLUDED_BUILD_YEARS.max
    ) {
      buildYearScore = 0;
      breakdown.reasons.push('⚠️ Edificio antiguo con posible estructura de madera');
      breakdown.meetsMinimumCriteria = false;
    }
    // Años ideales (70s)
    else if (
      property.buildYear >= IDEAL_BUILD_YEARS.min &&
      property.buildYear <= IDEAL_BUILD_YEARS.max
    ) {
      buildYearScore = 10;
      breakdown.reasons.push(`Edificio ideal de los 70 (${property.buildYear})`);
    }
    // Edificios modernos (1980-2000)
    else if (property.buildYear >= 1980 && property.buildYear <= 2000) {
      buildYearScore = 7;
    }
    // Otros edificios aceptables
    else if (property.buildYear >= 1940 && property.buildYear < EXCLUDED_BUILD_YEARS.min) {
      buildYearScore = 5;
    }
  }
  totalScore += buildYearScore;

  // 5. ZONA DE ALTA DEMANDA (15 puntos máximo)
  let zoneScore = 0;
  if (breakdown.isInPriorityZone) {
    zoneScore = 15;
    breakdown.reasons.push(`Zona prioritaria: ${breakdown.zoneName}`);
  }
  totalScore += zoneScore;

  // VERIFICACIONES ADICIONALES DE CRITERIOS OBLIGATORIOS

  // Debe ser exterior
  if (!property.isExterior) {
    breakdown.reasons.push('⚠️ Propiedad interior (criterio no cumplido)');
    breakdown.meetsMinimumCriteria = false;
    totalScore = totalScore * 0.7; // Penalización del 30%
  }

  // Debe necesitar reforma
  if (!property.needsReform) {
    breakdown.reasons.push('ℹ️ No requiere reforma integral');
    totalScore = totalScore * 0.85; // Penalización menor del 15%
  }

  // Superficie mínima 120m2
  if (property.m2 < 120) {
    breakdown.reasons.push('⚠️ Superficie menor a 120m² (criterio no cumplido)');
    breakdown.meetsMinimumCriteria = false;
    totalScore = totalScore * 0.5; // Penalización del 50%
  }

  return {
    priceDiscountScore,
    surfaceScore,
    floorScore,
    buildYearScore,
    zoneScore,
    totalScore: Math.round(totalScore),
    breakdown,
  };
}

/**
 * Determina si una propiedad cumple con los criterios mínimos
 */
export function meetsMinimumCriteria(property: PropertyData): {
  meets: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  let meets = true;

  // Superficie mínima 120m2
  if (property.m2 < 120) {
    meets = false;
    reasons.push('Superficie menor a 120m²');
  }

  // Debe ser exterior
  if (!property.isExterior) {
    meets = false;
    reasons.push('No es exterior');
  }

  // No debe ser planta baja
  if (property.floor === 0) {
    meets = false;
    reasons.push('Es planta baja');
  }

  // Evitar primera planta si es posible (advertencia, no eliminatorio)
  if (property.floor === 1) {
    reasons.push('Primera planta (preferible evitar)');
  }

  // Año de construcción problemático
  if (
    property.buildYear &&
    property.buildYear >= EXCLUDED_BUILD_YEARS.min &&
    property.buildYear <= EXCLUDED_BUILD_YEARS.max
  ) {
    meets = false;
    reasons.push('Edificio con posible estructura de madera');
  }

  // Debe necesitar reforma
  if (!property.needsReform) {
    reasons.push('No requiere reforma integral (preferible que sí)');
  }

  return { meets, reasons };
}

/**
 * Obtiene el precio medio de una zona
 */
export function getAveragePriceForZone(zoneName: string): number {
  return AVERAGE_PRICE_PER_M2_BY_ZONE[zoneName] || 4000;
}

/**
 * Calcula el descuento porcentual respecto al precio medio
 */
export function calculateDiscount(pricePerM2: number, zoneName: string): number {
  const avgPrice = getAveragePriceForZone(zoneName);
  return ((avgPrice - pricePerM2) / avgPrice) * 100;
}
