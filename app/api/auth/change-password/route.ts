import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { comparePassword, hashPassword } from '@/lib/auth';

/**
 * POST /api/auth/change-password
 * Cambia la contraseña del usuario autenticado.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Contraseña actual y nueva son requeridas' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    const user = await queryOne('SELECT id, password FROM users WHERE id = $1', [
      parseInt(userId, 10),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'La contraseña actual es incorrecta' },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(newPassword);
    await query('UPDATE users SET password = $1 WHERE id = $2', [newHash, user.id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en POST /api/auth/change-password:', error);
    return NextResponse.json(
      { error: 'Error al cambiar la contraseña' },
      { status: 500 }
    );
  }
}
