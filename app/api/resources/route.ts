
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { verifyAuth } from '../../../lib/auth';

const LEVELS: Record<string, number> = {
    'PUBLIC': 0,
    'INTERNAL': 1,
    'CONFIDENTIAL': 2
};

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const auth = await verifyAuth(authHeader);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = auth.user;
    const userClearance = user.clearance || 'INTERNAL';
    const userLevel = LEVELS[userClearance] ?? 1;

    // Admin sees all
    if (user.isAdmin) {
        const resources = await prisma.resource.findMany({
            include: { owner: { select: { email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ resources });
    }

    // MAC Enforcement: Fetch only resources with level <= user clearance
    // 1. Determine allowed levels string list
    const allowedLevels = Object.keys(LEVELS).filter(lvl => (LEVELS[lvl] ?? 1) <= userLevel);

    // 2. Query resources
    const resources = await prisma.resource.findMany({
        where: {
            confidentialityLevel: { in: allowedLevels }
        },
        include: { owner: { select: { email: true } } },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ resources });
}

export async function POST(req: Request) {
    const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const auth = await verifyAuth(authHeader);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { name, type, level } = await req.json();
        if (!name || !type) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        // Validate Level
        const requestedLevel = level || 'INTERNAL';
        if (!(requestedLevel in LEVELS)) {
            return NextResponse.json({ error: 'Invalid security level' }, { status: 400 });
        }

        const resource = await prisma.resource.create({
            data: {
                name,
                type,
                ownerId: auth.user.id,
                confidentialityLevel: requestedLevel,
                tags: "{}"
            },
        });

        return NextResponse.json({ resource });
    } catch (e) {
        console.error('Create resource error', e);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
