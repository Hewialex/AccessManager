import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { verifyAuth } from '../../../../../lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const auth = await verifyAuth(authHeader);
  if (!auth || !(auth.user as any).isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await req.json();
  const { roleId, clearance, isLocked, mfaEnabled, attributes } = body as any;

  const data: any = {};
  if (roleId !== undefined) data.roleId = roleId;
  if (clearance !== undefined) data.clearance = clearance;
  if (isLocked !== undefined) data.isLocked = isLocked;
  if (mfaEnabled !== undefined) data.mfaEnabled = mfaEnabled;
  if (attributes !== undefined) data.attributes = typeof attributes === 'string' ? attributes : JSON.stringify(attributes);

  try {
    const updated = await prisma.user.update({
      where: { id: params.id },
      data
    });
    return NextResponse.json({ user: updated });
  } catch (e) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
