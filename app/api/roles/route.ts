
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const roles = await prisma.role.findMany({
            include: {
                permissions: {
                    include: { permission: true }
                },
                _count: {
                    select: { users: true }
                }
            }
        });

        const formattedRoles = roles.map(role => ({
            id: role.id,
            name: role.name,
            description: role.description,
            type: role.type,
            userCount: role._count.users,
            permissions: role.permissions.map(p => p.permission.name), // Just names for list view
            permissionCount: role.permissions.length
        }));

        return NextResponse.json(formattedRoles);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, description, type, permissions } = body;

        const role = await prisma.role.create({
            data: {
                name,
                description,
                type,
                permissions: {
                    create: permissions.map((pid: string) => ({
                        permission: { connect: { id: pid } }
                    }))
                }
            }
        });

        return NextResponse.json(role);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
    }
}
