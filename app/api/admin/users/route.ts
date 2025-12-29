import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcrypt';
import { verifyAuth } from '../../../../lib/auth';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const auth = await verifyAuth(authHeader);
  if (!auth || !(auth.user as any).isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      roleId: true,
      clearance: true,
      isAdmin: true,
      isLocked: true,
      mfaEnabled: true,
      attributes: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const auth = await verifyAuth(authHeader);
  if (!auth || !(auth.user as any).isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await req.json();
  const { email, password, roleId, clearance, isAdmin, attributes, name } = body as any;
  if (!email || !password || !roleId) return NextResponse.json({ error: 'missing fields' }, { status: 400 });

  const hash = await bcrypt.hash(password, 12); // Use 12 rounds for better security as requested

  // Ensure we match the Seeded role name if ID not provided (logic fallback could be here, but ID preferred)
  // We assume roleId is passed from frontend selection.

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        name: name || 'User',
        role: { connect: { id: roleId } },
        clearance: clearance ?? 'INTERNAL',
        isAdmin: !!isAdmin,
        attributes: attributes ? JSON.stringify(attributes) : '{}',
        isLocked: false,
        mfaEnabled: false
      }
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Creation failed, email likely exists' }, { status: 400 });
  }
}
