// Zonas de búsqueda prioritarias en Madrid con coordenadas geográficas

export interface Zone {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  radius: number; // en metros
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export const MADRID_ZONES: Record<string, Zone> = {
  GUINDALERA: {
    name: 'GUINDALERA',
    displayName: 'Guindalera',
    latitude: 40.4331,
    longitude: -3.6622,
    radius: 1000,
    priority: 'HIGH',
    description: 'Zona desde Francisco Silvela hasta Parque de las Avenidas. Alta revalorización.',
  },
  DELICIAS: {
    name: 'DELICIAS',
    displayName: 'Delicias y Palos de la Frontera',
    latitude: 40.4021,
    longitude: -3.6935,
    radius: 800,
    priority: 'HIGH',
    description: 'Cerca de Atocha y Matadero. En proceso de revalorización.',
  },
  PACIFICO: {
    name: 'PACIFICO',
    displayName: 'Pacífico y Reina Cristina',
    latitude: 40.4096,
    longitude: -3.6766,
    radius: 800,
    priority: 'HIGH',
    description: 'Al lado del Retiro con precios más asequibles.',
  },
  PROSPERIDAD: {
    name: 'PROSPERIDAD',
    displayName: 'Prosperidad y Ciudad Jardín',
    latitude: 40.4426,
    longitude: -3.6771,
    radius: 900,
    priority: 'HIGH',
    description: 'Alrededores del Parque de Berlín. Zona consolidada.',
  },
  RETIRO: {
    name: 'RETIRO',
    displayName: 'Retiro (Reyes Magos)',
    latitude: 40.4134,
    longitude: -3.6835,
    radius: 1000,
    priority: 'HIGH',
    description: 'Zona Reyes Magos específicamente. Demanda alta.',
  },
  ARGUELLES: {
    name: 'ARGUELLES',
    displayName: 'Argüelles (Gaztambide, Vallehermoso)',
    latitude: 40.4306,
    longitude: -3.7186,
    radius: 1200,
    priority: 'HIGH',
    description: 'Gaztambide, Vallehermoso, Guzmán el Bueno, Islas Filipinas.',
  },
};

// Zonas a evitar (áreas protegidas o saturadas)
export const EXCLUDED_ZONES = [
  'CENTRO',
  'MADRID_AUSTRIAS',
  'LA_LATINA',
  'CASCO_HISTORICO',
  'SOL',
  'OPERA',
  'SALAMANCA_CENTRO',
  'CHAMBERI_CENTRO',
  'JUSTICIA',
];

// Función para calcular distancia entre dos puntos (fórmula de Haversine)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
}

// Función para determinar si una propiedad está en zona prioritaria
export function isInPriorityZone(latitude: number, longitude: number): {
  inZone: boolean;
  zone?: Zone;
  distance?: number;
} {
  for (const zone of Object.values(MADRID_ZONES)) {
    const distance = calculateDistance(
      latitude,
      longitude,
      zone.latitude,
      zone.longitude
    );

    if (distance <= zone.radius) {
      return { inZone: true, zone, distance };
    }
  }

  return { inZone: false };
}

// Función para obtener la zona más cercana
export function getClosestZone(latitude: number, longitude: number): {
  zone: Zone;
  distance: number;
} {
  let closestZone = Object.values(MADRID_ZONES)[0];
  let minDistance = calculateDistance(
    latitude,
    longitude,
    closestZone.latitude,
    closestZone.longitude
  );

  for (const zone of Object.values(MADRID_ZONES).slice(1)) {
    const distance = calculateDistance(
      latitude,
      longitude,
      zone.latitude,
      zone.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestZone = zone;
    }
  }

  return { zone: closestZone, distance: minDistance };
}
