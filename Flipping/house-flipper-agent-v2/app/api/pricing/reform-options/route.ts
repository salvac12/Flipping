import { NextRequest, NextResponse } from 'next/server';
import { getAvailableReformOptions } from '@/lib/pricing/reform-cost-estimator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/pricing/reform-options?surface=120&zone=GUINDALERA
 *
 * Obtiene todas las opciones de reforma disponibles con sus costes estimados
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const surface = parseFloat(searchParams.get('surface') || '0');
    const zone = searchParams.get('zone') || undefined;

    if (!surface || surface <= 0) {
      return NextResponse.json(
        { error: 'Valid surface parameter is required' },
        { status: 400 }
      );
    }

    const reformOptions = await getAvailableReformOptions(surface, zone);

    return NextResponse.json(
      {
        surface,
        zone,
        options: reformOptions,
        count: reformOptions.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching reform options:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch reform options',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
