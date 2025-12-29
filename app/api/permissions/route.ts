
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const permissions = await prisma.permission.findMany();

        // Group permissions by 'group' field
        const grouped = permissions.reduce((acc, perm) => {
            const group = perm.group || 'General';
            if (!acc[group]) acc[group] = [];
            acc[group].push(perm);
            return acc;
        }, {} as Record<string, typeof permissions>);

        return NextResponse.json(grouped);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 });
    }
}
