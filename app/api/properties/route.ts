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
  limit: z.number().min(1).max(100).optional(),
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
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      minM2: searchParams.get('minM2') ? Number(searchParams.get('minM2')) : undefined,
      maxM2: searchParams.get('maxM2') ? Number(searchParams.get('maxM2')) : undefined,
      minScore: searchParams.get('minScore') ? Number(searchParams.get('minScore')) : undefined,
      zones: searchParams.get('zones') ? searchParams.get('zones')!.split(',') : undefined,
      portal: searchParams.get('portal') as any,
      needsReform: searchParams.get('needsReform') === 'true' ? true : undefined,
      isExterior: searchParams.get('isExterior') === 'true' ? true : undefined,
      minFloor: searchParams.get('minFloor') ? Number(searchParams.get('minFloor')) : undefined,
      orderBy: (searchParams.get('orderBy') as any) || 'score',
      order: (searchParams.get('order') as any) || 'desc',
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 50,
      offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
    };

    // Validar filtros
    const validatedFilters = filtersSchema.parse(filters);

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
