import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

/**
 * GET /api/stats - Simple stats endpoint (no auth for debugging)
 */
export async function GET(req: NextRequest) {
  try {
    // Count all properties (including all statuses)
    const total = await prisma.property.count();

    // Count by each status
    const totalActive = await prisma.property.count({ where: { status: 'ACTIVE' } });
    const totalSold = await prisma.property.count({ where: { status: 'SOLD' } });
    const totalRemoved = await prisma.property.count({ where: { status: 'REMOVED' } });
    const totalArchived = await prisma.property.count({ where: { status: 'ARCHIVED' } });

    // Get ALL properties with basic info (no limit, all statuses)
    const allProps = await prisma.property.findMany({
      select: {
        id: true,
        title: true,
        price: true,
        m2: true,
        score: true,
        status: true,
        portal: true,
        zone: true,
        url: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`📊 Total properties in DB: ${total}`);

    const stats = {
      total,
      byStatus: {
        ACTIVE: allProps.filter(p => p.status === 'ACTIVE').length,
        SOLD: allProps.filter(p => p.status === 'SOLD').length,
        REMOVED: allProps.filter(p => p.status === 'REMOVED').length,
        ARCHIVED: allProps.filter(p => p.status === 'ARCHIVED').length,
      },
      byPortal: {
        IDEALISTA: allProps.filter(p => p.portal === 'IDEALISTA').length,
        FOTOCASA: allProps.filter(p => p.portal === 'FOTOCASA').length,
        PISOS_COM: allProps.filter(p => p.portal === 'PISOS_COM').length,
      },
      scoreRanges: {
        score_0: allProps.filter(p => p.score === 0).length,
        score_1_20: allProps.filter(p => p.score > 0 && p.score <= 20).length,
        score_21_40: allProps.filter(p => p.score > 20 && p.score <= 40).length,
        score_41_60: allProps.filter(p => p.score > 40 && p.score <= 60).length,
        score_61_80: allProps.filter(p => p.score > 60 && p.score <= 80).length,
        score_81_100: allProps.filter(p => p.score > 80 && p.score <= 100).length,
      },
      avgScore: allProps.length > 0
        ? (allProps.reduce((sum, p) => sum + p.score, 0) / allProps.length).toFixed(2)
        : 0,
      allProperties: allProps.map(p => ({
        title: p.title?.substring(0, 50),
        price: p.price,
        m2: p.m2,
        score: p.score,
        status: p.status,
        portal: p.portal,
        zone: p.zone,
        url: p.url?.substring(0, 80),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in stats endpoint:', error);
    return NextResponse.json(
      {
        error: 'Error obteniendo estadísticas',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
