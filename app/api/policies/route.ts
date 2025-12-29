
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const policies = await prisma.policy.findMany({
            include: {
                role: true
            }
        });

        const formattedPolicies = policies.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            type: p.type,
            roleName: p.role?.name || 'All',
            roleId: p.roleId,
            tags: JSON.parse(p.tags), // e.g. { Geo: 'Japan' }
            effect: p.effect
        }));

        return NextResponse.json(formattedPolicies);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch policies' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, description, type, roleId, tags, effect } = body;

        const policy = await prisma.policy.create({
            data: {
                name,
                description,
                type,
                roleId: roleId || null,
                tags: JSON.stringify(tags || {}),
                effect
            }
        });

        return NextResponse.json(policy);
    } catch (error) {
        console.error('Policy create error:', error);
        return NextResponse.json({ error: 'Failed to create policy' }, { status: 500 });
    }
}
