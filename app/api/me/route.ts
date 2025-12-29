import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../lib/auth';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const auth = await verifyAuth(authHeader);
  if (!auth) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const user = auth.user;
  return NextResponse.json({ user });
}
