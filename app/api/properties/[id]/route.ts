import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';

/**
 * GET /api/properties/[id] - Obtener una propiedad específica
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const params = await context.params;

    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        history: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        favorites: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error obteniendo propiedad:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
