
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, assigneeId, creatorId, dueDate, priority } = body;

        const task = await prisma.task.create({
            data: {
                title,
                assigneeId,
                creatorId,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                priority: priority || 'MEDIUM',
                status: 'PENDING'
            }
        });

        return NextResponse.json(task);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}
