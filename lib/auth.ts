import jwt from 'jsonwebtoken';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

export interface JWTPayload {
  id: number;
  username: string;
  role: 'admin' | 'user';
  nombre: string;
}

export interface UserResponse {
  id: number;
  username: string;
  role: 'admin' | 'user';
  nombre: string;
}

/**
 * Crear un JWT con expiración de 7 días
 */
export function createToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en .env.local');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '7d',
    algorithm: 'HS256',
  });
}

/**
 * Verificar y decodificar un JWT.
 * Usa `jose` (Web Crypto) en lugar de `jsonwebtoken` (Node `crypto`)
 * porque esta función se ejecuta en el middleware, que corre en el
 * runtime Edge y no soporta el módulo `crypto` de Node.
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no está definido');
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
    });

    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error('Error verificando token:', error);
    return null;
  }
}

/**
 * Hash de contraseña con bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Comparar contraseña con hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Extraer token del header Authorization
 */
export function getTokenFromHeader(authHeader?: string | null): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
