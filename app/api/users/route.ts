
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

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, roleId, clearance, department, jobTitle, attributes } = body;

        // Basic validation
        if (!email || !password || !roleId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password, // NOTE: In production, hash this password!
                roleId,
                clearance,
                department,
                jobTitle,
                attributes: JSON.stringify(attributes || {})
            },
            include: {
                role: true
            }
        });

        return NextResponse.json(newUser);
    } catch (error) {
        console.error('Failed to create user:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
