import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyAuth } from '../../../../lib/auth';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const auth = await verifyAuth(authHeader);
  if (!auth || !(auth.user as any).isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  let roles = await prisma.role.findMany({ include: { permissions: { include: { permission: true } } } });

  // Lazy seed if missing
  if (roles.length === 0) {
    const defaults = ['Admin', 'Manager', 'Employee'];
    for (const name of defaults) {
      await prisma.role.create({ data: { name } });
    }
    roles = await prisma.role.findMany({ include: { permissions: { include: { permission: true } } } });
  }

  return NextResponse.json({ roles });
}

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const auth = await verifyAuth(authHeader);
  if (!auth || !(auth.user as any).isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await req.json();
  const { name } = body as any;
  if (!name) return NextResponse.json({ error: 'missing name' }, { status: 400 });

  const role = await prisma.role.create({ data: { name } });
  return NextResponse.json({ role }, { status: 201 });
}
