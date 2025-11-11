/**
 * Property Text Extractor
 * Extrae datos estructurados de texto de anuncios de portales inmobiliarios
 * Soporta: Idealista, Fotocasa, Pisos.com
 */

export interface ExtractedPropertyData {
  price?: number;
  surface?: number;
  rooms?: number;
  bathrooms?: number;
  floor?: number;
  buildYear?: number;
  isPenthouse?: boolean;
  isExterior?: boolean;
  hasLift?: boolean;
  hasGarage?: boolean;
  hasPool?: boolean;
  hasStorage?: boolean;
  condition?: 'reformed' | 'needs_reform' | 'good';
  address?: string;
  zone?: string;
}

export class PropertyTextExtractor {
  /**
   * Extrae datos de un anuncio inmobiliario
   */
  static extract(text: string): ExtractedPropertyData {
    const normalizedText = this.normalizeText(text);

    return {
      price: this.extractPrice(normalizedText),
      surface: this.extractSurface(normalizedText),
      rooms: this.extractRooms(normalizedText),
      bathrooms: this.extractBathrooms(normalizedText),
      floor: this.extractFloor(normalizedText),
      buildYear: this.extractBuildYear(normalizedText),
      isPenthouse: this.detectPenthouse(normalizedText),
      isExterior: this.detectExterior(normalizedText),
      hasLift: this.detectLift(normalizedText),
      hasGarage: this.detectGarage(normalizedText),
      hasPool: this.detectPool(normalizedText),
      hasStorage: this.detectStorage(normalizedText),
      condition: this.detectCondition(normalizedText),
      address: this.extractAddress(normalizedText),
      zone: this.extractZone(normalizedText),
    };
  }

  private static normalizeText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();
  }

  private static extractPrice(text: string): number | undefined {
    // Patrones: 949.000 €, 949000€, 949.000€, €949,000
    const patterns = [
      /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*€/,
      /€\s*(\d{1,3}(?:[.,]\d{3})*)/,
      /precio[:\s]+(\d{1,3}(?:[.,]\d{3})*)\s*€/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const priceStr = match[1].replace(/[.,]/g, '');
        const price = parseInt(priceStr, 10);
        if (price > 10000 && price < 10000000) {
          return price;
        }
      }
    }
    return undefined;
  }

  private static extractSurface(text: string): number | undefined {
    // Patrones: 100 m², 100m2, 100 metros
    const patterns = [
      /(\d{1,4})\s*m[²2]/i,
      /(\d{1,4})\s*metros?\s*(?:cuadrados?)?/i,
      /superficie[:\s]+(\d{1,4})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const surface = parseInt(match[1], 10);
        if (surface >= 20 && surface <= 1000) {
          return surface;
        }
      }
    }
    return undefined;
  }

  private static extractRooms(text: string): number | undefined {
    // Patrones: 3 hab., 3 dormitorios, 3 habitaciones
    const patterns = [
      /(\d{1,2})\s*(?:hab(?:itacion(?:es)?)?|dormitorios?|cuartos?)/i,
      /(?:habitaciones?|dormitorios?)[:\s]+(\d{1,2})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const rooms = parseInt(match[1], 10);
        if (rooms >= 1 && rooms <= 10) {
          return rooms;
        }
      }
    }
    return undefined;
  }

  private static extractBathrooms(text: string): number | undefined {
    // Patrones: 2 baños, 2 aseos
    const patterns = [
      /(\d{1,2})\s*(?:baños?|aseos?)/i,
      /(?:baños?|aseos?)[:\s]+(\d{1,2})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const bathrooms = parseInt(match[1], 10);
        if (bathrooms >= 1 && bathrooms <= 10) {
          return bathrooms;
        }
      }
    }
    return undefined;
  }

  private static extractFloor(text: string): number | undefined {
    // Patrones: Planta 11ª, 3ª planta, piso 5, bajo, planta baja
    const bajoPatterns = /(?:planta\s+)?baja?|(?:piso\s+)?bajo/i;
    if (bajoPatterns.test(text)) {
      return 0;
    }

    const patterns = [
      /(?:planta|piso)[:\s]+(\d{1,2})[ªº°]?/i,
      /(\d{1,2})[ªº°]?\s*(?:planta|piso)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const floor = parseInt(match[1], 10);
        if (floor >= 0 && floor <= 30) {
          return floor;
        }
      }
    }
    return undefined;
  }

  private static extractBuildYear(text: string): number | undefined {
    // Patrones: año 1975, construido en 1980, de 1990
    const patterns = [
      /(?:año|construido|de)[:\s]+(19\d{2}|20\d{2})/i,
      /(19[5-9]\d|20[0-2]\d)/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const year = parseInt(match[1], 10);
        const currentYear = new Date().getFullYear();
        if (year >= 1850 && year <= currentYear) {
          return year;
        }
      }
    }
    return undefined;
  }

  private static detectPenthouse(text: string): boolean {
    return /áticos?|atic/i.test(text);
  }

  private static detectExterior(text: string): boolean {
    return /exterior/i.test(text);
  }

  private static detectLift(text: string): boolean {
    return /ascensor|elevador/i.test(text);
  }

  private static detectGarage(text: string): boolean {
    return /garaje|parking|plaza\s*(?:de\s*)?garaje/i.test(text);
  }

  private static detectPool(text: string): boolean {
    return /piscina/i.test(text);
  }

  private static detectStorage(text: string): boolean {
    return /trastero/i.test(text);
  }

  private static detectCondition(text: string): 'reformed' | 'needs_reform' | 'good' | undefined {
    const reformedKeywords = /reformado|reform|renovado|recién\s*renovado/i;
    const needsReformKeywords = /(?:para|necesita|requiere)\s*(?:reformar|reforma)|a\s*reformar/i;
    const goodKeywords = /buen\s*estado|buenas\s*condiciones/i;

    if (reformedKeywords.test(text)) {
      return 'reformed';
    }
    if (needsReformKeywords.test(text)) {
      return 'needs_reform';
    }
    if (goodKeywords.test(text)) {
      return 'good';
    }
    return undefined;
  }

  private static extractAddress(text: string): string | undefined {
    // Buscar patrones de direcciones: CL Francisco Silvela, Calle..., C/...
    const patterns = [
      /(?:CL|calle|c\/)\s+([A-Z][A-Za-záéíóúñÁÉÍÓÚÑ\s]+(?:\d+)?)/,
      /(?:en venta en|ubicado en|dirección:?)\s+([A-Z][A-Za-záéíóúñÁÉÍÓÚÑ\s,]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const address = match[1].trim();
        if (address.length > 5 && address.length < 100) {
          return address;
        }
      }
    }
    return undefined;
  }

  private static extractZone(text: string): string | undefined {
    // Zonas comunes de Madrid
    const madridZones = [
      'Guindalera', 'Delicias', 'Pacífico', 'Prosperidad', 'Retiro',
      'Argüelles', 'Chamberí', 'Salamanca', 'Chamartín', 'Centro',
      'Sol', 'Malasaña', 'Chueca', 'Lavapiés', 'Atocha', 'Usera',
      'Carabanchel', 'Latina', 'Moncloa', 'Tetuán', 'Puente de Vallecas'
    ];

    const lowerText = text.toLowerCase();
    for (const zone of madridZones) {
      if (lowerText.includes(zone.toLowerCase())) {
        return zone;
      }
    }

    // Buscar patrón "zona X" o "barrio X"
    const zonePattern = /(?:zona|barrio|distrito)[:\s]+([A-Za-záéíóúñÁÉÍÓÚÑ\s]+?)(?:[,.]|\s*\n)/i;
    const match = text.match(zonePattern);
    if (match) {
      const zone = match[1].trim();
      if (zone.length > 3 && zone.length < 50) {
        return zone;
      }
    }

    return undefined;
  }
}
