
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    try {
        // Fetch resources owned by the user OR shared with the user
        const resources = await prisma.resource.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { acls: { some: { granteeId: userId } } }
                ]
            },
            include: {
                owner: { select: { name: true } },
                acls: { include: { resource: true } } // Fetch ACLs to see who has access
            }
        });
        return NextResponse.json(resources);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, type, ownerId, confidentialityLevel } = body;

        const resource = await prisma.resource.create({
            data: {
                name,
                type,
                ownerId,
                confidentialityLevel: confidentialityLevel || 'INTERNAL',
            }
        });
        return NextResponse.json(resource);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create file' }, { status: 500 });
    }
}
