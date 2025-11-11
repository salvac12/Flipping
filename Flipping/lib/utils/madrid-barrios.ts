/**
 * Mapeo completo de barrios de Madrid para scraping en Idealista
 * Cada barrio tiene su URL específica y zona asignada
 */

export interface BarrioMadrid {
  nombre: string;
  displayName: string;
  slug: string; // Slug de Idealista
  zona: string; // Zona prioritaria asignada
  distrito: string;
}

export const BARRIOS_MADRID: Record<string, BarrioMadrid> = {
  // DISTRITO CENTRO
  SOL: {
    nombre: 'SOL',
    displayName: 'Sol',
    slug: 'sol',
    zona: 'ARGUELLES',
    distrito: 'Centro',
  },
  EMBAJADORES: {
    nombre: 'EMBAJADORES',
    displayName: 'Embajadores',
    slug: 'embajadores',
    zona: 'DELICIAS',
    distrito: 'Centro',
  },
  CORTES: {
    nombre: 'CORTES',
    displayName: 'Cortes',
    slug: 'cortes',
    zona: 'ARGUELLES',
    distrito: 'Centro',
  },
  JUSTICIA: {
    nombre: 'JUSTICIA',
    displayName: 'Justicia',
    slug: 'justicia',
    zona: 'ARGUELLES',
    distrito: 'Centro',
  },
  UNIVERSIDAD: {
    nombre: 'UNIVERSIDAD',
    displayName: 'Universidad',
    slug: 'universidad',
    zona: 'ARGUELLES',
    distrito: 'Centro',
  },
  PALACIO: {
    nombre: 'PALACIO',
    displayName: 'Palacio',
    slug: 'palacio',
    zona: 'ARGUELLES',
    distrito: 'Centro',
  },

  // DISTRITO ARGANZUELA
  DELICIAS: {
    nombre: 'DELICIAS',
    displayName: 'Delicias',
    slug: 'delicias',
    zona: 'DELICIAS',
    distrito: 'Arganzuela',
  },
  PACIFICO: {
    nombre: 'PACIFICO',
    displayName: 'Pacífico',
    slug: 'pacifico',
    zona: 'PACIFICO',
    distrito: 'Arganzuela',
  },
  ATOCHA: {
    nombre: 'ATOCHA',
    displayName: 'Atocha',
    slug: 'atocha',
    zona: 'PACIFICO',
    distrito: 'Arganzuela',
  },
  CHOPERA: {
    nombre: 'CHOPERA',
    displayName: 'Chopera',
    slug: 'chopera',
    zona: 'DELICIAS',
    distrito: 'Arganzuela',
  },
  LEGAZPI: {
    nombre: 'LEGAZPI',
    displayName: 'Legazpi',
    slug: 'legazpi',
    zona: 'DELICIAS',
    distrito: 'Arganzuela',
  },
  ACACIAS: {
    nombre: 'ACACIAS',
    displayName: 'Acacias',
    slug: 'acacias',
    zona: 'DELICIAS',
    distrito: 'Arganzuela',
  },

  // DISTRITO RETIRO
  RETIRO: {
    nombre: 'RETIRO',
    displayName: 'Retiro',
    slug: 'retiro',
    zona: 'RETIRO',
    distrito: 'Retiro',
  },
  JERONIMOS: {
    nombre: 'JERONIMOS',
    displayName: 'Jerónimos',
    slug: 'jeronimos',
    zona: 'RETIRO',
    distrito: 'Retiro',
  },
  IBIZA: {
    nombre: 'IBIZA',
    displayName: 'Ibiza',
    slug: 'ibiza',
    zona: 'RETIRO',
    distrito: 'Retiro',
  },
  NIÑO_JESUS: {
    nombre: 'NIÑO_JESUS',
    displayName: 'Niño Jesús',
    slug: 'nino-jesus',
    zona: 'PACIFICO',
    distrito: 'Retiro',
  },

  // DISTRITO SALAMANCA
  RECOLETOS: {
    nombre: 'RECOLETOS',
    displayName: 'Recoletos',
    slug: 'recoletos',
    zona: 'RETIRO',
    distrito: 'Salamanca',
  },
  GOYA: {
    nombre: 'GOYA',
    displayName: 'Goya',
    slug: 'goya',
    zona: 'RETIRO',
    distrito: 'Salamanca',
  },
  FUENTE_DEL_BERRO: {
    nombre: 'FUENTE_DEL_BERRO',
    displayName: 'Fuente del Berro',
    slug: 'fuente-del-berro',
    zona: 'RETIRO',
    distrito: 'Salamanca',
  },
  GUINDALERA: {
    nombre: 'GUINDALERA',
    displayName: 'Guindalera',
    slug: 'guindalera',
    zona: 'GUINDALERA',
    distrito: 'Salamanca',
  },
  LISTA: {
    nombre: 'LISTA',
    displayName: 'Lista',
    slug: 'lista',
    zona: 'GUINDALERA',
    distrito: 'Salamanca',
  },
  CASTELLANA: {
    nombre: 'CASTELLANA',
    displayName: 'Castellana',
    slug: 'castellana',
    zona: 'RETIRO',
    distrito: 'Salamanca',
  },

  // DISTRITO CHAMARTÍN
  CIUDAD_JARDIN: {
    nombre: 'CIUDAD_JARDIN',
    displayName: 'Ciudad Jardín',
    slug: 'ciudad-jardin',
    zona: 'PROSPERIDAD',
    distrito: 'Chamartín',
  },
  HISPANOAMERICA: {
    nombre: 'HISPANOAMERICA',
    displayName: 'Hispanoamérica',
    slug: 'hispanoamerica',
    zona: 'PROSPERIDAD',
    distrito: 'Chamartín',
  },
  NUEVA_ESPAÑA: {
    nombre: 'NUEVA_ESPAÑA',
    displayName: 'Nueva España',
    slug: 'nueva-espana',
    zona: 'PROSPERIDAD',
    distrito: 'Chamartín',
  },
  PROSPERIDAD: {
    nombre: 'PROSPERIDAD',
    displayName: 'Prosperidad',
    slug: 'prosperidad',
    zona: 'PROSPERIDAD',
    distrito: 'Chamartín',
  },

  // DISTRITO CHAMBERÍ
  GAZTAMBIDE: {
    nombre: 'GAZTAMBIDE',
    displayName: 'Gaztambide',
    slug: 'gaztambide',
    zona: 'ARGUELLES',
    distrito: 'Chamberí',
  },
  ARAPILES: {
    nombre: 'ARAPILES',
    displayName: 'Arapiles',
    slug: 'arapiles',
    zona: 'ARGUELLES',
    distrito: 'Chamberí',
  },
  TRAFALGAR: {
    nombre: 'TRAFALGAR',
    displayName: 'Trafalgar',
    slug: 'trafalgar',
    zona: 'ARGUELLES',
    distrito: 'Chamberí',
  },
  ALMAGRO: {
    nombre: 'ALMAGRO',
    displayName: 'Almagro',
    slug: 'almagro',
    zona: 'ARGUELLES',
    distrito: 'Chamberí',
  },
  RIOS_ROSAS: {
    nombre: 'RIOS_ROSAS',
    displayName: 'Ríos Rosas',
    slug: 'rios-rosas',
    zona: 'ARGUELLES',
    distrito: 'Chamberí',
  },
  VALLEHERMOSO: {
    nombre: 'VALLEHERMOSO',
    displayName: 'Vallehermoso',
    slug: 'vallehermoso',
    zona: 'ARGUELLES',
    distrito: 'Chamberí',
  },

  // DISTRITO MONCLOA-ARAVACA
  ARGUELLES: {
    nombre: 'ARGUELLES',
    displayName: 'Argüelles',
    slug: 'arguelles',
    zona: 'ARGUELLES',
    distrito: 'Moncloa-Aravaca',
  },
  CIUDAD_UNIVERSITARIA: {
    nombre: 'CIUDAD_UNIVERSITARIA',
    displayName: 'Ciudad Universitaria',
    slug: 'ciudad-universitaria',
    zona: 'ARGUELLES',
    distrito: 'Moncloa-Aravaca',
  },
  ARAVACA: {
    nombre: 'ARAVACA',
    displayName: 'Aravaca',
    slug: 'aravaca',
    zona: 'MADRID_GENERAL',
    distrito: 'Moncloa-Aravaca',
  },
  EL_PLANTIO: {
    nombre: 'EL_PLANTIO',
    displayName: 'El Plantío',
    slug: 'el-plantio',
    zona: 'MADRID_GENERAL',
    distrito: 'Moncloa-Aravaca',
  },
};

/**
 * Construye la URL de Idealista para un barrio específico
 */
export function getIdealistaUrlForBarrio(barrioKey: string): string {
  const barrio = BARRIOS_MADRID[barrioKey];
  if (!barrio) {
    // Fallback a toda Madrid
    return 'https://www.idealista.com/venta-viviendas/madrid-madrid/';
  }

  return `https://www.idealista.com/venta-viviendas/${barrio.slug}-madrid/`;
}

/**
 * Obtiene lista de barrios por distrito
 */
export function getBarriosByDistrito(distrito: string): BarrioMadrid[] {
  return Object.values(BARRIOS_MADRID).filter(b => b.distrito === distrito);
}

/**
 * Obtiene lista de barrios por zona prioritaria
 */
export function getBarriosByZona(zona: string): BarrioMadrid[] {
  return Object.values(BARRIOS_MADRID).filter(b => b.zona === zona);
}

/**
 * Obtiene todos los distritos únicos
 */
export function getDistritos(): string[] {
  return [...new Set(Object.values(BARRIOS_MADRID).map(b => b.distrito))].sort();
}

/**
 * Obtiene todos los barrios ordenados por nombre
 */
export function getAllBarrios(): BarrioMadrid[] {
  return Object.values(BARRIOS_MADRID).sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  );
}

/**
 * Busca barrio por nombre (fuzzy search)
 */
export function searchBarrio(query: string): BarrioMadrid[] {
  const queryLower = query.toLowerCase();
  return Object.values(BARRIOS_MADRID).filter(barrio =>
    barrio.displayName.toLowerCase().includes(queryLower) ||
    barrio.nombre.toLowerCase().includes(queryLower) ||
    barrio.distrito.toLowerCase().includes(queryLower)
  );
}
