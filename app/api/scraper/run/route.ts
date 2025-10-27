import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { scrapeAllPortals } from '@/lib/scraper';

/**
 * POST /api/scraper/run - Ejecutar scraping manual de todos los portales
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const maxPagesPerZone = body.maxPagesPerZone || 2;

    console.log('🚀 Iniciando scraping manual...');

    // Ejecutar scraping
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
