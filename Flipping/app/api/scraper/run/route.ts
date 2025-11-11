import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import { scrapeAllPortals } from '@/lib/scraper';
import { scrapeIdealistaBarrio } from '@/lib/scraper/idealista-scraperapi';
import { savePropertiesToDatabase } from '@/lib/scraper';
import { BARRIOS_MADRID } from '@/lib/utils/madrid-barrios';

/**
 * POST /api/scraper/run - Ejecutar scraping manual
 *
 * Body:
 * {
 *   "barrio": "GUINDALERA" (opcional) - Barrio específico a scrapear
 *   "maxPagesPerZone": 2 (opcional) - Solo para scraping completo
 * }
 *
 * Si se proporciona "barrio", solo scrape ese barrio con ScraperAPI
 * Si no, ejecuta scraping completo de todos los portales
 */
export async function POST(req: NextRequest) {
  try {
    // DESARROLLO: Autenticación desactivada temporalmente
    // const session = await auth();
    // if (!session) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    const body = await req.json().catch(() => ({}));
    const barrio = body.barrio;
    const maxPagesPerZone = body.maxPagesPerZone || 2;

    // MODO 1: Scraping de barrio específico con ScraperAPI
    if (barrio) {
      // Validar que el barrio existe
      if (!BARRIOS_MADRID[barrio]) {
        return NextResponse.json(
          {
            error: 'Barrio no válido',
            availableBarrios: Object.keys(BARRIOS_MADRID),
          },
          { status: 400 }
        );
      }

      const barrioInfo = BARRIOS_MADRID[barrio];
      console.log(`🚀 Iniciando scraping de ${barrioInfo.displayName}...`);

      // Scrapear solo Idealista con ScraperAPI
      const properties = await scrapeIdealistaBarrio(barrio);

      // DESARROLLO: Guardar en DB desactivado temporalmente (sin DB configurada)
      // let saved = 0;
      // if (properties.length > 0) {
      //   saved = await savePropertiesToDatabase(properties);
      // }

      return NextResponse.json({
        success: true,
        message: `Scraping de ${barrioInfo.displayName} completado (sin guardar en DB)`,
        barrio: {
          key: barrio,
          displayName: barrioInfo.displayName,
          zona: barrioInfo.zona,
          distrito: barrioInfo.distrito,
        },
        results: {
          total: properties.length,
          saved: 0, // DB desactivada
          properties: properties.slice(0, 5), // Solo primeras 5 para no saturar respuesta
        },
      });
    }

    // MODO 2: Scraping completo de todos los portales (legacy)
    console.log('🚀 Iniciando scraping completo de todos los portales...');
    const results = await scrapeAllPortals(maxPagesPerZone);

    return NextResponse.json({
      success: true,
      message: 'Scraping completado',
      results,
    });
  } catch (error) {
    console.error('Error ejecutando scraper:', error);
    return NextResponse.json(
      { error: 'Error ejecutando scraper', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export const maxDuration = 300; // 5 minutos máximo para Vercel
