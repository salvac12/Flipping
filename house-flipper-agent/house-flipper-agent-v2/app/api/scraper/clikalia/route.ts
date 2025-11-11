import { NextRequest, NextResponse } from 'next/server';
import { scrapeAllClikaLiaMadrid } from '@/lib/scraper/clikalia-full-scraper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 600; // 10 minutos (aumentado para scraping completo)

/**
 * POST /api/scraper/clikalia
 *
 * Ejecuta el scraper COMPLETO de Clikalia para obtener TODAS las propiedades reformadas en Madrid
 *
 * Body (opcional):
 * {
 *   maxProperties?: number,  // Máximo de propiedades a procesar (default: 200)
 *   maxPages?: number        // Máximo de páginas a revisar (default: 20)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar secreto para prevenir ejecuciones no autorizadas
    // TEMPORALMENTE DESHABILITADO PARA TESTING
    // const authHeader = request.headers.get('authorization');
    // const cronSecret = process.env.CRON_SECRET;

    // if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const body = await request.json().catch(() => ({}));
    const { maxProperties, maxPages } = body;

    console.log('🚀 Starting Clikalia full scraper via API...');

    const result = await scrapeAllClikaLiaMadrid({
      maxProperties: maxProperties || 200,
      maxPages: maxPages || 20,
    });

    return NextResponse.json({
      success: true,
      message: 'Clikalia scraper completed',
      stats: {
        urlsFound: result.totalFound,
        propertiesProcessed: result.totalProcessed,
        saved: result.saved,
        skipped: result.skipped,
        errors: result.errors,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error running Clikalia scraper:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run Clikalia scraper',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/scraper/clikalia
 *
 * Obtiene estadísticas del último scraping de Clikalia
 */
export async function GET(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Contar propiedades de Clikalia
    const clikaLiaProperties = await prisma.soldProperty.count({
      where: {
        dataSource: 'clikalia',
      },
    });

    // Agrupar por zona
    const byZone = await prisma.soldProperty.groupBy({
      by: ['zone'],
      where: {
        dataSource: 'clikalia',
      },
      _count: true,
    });

    // Última actualización
    const lastProperty = await prisma.soldProperty.findFirst({
      where: {
        dataSource: 'clikalia',
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
      },
    });

    return NextResponse.json({
      totalProperties: clikaLiaProperties,
      byZone: byZone.map(z => ({ zone: z.zone, count: z._count })),
      lastUpdate: lastProperty?.createdAt,
    });
  } catch (error: any) {
    console.error('Error getting Clikalia stats:', error);
    return NextResponse.json(
      { error: 'Failed to get statistics' },
      { status: 500 }
    );
  }
}
