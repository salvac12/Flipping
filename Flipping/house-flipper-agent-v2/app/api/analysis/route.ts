import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';

/**
 * GET /api/analysis - Obtener todos los análisis del usuario
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const analyses = await prisma.flippingAnalysis.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            url: true,
            portal: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ analyses });
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json(
      { error: 'Error al obtener análisis' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analysis - Crear nuevo análisis
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    const {
      name,
      notes,
      propertyId,
      purchasePrice,
      salePrice,
      surface,
      duration,
      location,
      calculations,
      parameters,
      totalInvestment,
      netProfit,
      roi,
      viable
    } = body;

    const analysis = await prisma.flippingAnalysis.create({
      data: {
        userId: session.user.id,
        propertyId: propertyId || null,
        name: name || `Análisis ${location} - ${new Date().toLocaleDateString('es-ES')}`,
        notes: notes || null,
        purchasePrice,
        salePrice,
        surface,
        duration,
        location,
        calculations,
        parameters,
        totalInvestment,
        netProfit,
        roi,
        viable
      }
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error creating analysis:', error);
    return NextResponse.json(
      { error: 'Error al crear análisis' },
      { status: 500 }
    );
  }
}