import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      surface,
      rooms,
      bathrooms,
      floor,
      isExterior,
      hasLift,
      condition,
      address,
      zone,
      isPenthouse,
      hasGarage,
      hasPool,
      analysisId,
    } = body;

    // Validar datos requeridos
    if (!surface || !zone) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: superficie y zona' },
        { status: 400 }
      );
    }

    // Estimación simplificada basada en zona y características
    const surfaceNum = parseFloat(surface);

    // Precios base por zona (€/m²) - valores aproximados de Madrid
    const zoneBasePrices: Record<string, number> = {
      'Salamanca': 5500,
      'Chamberí': 5000,
      'Retiro': 4800,
      'Chamartín': 4500,
      'Moncloa': 4300,
      'Argüelles': 4200,
      'Prosperidad': 4000,
      'Guindalera': 3800,
      'Delicias': 3600,
      'Pacífico': 3700,
      'Tetuán': 3500,
      'Arganzuela': 3600,
      'Carabanchel': 2800,
      'Usera': 2500,
      'Villaverde': 2400,
      'Puente de Vallecas': 2600,
      'Moratalaz': 2900,
      'Ciudad Lineal': 3200,
      'Hortaleza': 3300,
      'Villa de Vallecas': 2700,
      'Vicálvaro': 2500,
      'San Blas': 2800,
      'Barajas': 3000,
    };

    // Obtener precio base o usar promedio si no está la zona
    let basePrice = zoneBasePrices[zone] || 3500;

    // Ajustes por características
    if (condition === 'reformed') {
      basePrice *= 1.15; // +15% si está reformado
    } else if (condition === 'needs_reform') {
      basePrice *= 0.85; // -15% si necesita reforma
    }

    if (isExterior) {
      basePrice *= 1.10; // +10% si es exterior
    }

    if (hasLift) {
      basePrice *= 1.05; // +5% si tiene ascensor
    }

    if (floor !== undefined) {
      if (floor === 0) {
        basePrice *= 0.90; // -10% si es bajo
      } else if (floor >= 3) {
        basePrice *= 1.08; // +8% si es 3º o superior
      }
    }

    if (isPenthouse) {
      basePrice *= 1.20; // +20% si es ático
    }

    if (hasGarage) {
      basePrice *= 1.10; // +10% si tiene garaje
    }

    if (hasPool) {
      basePrice *= 1.05; // +5% si tiene piscina
    }

    // Ajuste por tamaño
    if (surfaceNum < 60) {
      basePrice *= 1.10; // Pisos pequeños tienen mayor precio/m²
    } else if (surfaceNum > 150) {
      basePrice *= 0.95; // Pisos grandes tienen menor precio/m²
    }

    // Calcular precios
    const avgPrice = Math.round(basePrice * surfaceNum);
    const minPrice = Math.round(avgPrice * 0.90); // -10%
    const maxPrice = Math.round(avgPrice * 1.10); // +10%

    // Crear resultado de estimación
    const result = {
      minPrice,
      avgPrice,
      maxPrice,
      minPricePerM2: Math.round(minPrice / surfaceNum),
      avgPricePerM2: Math.round(basePrice),
      maxPricePerM2: Math.round(maxPrice / surfaceNum),
      confidence: 65, // Confianza media sin comparables reales
      comparables: [],
      comparablesCount: 0,
      method: 'MANUAL',
      notes: `Estimación basada en valores promedio de mercado para la zona ${zone}. Para mayor precisión, se recomienda analizar comparables reales del mercado.`
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error en estimación de precio:', error);
    return NextResponse.json(
      {
        error: 'Error al estimar el precio',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// GET para obtener estimaciones previas
export async function GET(request: NextRequest) {
  try {
    // TODO: Restaurar autenticación cuando se corrija el auth
    // const session = await auth();
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('analysisId');

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Se requiere analysisId' },
        { status: 400 }
      );
    }

    // Buscar estimaciones previas
    // TODO: Agregar filtro por usuario cuando se restaure la autenticación
    const estimations = await prisma.priceEstimation.findMany({
      where: {
        analysisId,
      },
      include: {
        comparables: {
          take: 5,
          orderBy: { weight: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (estimations.length === 0) {
      return NextResponse.json(null);
    }

    return NextResponse.json(estimations[0]);
  } catch (error) {
    console.error('Error obteniendo estimaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener estimaciones' },
      { status: 500 }
    );
  }
}