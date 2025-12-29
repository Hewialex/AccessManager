
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get('managerId');

    if (!managerId) {
        return NextResponse.json({ error: 'Manager ID required' }, { status: 400 });
    }

    try {
        const manager = await prisma.user.findUnique({
            where: { id: managerId }
        });

        if (!manager || !manager.department) {
            return NextResponse.json({ error: 'Manager or Department not found' }, { status: 404 });
        }

        const team = await prisma.user.findMany({
            where: {
                department: manager.department,
                NOT: { id: managerId } // Exclude self
            },
            include: {
                assignedTasks: true
            }
        });

        return NextResponse.json(team);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
    }
}
