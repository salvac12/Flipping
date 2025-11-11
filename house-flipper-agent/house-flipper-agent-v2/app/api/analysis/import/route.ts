import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import * as cheerio from 'cheerio';

/**
 * POST /api/analysis/import - Importar datos desde URL de portal inmobiliario
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL requerida' }, { status: 400 });
    }

    // Detectar el portal
    let portal = '';
    if (url.includes('idealista.com')) {
      portal = 'idealista';
    } else if (url.includes('fotocasa.es')) {
      portal = 'fotocasa';
    } else if (url.includes('pisos.com')) {
      portal = 'pisos';
    } else {
      return NextResponse.json({ error: 'Portal no soportado. Use Idealista, Fotocasa o Pisos.com' }, { status: 400 });
    }

    // Intentar extraer datos básicos de la URL y título
    // Para una implementación más robusta, podrías usar los scrapers existentes
    const propertyData = await extractBasicData(url, portal);

    return NextResponse.json({
      success: true,
      portal,
      data: propertyData
    });
  } catch (error) {
    console.error('Error importing from URL:', error);
    return NextResponse.json(
      { error: 'Error al importar desde URL' },
      { status: 500 }
    );
  }
}

async function extractBasicData(url: string, portal: string) {
  try {
    // Fetch the HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error('No se pudo acceder a la URL');
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let price = 0;
    let surface = 0;
    let location = '';

    if (portal === 'idealista') {
      // Selectores típicos de Idealista (pueden cambiar)
      const priceText = $('span.info-data-price').first().text() ||
                       $('.price-row .price').first().text() ||
                       $('[class*="price"]').first().text();

      const surfaceText = $('span.info-data-meters').first().text() ||
                         $('[class*="surface"]').first().text() ||
                         $('.info-features span:contains("m²")').first().text();

      location = $('span.main-info__title-minor').text() ||
                $('.location').first().text() ||
                $('[class*="location"]').first().text();

      // Extraer números
      price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
      surface = parseInt(surfaceText.replace(/[^\d]/g, '')) || 0;

    } else if (portal === 'fotocasa') {
      // Selectores típicos de Fotocasa
      const priceText = $('.re-DetailHeader-price').first().text() ||
                       $('[class*="price"]').first().text();

      const surfaceText = $('.re-DetailHeader-features span:contains("m²")').text() ||
                         $('[class*="surface"]').first().text();

      location = $('.re-DetailHeader-propertyTitle').text() ||
                $('.location').first().text();

      price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
      surface = parseInt(surfaceText.replace(/[^\d]/g, '')) || 0;

    } else if (portal === 'pisos') {
      // Selectores típicos de Pisos.com
      const priceText = $('.price').first().text() ||
                       $('[class*="price"]').first().text();

      const surfaceText = $('.surface').first().text() ||
                         $('[class*="m2"]').first().text();

      location = $('.location').first().text() ||
                $('[class*="location"]').first().text();

      price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
      surface = parseInt(surfaceText.replace(/[^\d]/g, '')) || 0;
    }

    // Si no se pudieron extraer datos, intentar buscar en la base de datos
    // por si la propiedad ya fue scrapeada
    if (price === 0 || surface === 0) {
      // Buscar en base de datos por URL
      const { default: prisma } = await import('@/lib/db/prisma');
      const property = await prisma.property.findUnique({
        where: { url }
      });

      if (property) {
        return {
          purchasePrice: property.price,
          surface: property.m2,
          location: property.zone || property.address,
          fromDatabase: true,
          propertyId: property.id
        };
      }
    }

    return {
      purchasePrice: price,
      surface: surface,
      location: location.trim() || 'Madrid',
      fromDatabase: false
    };
  } catch (error) {
    console.error('Error extracting data:', error);
    // Valores por defecto si falla la extracción
    return {
      purchasePrice: 0,
      surface: 0,
      location: 'Madrid',
      error: 'No se pudieron extraer datos automáticamente'
    };
  }
}