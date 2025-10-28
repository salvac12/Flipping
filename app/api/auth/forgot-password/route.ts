import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { randomBytes } from 'crypto';

/**
 * POST /api/auth/forgot-password
 * Genera un token de recuperación de contraseña
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Por seguridad, siempre retornamos success aunque el usuario no exista
    // Esto previene que atacantes descubran qué emails existen en el sistema
    if (!user) {
      console.log(`Intento de reset para email no existente: ${email}`);
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, recibirás un enlace de recuperación',
      });
    }

    // Generar token seguro
    const token = randomBytes(32).toString('hex');

    // Expiración: 1 hora desde ahora
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    // Invalidar todos los tokens anteriores del usuario (marcarlos como usados)
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Crear nuevo token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expires,
      },
    });

    // Construir URL de reset
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    // TODO: Aquí deberías enviar un email con el enlace
    // Por ahora solo lo registramos en los logs
    console.log('\n🔐 =================================');
    console.log('📧 ENLACE DE RECUPERACIÓN DE CONTRASEÑA');
    console.log('=================================');
    console.log(`Usuario: ${email}`);
    console.log(`Token: ${token}`);
    console.log(`URL: ${resetUrl}`);
    console.log(`Expira: ${expires.toLocaleString()}`);
    console.log('=================================\n');

    // En producción, aquí enviarías el email
    // const emailSent = await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({
      success: true,
      message: 'Si el email existe, recibirás un enlace de recuperación',
      // En desarrollo, incluimos el token para testing
      ...(process.env.NODE_ENV === 'development' && {
        dev_token: token,
        dev_url: resetUrl
      }),
    });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
