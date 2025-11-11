import { NextRequest, NextResponse } from 'next/server';
import { parsePropertyURL } from '@/lib/scraper/improved-url-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/manual/parse-url
 *
 * Parsea una URL de propiedad y extrae los datos automáticamente
 *
 * Body:
 * {
 *   url: string
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   property: ParsedProperty | null,
 *   error?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    console.log(`📥 Parsing URL: ${url}`);

    // Parsear la URL
    const property = await parsePropertyURL(url);

    if (!property) {
      return NextResponse.json(
        {
          success: false,
          error: 'Could not parse property from URL. Please try entering data manually.',
        },
        { status: 400 }
      );
    }

    // Intentar extraer la zona de la dirección
    if (!property.zone && property.address) {
      property.zone = extractZoneFromAddress(property.address);
    }

    // Si no tenemos coordenadas, intentar geocodificar
    if (!property.latitude || !property.longitude) {
      const coords = await geocodeAddress(property.address);
      if (coords) {
        property.latitude = coords.latitude;
        property.longitude = coords.longitude;
      }
    }

    return NextResponse.json({
      success: true,
      property,
    });
  } catch (error: any) {
    console.error('Error parsing URL:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to parse URL',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/manual/save-property
 *
 * Guarda una propiedad parseada como comparable en la base de datos
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { property } = body;

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property data is required' },
        { status: 400 }
      );
    }

    // Validar datos mínimos
    if (!property.price || !property.surface) {
      return NextResponse.json(
        { success: false, error: 'Price and surface are required' },
        { status: 400 }
      );
    }

    // Mapear portal a enum
    let portalEnum: 'IDEALISTA' | 'FOTOCASA' | 'PISOS_COM' = 'IDEALISTA';
    if (property.portal === 'FOTOCASA') portalEnum = 'FOTOCASA';
    if (property.portal === 'PISOS_COM') portalEnum = 'PISOS_COM';

    // Crear propiedad vendida
    const savedProperty = await prisma.soldProperty.create({
      data: {
        portal: portalEnum,
        externalId: `manual-${Date.now()}`,
        url: property.url,
        title: property.title,
        address: property.address || 'Dirección no disponible',
        zone: property.zone || 'OTROS',
        city: 'Madrid',
        latitude: property.latitude || 40.4168,
        longitude: property.longitude || -3.7038,
        salePrice: property.price,
        salePricePerM2: property.pricePerM2,
        surface: property.surface,
        rooms: property.rooms,
        bathrooms: property.bathrooms,
        floor: property.floor,
        isExterior: property.isExterior,
        hasLift: property.hasLift,
        buildYear: property.buildYear,
        condition: property.condition,
        wasReformed: property.wasReformed,
        reformQuality: property.reformQuality,
        saleDate: new Date(),
        dataSource: 'manual',
        reliability: 7, // Fiabilidad media para datos manuales
        notes: `Manually added from ${property.portal}`,
      },
    });

    // Recalcular estadísticas de zona
    await updateZoneStatistics(property.zone || 'OTROS');

    return NextResponse.json({
      success: true,
      propertyId: savedProperty.id,
      message: 'Property saved successfully',
    });
  } catch (error: any) {
    console.error('Error saving property:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to save property',
      },
      { status: 500 }
    );
  }
}

/**
 * Extrae el nombre de zona de una dirección
 */
function extractZoneFromAddress(address: string): string {
  const addressLower = address.toLowerCase();

  const zoneKeywords: Record<string, string[]> = {
    'GUINDALERA': ['guindalera', 'francisco silvela', 'lopez de hoyos'],
    'DELICIAS': ['delicias', 'palos de la frontera', 'embajadores'],
    'PACIFICO': ['pacifico', 'pacífico', 'doctor esquerdo', 'o\'donnell'],
    'PROSPERIDAD': ['prosperidad', 'maria de molina', 'avenida america'],
    'RETIRO': ['retiro', 'conde de peñalver', 'alcala'],
    'ARGUELLES': ['arguelles', 'argüelles', 'gaztambide', 'vallehermoso', 'guzman el bueno'],
  };

  for (const [zone, keywords] of Object.entries(zoneKeywords)) {
    if (keywords.some(keyword => addressLower.includes(keyword))) {
      return zone;
    }
  }

  return 'OTROS';
}

/**
 * Geocodifica una dirección usando Nominatim (OpenStreetMap)
 */
async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const query = `${address}, Madrid, Spain`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HouseFlipperAgent/1.0',
      },
    });

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

/**
 * Actualiza estadísticas de una zona con los nuevos datos
 */
async function updateZoneStatistics(zoneName: string) {
  try {
    // Obtener todas las propiedades vendidas en esta zona
    const properties = await prisma.soldProperty.findMany({
      where: { zone: zoneName },
    });

    if (properties.length === 0) return;

    // Separar por estado (reformado vs sin reformar)
    const reformed = properties.filter(p => p.wasReformed);
    const unreformed = properties.filter(p => !p.wasReformed);

    const avgReformedPrice = reformed.length > 0
      ? reformed.reduce((sum, p) => sum + p.salePricePerM2, 0) / reformed.length
      : null;

    const avgUnreformedPrice = unreformed.length > 0
      ? unreformed.reduce((sum, p) => sum + p.salePricePerM2, 0) / unreformed.length
      : null;

    const avgPrice = properties.reduce((sum, p) => sum + p.salePricePerM2, 0) / properties.length;
    const minPrice = Math.min(...properties.map(p => p.salePricePerM2));
    const maxPrice = Math.max(...properties.map(p => p.salePricePerM2));

    // Actualizar MarketZone
    await prisma.marketZone.upsert({
      where: { name: zoneName },
      update: {
        avgPricePerM2: Math.round(avgPrice),
        minPricePerM2: Math.round(minPrice),
        maxPricePerM2: Math.round(maxPrice),
        avgReformedPricePerM2: avgReformedPrice ? Math.round(avgReformedPrice) : null,
        avgUnreformedPricePerM2: avgUnreformedPrice ? Math.round(avgUnreformedPrice) : null,
        propertiesCount: properties.length,
        soldCount: properties.length,
        lastUpdated: new Date(),
      },
      create: {
        name: zoneName,
        displayName: zoneName.charAt(0) + zoneName.slice(1).toLowerCase(),
        centerLatitude: properties[0].latitude,
        centerLongitude: properties[0].longitude,
        radius: 1000,
        avgPricePerM2: Math.round(avgPrice),
        minPricePerM2: Math.round(minPrice),
        maxPricePerM2: Math.round(maxPrice),
        avgReformedPricePerM2: avgReformedPrice ? Math.round(avgReformedPrice) : null,
        avgUnreformedPricePerM2: avgUnreformedPrice ? Math.round(avgUnreformedPrice) : null,
        propertiesCount: properties.length,
        soldCount: properties.length,
      },
    });

    console.log(`✅ Updated zone statistics for ${zoneName}`);
  } catch (error) {
    console.error(`Error updating zone statistics:`, error);
  }
}
