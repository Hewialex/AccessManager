
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { resourceId, granteeId, permission, grantedBy } = body;

        const acl = await prisma.resourceACL.create({
            data: {
                resourceId,
                granteeId,
                permission, // 'READ', 'WRITE'
                grantedBy
            }
        });
        return NextResponse.json(acl);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to share file' }, { status: 500 });
    }
}
