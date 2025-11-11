export interface ExtractedPropertyData {
  price?: number;
  surface?: number;
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  isExterior?: boolean;
  hasLift?: boolean;
  hasGarage?: boolean;
  hasPool?: boolean;
  hasStorage?: boolean;
  buildYear?: number;
  condition?: 'reformed' | 'good' | 'needs_reform';
  address?: string;
  zone?: string;
  city?: string;
  description?: string;
  isPenthouse?: boolean;
}

export class PropertyTextExtractor {
  /**
   * Extrae datos de propiedades desde texto pegado de Idealista
   */
  static extract(text: string): ExtractedPropertyData {
    const data: ExtractedPropertyData = {};

    // Limpiar el texto
    const cleanText = text.replace(/\s+/g, ' ').trim();

    // Extraer precio
    const priceMatch = cleanText.match(/(\d{1,3}(?:\.\d{3})*(?:,\d+)?)\s*€/);
    if (priceMatch) {
      data.price = parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.'));
    }

    // Extraer superficie
    const surfaceMatch = cleanText.match(/(\d+)\s*m²(?:\s*construidos)?/);
    if (surfaceMatch) {
      data.surface = parseInt(surfaceMatch[1]);
    }

    // Extraer habitaciones
    const roomsMatch = cleanText.match(/(\d+)\s*(?:hab(?:itacion(?:es)?)?|dormitorios?)/i);
    if (roomsMatch) {
      data.rooms = parseInt(roomsMatch[1]);
    }

    // Extraer baños
    const bathroomsMatch = cleanText.match(/(\d+)\s*baños?/i);
    if (bathroomsMatch) {
      data.bathrooms = parseInt(bathroomsMatch[1]);
    }

    // Extraer planta
    const floorMatch = cleanText.match(/(?:Planta|Piso)\s*(\d+)[ªº]?/i);
    if (floorMatch) {
      data.floor = parseInt(floorMatch[1]);
    } else if (cleanText.toLowerCase().includes('bajo')) {
      data.floor = 0;
    } else if (cleanText.toLowerCase().includes('ático')) {
      data.isPenthouse = true;
      // Los áticos suelen estar en plantas altas
      const specificFloorMatch = cleanText.match(/planta\s*(\d+)/i);
      if (specificFloorMatch) {
        data.floor = parseInt(specificFloorMatch[1]);
      }
    }

    // Detectar si es exterior
    data.isExterior = cleanText.toLowerCase().includes('exterior');

    // Detectar si tiene ascensor
    data.hasLift = cleanText.toLowerCase().includes('ascensor');

    // Detectar garaje
    data.hasGarage = cleanText.toLowerCase().includes('garaje') ||
                     cleanText.toLowerCase().includes('plaza de garaje') ||
                     cleanText.toLowerCase().includes('parking');

    // Detectar piscina
    data.hasPool = cleanText.toLowerCase().includes('piscina');

    // Detectar trastero
    data.hasStorage = cleanText.toLowerCase().includes('trastero');

    // Extraer año de construcción
    const yearMatch = cleanText.match(/(?:construido|año|edificio\s+de)\s*(?:en\s*)?(\d{4})/i);
    if (yearMatch) {
      data.buildYear = parseInt(yearMatch[1]);
    }

    // Detectar estado
    if (cleanText.toLowerCase().includes('reformar') ||
        cleanText.toLowerCase().includes('reforma') && !cleanText.toLowerCase().includes('reformado')) {
      data.condition = 'needs_reform';
    } else if (cleanText.toLowerCase().includes('reformado') ||
               cleanText.toLowerCase().includes('renovado')) {
      data.condition = 'reformed';
    } else if (cleanText.toLowerCase().includes('buen estado')) {
      data.condition = 'good';
    } else {
      // Por defecto, si es segunda mano sin especificar
      data.condition = 'good';
    }

    // Extraer dirección y zona
    // Buscar patrones comunes de dirección
    const addressPatterns = [
      /(?:en|de)\s+((?:calle|CL|c\/|avenida|av\.|paseo|plaza|pl\.)\s+[^,\n]+)/i,
      /(?:Ático|Piso|Vivienda|Casa)\s+en\s+([^,\n]+?)(?:\s+Ver\s+mapa|,|\n|$)/i,
    ];

    for (const pattern of addressPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        data.address = match[1].trim();
        break;
      }
    }

    // Extraer zona/barrio
    const zonePatterns = [
      /(?:barrio\s+de\s+|zona\s+de\s+)([^,\n]+)/i,
      /(?:Guindalera|Salamanca|Retiro|Chamberí|Chamartín|Argüelles|Prosperidad|Delicias|Pacífico)/i,
    ];

    for (const pattern of zonePatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        data.zone = match[1] || match[0];
        data.zone = data.zone.trim().toUpperCase();
        break;
      }
    }

    // Extraer ciudad (normalmente Madrid)
    if (cleanText.includes('Madrid')) {
      data.city = 'Madrid';
    }

    // Extraer descripción
    // Buscar el comentario del anunciante o descripción principal
    const descMatch = cleanText.match(/(?:Comentario del anunciante|Descripción)[:\s]+([^]+?)(?:Características|$)/i);
    if (descMatch) {
      data.description = descMatch[1].trim().substring(0, 500); // Limitar a 500 caracteres
    }

    // Validaciones y ajustes finales
    // Si detectamos "Ático" en el título, marcarlo como tal
    if (cleanText.toLowerCase().startsWith('ático')) {
      data.isPenthouse = true;
    }

    return data;
  }

  /**
   * Extrae datos desde una URL de Idealista (usa el método de import existente)
   */
  static async extractFromUrl(url: string): Promise<ExtractedPropertyData> {
    try {
      const response = await fetch('/api/analysis/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          price: data.purchasePrice,
          surface: data.surface,
          address: data.location,
          // Los demás campos vendrán en futuras mejoras del endpoint
        };
      }
    } catch (error) {
      console.error('Error extracting from URL:', error);
    }
    return {};
  }
}