import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyAuth } from '../../../../lib/auth';
import { createAuditLog } from '../../../../lib/audit';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const auth = await verifyAuth(authHeader);
  if (!auth || !(auth.user as any).isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const labels = await (prisma as any).securityLabel.findMany({ orderBy: { level: 'asc' } });
  return NextResponse.json({ labels });
}

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const auth = await verifyAuth(authHeader);
  if (!auth || !(auth.user as any).isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await req.json();
  const { name, level, description } = body as any;
  if (!name || !level) return NextResponse.json({ error: 'missing fields' }, { status: 400 });

  // Normalize level
  const allowed = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL'];
  const lvl = String(level).toUpperCase();
  if (!allowed.includes(lvl)) return NextResponse.json({ error: 'invalid level' }, { status: 400 });

  const label = await (prisma as any).securityLabel.create({ data: { name, level: lvl, description } });
  // record audit for admin action
  try {
    await createAuditLog({ userId: (auth.user as any).id, action: `LABEL_CREATE:${label.id}:${label.name}:${label.level}`, ip: req.headers.get('x-forwarded-for') ?? 'unknown' });
  } catch (e) {
    console.warn('audit log failed', e);
  }

  return NextResponse.json({ label }, { status: 201 });
}
