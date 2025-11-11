import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';

/**
 * GET /api/analysis/[id] - Obtener análisis específico
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const analysis = await prisma.flippingAnalysis.findUnique({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        property: true
      }
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Análisis no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Error al obtener análisis' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/analysis/[id] - Actualizar análisis
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    const analysis = await prisma.flippingAnalysis.update({
      where: {
        id: params.id,
        userId: session.user.id
      },
      data: {
        name: body.name,
        notes: body.notes,
        purchasePrice: body.purchasePrice,
        salePrice: body.salePrice,
        surface: body.surface,
        duration: body.duration,
        location: body.location,
        calculations: body.calculations,
        parameters: body.parameters,
        totalInvestment: body.totalInvestment,
        netProfit: body.netProfit,
        roi: body.roi,
        viable: body.viable
      }
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error updating analysis:', error);
    return NextResponse.json(
      { error: 'Error al actualizar análisis' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/analysis/[id] - Eliminar análisis
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await prisma.flippingAnalysis.delete({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return NextResponse.json(
      { error: 'Error al eliminar análisis' },
      { status: 500 }
    );
  }
}