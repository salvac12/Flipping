import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';

/**
 * GET /api/debug/properties - Debug endpoint para ver todas las propiedades sin filtros
 */
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('🔍 Debug endpoint: Iniciando consulta a base de datos...');

    // Verificar conexión a Prisma
    try {
      await prisma.$connect();
      console.log('✅ Conexión a base de datos exitosa');
    } catch (dbError) {
      console.error('❌ Error conectando a base de datos:', dbError);
      return NextResponse.json({
        error: 'Error de conexión a base de datos',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }

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

    console.log(`✅ Debug endpoint: ${allProperties.length} propiedades encontradas`);

    return NextResponse.json({
      stats,
      properties: allProperties,
    });
  } catch (error) {
    console.error('❌ Error in debug endpoint:', error);

    // Detalle completo del error
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    };

    return NextResponse.json(
      {
        error: 'Error obteniendo propiedades',
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
