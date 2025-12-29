
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcrypt';
import { signJwt } from '../../../../lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return new Response('Missing', { status: 400 });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return new Response('Invalid', { status: 401 });

    // Security check
    if (user.isLocked) return new Response('Account Locked', { status: 403 });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return new Response('Invalid', { status: 401 });
    const token = signJwt(user.id, '1h');
    return new Response(JSON.stringify({ token }), { status: 200 });
  } catch (err) {
    console.error('login error', err);
    return new Response('Internal', { status: 500 });
  }
}
