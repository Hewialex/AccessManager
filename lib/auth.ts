import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export async function verifyAuth(token: string | undefined) {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return null;
    return { user, payload };
  } catch (err) {
    return null;
  }
}

export function signJwt(userId: string, expiresIn = '15m') {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn });
}
