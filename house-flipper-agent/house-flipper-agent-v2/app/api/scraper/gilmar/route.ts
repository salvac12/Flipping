import { NextRequest, NextResponse } from 'next/server';
import { scrapeAllGilmarMadrid } from '@/lib/scraper/gilmar-full-scraper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 600; // 10 minutos

/**
 * POST /api/scraper/gilmar
 *
 * Ejecuta el scraper COMPLETO de Gilmar para obtener TODAS las propiedades en Madrid
 *
 * Body (opcional):
 * {
 *   maxProperties?: number,  // Máximo de propiedades a procesar (default: 200)
 *   maxPages?: number        // Máximo de páginas a revisar (default: 20)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { maxProperties, maxPages } = body;

    console.log('🚀 Starting Gilmar full scraper via API...');

    const result = await scrapeAllGilmarMadrid({
      maxProperties: maxProperties || 200,
      maxPages: maxPages || 20,
    });

    return NextResponse.json({
      success: true,
      message: 'Gilmar scraper completed',
      stats: {
        urlsFound: result.totalFound,
        propertiesProcessed: result.totalProcessed,
        saved: result.saved,
        skipped: result.skipped,
        errors: result.errors,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error running Gilmar scraper:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run Gilmar scraper',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/scraper/gilmar
 *
 * Obtiene estadísticas del último scraping de Gilmar
 */
export async function GET(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Contar propiedades de Gilmar
    const gilmarProperties = await prisma.soldProperty.count({
      where: {
        dataSource: 'gilmar',
      },
    });

    // Agrupar por zona
    const byZone = await prisma.soldProperty.groupBy({
      by: ['zone'],
      where: {
        dataSource: 'gilmar',
      },
      _count: true,
    });

    // Última actualización
    const lastProperty = await prisma.soldProperty.findFirst({
      where: {
        dataSource: 'gilmar',
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
      },
    });

    return NextResponse.json({
      totalProperties: gilmarProperties,
      byZone: byZone.map(z => ({ zone: z.zone, count: z._count })),
      lastUpdate: lastProperty?.createdAt,
    });
  } catch (error: any) {
    console.error('Error getting Gilmar stats:', error);
    return NextResponse.json(
      { error: 'Failed to get statistics' },
      { status: 500 }
    );
  }
}
