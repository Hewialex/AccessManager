
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
    const users = await prisma.user.findMany({
        include: {
            role: {
                include: {
                    permissions: {
                        include: {
                            permission: true
                        }
                    }
                }
            }
        }
    });

    // Return detailed data with permissions
    const safeUsers = users.map(u => ({
        id: u.id,
        name: u.name || u.email,
        role: u.role.name,
        email: u.email,
        clearance: u.clearance,
        department: u.department,
        attributes: JSON.parse(u.attributes || '{}'),
        permissions: u.role.permissions.map(rp => rp.permission.name)
    }));

    return NextResponse.json(safeUsers);
}
