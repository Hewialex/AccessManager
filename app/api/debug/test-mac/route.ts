import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { checkMAC } from '../../../../lib/access';

// POST /api/debug/test-mac
// Body: { userId: string, resourceId: string }
export async function POST(req: Request) {
    try {
        const { userId, resourceId } = await req.json();

        if (!userId || !resourceId) {
            return NextResponse.json({ error: 'Missing userId or resourceId' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        const resource = await (prisma as any).resource.findUnique({
            where: { id: resourceId },
            include: { label: true }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        if (!resource) return NextResponse.json({ error: 'Resource not found' }, { status: 404 });

        const allowed = await checkMAC(userId, resourceId);

        return NextResponse.json({
            allowed,
            userClearance: user.clearance,
            resourceLevel: resource.label?.level || 'INTERNAL (default)',
            resourceLabel: resource.label?.name,
            debug: {
                userId: user.id,
                resourceId: resource.id
            }
        });

    } catch (error) {
        console.warn('MAC Test Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
