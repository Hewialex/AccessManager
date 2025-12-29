import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyAuth } from '../../../../lib/auth';
import { checkMAC } from '../../../../lib/access';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const auth = await verifyAuth(authHeader);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resource = await prisma.resource.findUnique({
    where: { id: params.id },
  });

  if (!resource) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

  // Explicit MAC Check
  const allowed = await checkMAC(auth.user.id, resource.id);

  if (!allowed) {
    return NextResponse.json({
      error: 'ACCESS DENIED: Insufficient Security Clearance',
      userLevel: auth.user.clearance,
      requiredLevel: resource.confidentialityLevel
    }, { status: 403 });
  }

  return NextResponse.json({
    resource,
    content: "This is the secure content of the file. If you can read this, your clearance is sufficient."
  });
}
