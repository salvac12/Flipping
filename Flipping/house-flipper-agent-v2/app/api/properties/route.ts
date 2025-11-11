import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';

// Schema de validación para filtros
const filtersSchema = z.object({
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minM2: z.number().optional(),
  maxM2: z.number().optional(),
  minScore: z.number().optional(),
  zones: z.array(z.string()).optional(),
  portal: z.enum(['IDEALISTA', 'FOTOCASA', 'PISOS_COM']).optional(),
  needsReform: z.boolean().optional(),
  isExterior: z.boolean().optional(),
  minFloor: z.number().optional(),
  orderBy: z.enum(['score', 'price', 'pricePerM2', 'createdAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
});

/**
 * GET /api/properties - Obtener propiedades con filtros
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Extraer parámetros de búsqueda
    const searchParams = req.nextUrl.searchParams;

    const filters = {
      minPrice: searchParams.get('minPrice') !== null ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') !== null ? Number(searchParams.get('maxPrice')) : undefined,
      minM2: searchParams.get('minM2') !== null ? Number(searchParams.get('minM2')) : undefined,
      maxM2: searchParams.get('maxM2') !== null ? Number(searchParams.get('maxM2')) : undefined,
      minScore: searchParams.get('minScore') !== null ? Number(searchParams.get('minScore')) : undefined,
      zones: searchParams.get('zones') ? searchParams.get('zones')!.split(',') : undefined,
      portal: searchParams.get('portal') || undefined, // Convert null to undefined
      needsReform: searchParams.get('needsReform') === 'true' ? true : undefined,
      isExterior: searchParams.get('isExterior') === 'true' ? true : undefined,
      minFloor: searchParams.get('minFloor') !== null ? Number(searchParams.get('minFloor')) : undefined,
      orderBy: (searchParams.get('orderBy') || 'score') as any,
      order: (searchParams.get('order') || 'desc') as any,
      limit: searchParams.get('limit') !== null ? Number(searchParams.get('limit')) : 50,
      offset: searchParams.get('offset') !== null ? Number(searchParams.get('offset')) : 0,
    };

    // Validar filtros con manejo de errores
    let validatedFilters;
    try {
      validatedFilters = filtersSchema.parse(filters);
    } catch (error) {
      console.error('Validation error:', error);
      return NextResponse.json(
        { error: 'Parámetros de filtro inválidos', details: error },
        { status: 400 }
      );
    }

    // Construir where clause
    const where: any = {
      // TEMPORAL: Comentado para debug - descomentar después
      // status: 'ACTIVE',
    };

    if (validatedFilters.minPrice) {
      where.price = { ...where.price, gte: validatedFilters.minPrice };
    }

    if (validatedFilters.maxPrice) {
      where.price = { ...where.price, lte: validatedFilters.maxPrice };
    }

    if (validatedFilters.minM2) {
      where.m2 = { ...where.m2, gte: validatedFilters.minM2 };
    }

    if (validatedFilters.maxM2) {
      where.m2 = { ...where.m2, lte: validatedFilters.maxM2 };
    }

    if (validatedFilters.minScore) {
      where.score = { gte: validatedFilters.minScore };
    }

    if (validatedFilters.zones && validatedFilters.zones.length > 0) {
      where.zone = { in: validatedFilters.zones };
    }

    if (validatedFilters.portal) {
      where.portal = validatedFilters.portal;
    }

    if (validatedFilters.needsReform !== undefined) {
      where.needsReform = validatedFilters.needsReform;
    }

    if (validatedFilters.isExterior !== undefined) {
      where.isExterior = validatedFilters.isExterior;
    }

    if (validatedFilters.minFloor) {
      where.floor = { gte: validatedFilters.minFloor };
    }

    // Obtener propiedades
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy: {
          [validatedFilters.orderBy!]: validatedFilters.order,
        },
        take: validatedFilters.limit,
        skip: validatedFilters.offset,
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      properties,
      total,
      limit: validatedFilters.limit,
      offset: validatedFilters.offset,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Filtros inválidos', details: error.errors }, { status: 400 });
    }

    console.error('Error obteniendo propiedades:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
