import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export async function verifyAuth(token: string | undefined) {
  // 1. Try JWT
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (user) return { user, payload };
    } catch (err) {
      // ignore invalid token, try cookie next
    }
  }

  // 2. Try Cookie (Dev/Demo Mode)
  try {
    const cookieStore = cookies();
    const demoUserId = cookieStore.get('x-user-id')?.value;
    if (demoUserId) {
      const user = await prisma.user.findUnique({ where: { id: demoUserId } });
      if (user) return { user, payload: { sub: user.id } };
    }
  } catch (e) {
    console.log('Cookie read error (likely in edge runtime or similar)', e);
  }

  return null;
}

export function signJwt(userId: string, expiresIn = '15m') {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn });
}
