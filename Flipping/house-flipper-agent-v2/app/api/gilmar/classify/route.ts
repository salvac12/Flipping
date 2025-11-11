import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/gilmar/classify
 *
 * Obtiene todas las propiedades de Gilmar que necesitan clasificación de reforma
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener TODAS las propiedades de Gilmar (filtraremos por zona en el frontend)
    // Incluir tanto clasificadas como no clasificadas para poder reclasificar
    const properties = await prisma.soldProperty.findMany({
      where: {
        dataSource: 'gilmar',
      },
      orderBy: [
        { zone: 'asc' }, // Agrupar por zona
        { wasReformed: 'asc' }, // Priorizar no clasificadas (null/false primero)
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      total: properties.length,
      properties: properties.map(p => ({
        id: p.id,
        url: p.url,
        address: p.address,
        price: p.salePrice,
        pricePerM2: p.salePricePerM2,
        surface: p.surface,
        rooms: p.rooms,
        floor: p.floor,
        wasReformed: p.wasReformed,
        reformQuality: p.reformQuality,
        condition: p.condition,
        zone: p.zone,
      })),
    });
  } catch (error: any) {
    console.error('Error getting properties to classify:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gilmar/classify
 *
 * Actualiza el estado de reforma de una propiedad
 *
 * Body:
 * {
 *   propertyId: string,
 *   wasReformed: boolean,
 *   reformQuality: 'alta' | 'media' | null,
 *   condition: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, wasReformed, reformQuality, condition } = body;

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Actualizar la propiedad
    const updated = await prisma.soldProperty.update({
      where: { id: propertyId },
      data: {
        wasReformed: wasReformed,
        reformQuality: reformQuality,
        condition: condition || (wasReformed ? 'reformado' : 'original'),
        notes: `Clasificación manual de reforma: ${wasReformed ? reformQuality : 'sin reformar'}`,
      },
    });

    return NextResponse.json({
      success: true,
      property: updated,
    });
  } catch (error: any) {
    console.error('Error updating property classification:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
