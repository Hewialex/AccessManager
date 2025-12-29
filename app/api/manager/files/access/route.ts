
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// POST: Log access
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { resourceId, userId, action } = body; // action = 'OPEN'

        await prisma.auditLog.create({
            data: {
                action: `${action} Resource: ${resourceId}`,
                userId,
                ip: '127.0.0.1' // Mock IP
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to log access' }, { status: 500 });
    }
}

// GET: Fetch logs for a resource (for Owner)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get('resourceId');
    const ownerId = searchParams.get('ownerId');

    if (!resourceId || !ownerId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const resource = await prisma.resource.findUnique({
        where: { id: resourceId }
    });

    if (!resource || resource.ownerId !== ownerId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const logs = await prisma.auditLog.findMany({
        where: {
            action: { contains: `Resource: ${resourceId}` }
        },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(logs);
}
