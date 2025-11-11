import { NextRequest, NextResponse } from 'next/server';
import { scrapeAllPortals } from '@/lib/scraper';

/**
 * GET /api/scraper/daily - Endpoint para Vercel Cron Job (scraping diario automático)
 */
export async function GET(req: NextRequest) {
  try {
    // Verificar que la solicitud venga de Vercel Cron
    const authHeader = req.headers.get('authorization');

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('🕐 Ejecutando scraping diario automático...');

    // Ejecutar scraping con configuración para cron (menos páginas)
    const results = await scrapeAllPortals(2);

    // Aquí se podría agregar lógica para enviar notificaciones
    // sobre nuevas propiedades interesantes

    return NextResponse.json({
      success: true,
      message: 'Scraping diario completado',
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('Error en scraping diario:', error);
    return NextResponse.json(
      { error: 'Error en scraping diario', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export const maxDuration = 300; // 5 minutos máximo
