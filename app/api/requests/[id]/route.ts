
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const { action } = await req.json(); // 'APPROVE' or 'DENY'
        const requestId = params.id;

        const request = await prisma.roleRequest.findUnique({ where: { id: requestId } });
        if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

        if (action === 'APPROVE') {
            // Updated user role
            const targetRole = await prisma.role.findUnique({ where: { name: request.requestedRoleName } });
            if (targetRole) {
                await prisma.user.update({
                    where: { id: request.userId },
                    data: { roleId: targetRole.id }
                });
            }
        }

        const updated = await prisma.roleRequest.update({
            where: { id: requestId },
            data: { status: action === 'APPROVE' ? 'APPROVED' : 'DENIED' }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
