
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Update User
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        const { roleId, clearance, department, jobTitle, attributes } = body;

        const updated = await prisma.user.update({
            where: { id: params.id },
            data: {
                roleId,
                clearance,
                department,
                jobTitle,
                attributes: JSON.stringify(attributes || {})
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
