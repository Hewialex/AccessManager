
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET: Fetch pending requests for Manager's department
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get('managerId');

    if (!managerId) return NextResponse.json({ error: 'Manager ID required' }, { status: 400 });

    try {
        const manager = await prisma.user.findUnique({ where: { id: managerId } });
        if (!manager?.department) return NextResponse.json({ error: 'Manager has no department' }, { status: 400 });

        // Find requests from users in same department, status PENDING
        const requests = await prisma.roleRequest.findMany({
            where: {
                status: 'PENDING',
                user: {
                    department: manager.department,
                    NOT: { id: managerId } // Don't approve own requests?
                }
            },
            include: { user: true }
        });

        return NextResponse.json(requests);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }
}

// POST: Recommend a request
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { requestId, managerId, recommendation, action } = body; // action = 'RECOMMEND' | 'REJECT'

        if (action === 'REJECT') {
            await prisma.roleRequest.update({
                where: { id: requestId },
                data: { status: 'DENIED', reason: `Rejected by Manager: ${recommendation}` }
            });
            return NextResponse.json({ success: true });
        }

        // Action RECOMMEND
        await prisma.roleRequest.update({
            where: { id: requestId },
            data: {
                status: 'RECOMMENDED',
                managerId,
                recommendation
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
