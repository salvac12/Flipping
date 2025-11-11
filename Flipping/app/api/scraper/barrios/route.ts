import { NextResponse } from 'next/server';
import {
  getAllBarrios,
  getDistritos,
  getBarriosByDistrito,
  getBarriosByZona,
  BARRIOS_MADRID,
} from '@/lib/utils/madrid-barrios';
import { MADRID_ZONES } from '@/lib/utils/zones';

/**
 * GET /api/scraper/barrios - Obtener lista de barrios disponibles para scraping
 *
 * Query params opcionales:
 * - distrito: Filtrar por distrito
 * - zona: Filtrar por zona prioritaria
 *
 * Ejemplos:
 * GET /api/scraper/barrios
 * GET /api/scraper/barrios?distrito=Salamanca
 * GET /api/scraper/barrios?zona=RETIRO
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const distritoFilter = searchParams.get('distrito');
    const zonaFilter = searchParams.get('zona');

    let barrios = getAllBarrios();

    // Aplicar filtros
    if (distritoFilter) {
      barrios = getBarriosByDistrito(distritoFilter);
    } else if (zonaFilter) {
      barrios = getBarriosByZona(zonaFilter);
    }

    // Agrupar por distrito para mejor organización
    const barriosByDistrito = barrios.reduce((acc, barrio) => {
      if (!acc[barrio.distrito]) {
        acc[barrio.distrito] = [];
      }
      acc[barrio.distrito].push(barrio);
      return acc;
    }, {} as Record<string, typeof barrios>);

    return NextResponse.json({
      success: true,
      total: barrios.length,
      distritos: getDistritos(),
      zonasPrioritarias: Object.keys(MADRID_ZONES),
      barrios: barrios.map(b => ({
        key: b.nombre,
        displayName: b.displayName,
        slug: b.slug,
        zona: b.zona,
        distrito: b.distrito,
      })),
      barriosByDistrito: Object.entries(barriosByDistrito).map(([distrito, items]) => ({
        distrito,
        count: items.length,
        barrios: items.map(b => ({
          key: b.nombre,
          displayName: b.displayName,
          zona: b.zona,
        })),
      })),
    });
  } catch (error) {
    console.error('Error obteniendo barrios:', error);
    return NextResponse.json(
      { error: 'Error obteniendo barrios', details: (error as Error).message },
      { status: 500 }
    );
  }
}
