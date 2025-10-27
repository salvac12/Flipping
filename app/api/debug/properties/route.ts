import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

/**
 * GET /api/debug/properties - Debug endpoint para ver todas las propiedades sin filtros
 */
export async function GET(req: NextRequest) {
  try {
    // Obtener TODAS las propiedades sin filtros
    const allProperties = await prisma.property.findMany({
      select: {
        id: true,
        title: true,
        price: true,
        m2: true,
        score: true,
        zone: true,
        portal: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const stats = {
      total: allProperties.length,
      byStatus: {
        ACTIVE: allProperties.filter(p => p.status === 'ACTIVE').length,
        SOLD: allProperties.filter(p => p.status === 'SOLD').length,
        REMOVED: allProperties.filter(p => p.status === 'REMOVED').length,
        ARCHIVED: allProperties.filter(p => p.status === 'ARCHIVED').length,
      },
      byPortal: {
        IDEALISTA: allProperties.filter(p => p.portal === 'IDEALISTA').length,
        FOTOCASA: allProperties.filter(p => p.portal === 'FOTOCASA').length,
        PISOS_COM: allProperties.filter(p => p.portal === 'PISOS_COM').length,
      },
      scoreDistribution: {
        score_0: allProperties.filter(p => p.score === 0).length,
        score_1_20: allProperties.filter(p => p.score > 0 && p.score <= 20).length,
        score_21_40: allProperties.filter(p => p.score > 20 && p.score <= 40).length,
        score_41_60: allProperties.filter(p => p.score > 40 && p.score <= 60).length,
        score_61_80: allProperties.filter(p => p.score > 60 && p.score <= 80).length,
        score_81_100: allProperties.filter(p => p.score > 80 && p.score <= 100).length,
      },
      avgScore: allProperties.length > 0
        ? (allProperties.reduce((sum, p) => sum + p.score, 0) / allProperties.length).toFixed(2)
        : 0,
    };

    return NextResponse.json({
      stats,
      properties: allProperties,
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { error: 'Error obteniendo propiedades', details: (error as Error).message },
      { status: 500 }
    );
  }
}
