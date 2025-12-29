
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Create a new request
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, requestedRoleName, reason } = body;

        const request = await prisma.roleRequest.create({
            data: {
                userId,
                requestedRoleName,
                reason,
                status: 'PENDING'
            }
        });

        return NextResponse.json(request);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
    }
}

// Get all requests (for admin)
export async function GET() {
    try {
        const requests = await prisma.roleRequest.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(requests);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }
}
