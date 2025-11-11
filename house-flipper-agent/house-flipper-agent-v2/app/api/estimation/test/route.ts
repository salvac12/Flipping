import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Respuesta de prueba simple
    const mockEstimation = {
      minPrice: body.surface ? body.surface * 3500 : 300000,
      avgPrice: body.surface ? body.surface * 4000 : 350000,
      maxPrice: body.surface ? body.surface * 4500 : 400000,
      minPricePerM2: 3500,
      avgPricePerM2: 4000,
      maxPricePerM2: 4500,
      confidence: 75,
      comparables: [],
      method: 'MANUAL',
      notes: 'Estimación básica de prueba basada en valores promedio de mercado'
    };

    return NextResponse.json(mockEstimation);
  } catch (error) {
    console.error('Error en estimación de prueba:', error);
    return NextResponse.json(
      { error: 'Error al procesar la estimación' },
      { status: 500 }
    );
  }
}