import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';

const favoriteSchema = z.object({
  propertyId: z.string(),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  decision: z.enum(['INTERESTED', 'VISIT_SCHEDULED', 'DISCARDED', 'OFFER_MADE', 'PURCHASED']).optional(),
});

/**
 * POST /api/favorites - Agregar propiedad a favoritos
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = favoriteSchema.parse(body);

    // Verificar que la propiedad existe
    const property = await prisma.property.findUnique({
      where: { id: validatedData.propertyId },
    });

    if (!property) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
    }

    // Crear o actualizar favorito
    const favorite = await prisma.userFavorite.upsert({
      where: {
        userId_propertyId: {
          userId: session.user.id,
          propertyId: validatedData.propertyId,
        },
      },
      update: {
        notes: validatedData.notes,
        rating: validatedData.rating,
        decision: validatedData.decision,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        propertyId: validatedData.propertyId,
        notes: validatedData.notes,
        rating: validatedData.rating,
        decision: validatedData.decision,
      },
      include: {
        property: true,
      },
    });

    return NextResponse.json(favorite);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 });
    }

    console.error('Error agregando favorito:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * GET /api/favorites - Obtener favoritos del usuario
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const favorites = await prisma.userFavorite.findMany({
      where: { userId: session.user.id },
      include: {
        property: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Error obteniendo favoritos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
