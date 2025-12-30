
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { verifyAuth } from '../../../lib/auth';

const LEVELS: Record<string, number> = {
    'PUBLIC': 0,
    'INTERNAL': 1,
    'CONFIDENTIAL': 2,
    'TOP_SECRET': 3
};

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const auth = await verifyAuth(authHeader);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = auth.user;
    const userClearance = user.clearance || 'INTERNAL';
    const userLevel = LEVELS[userClearance] ?? 1;

    // Admin sees all
    if (user.isAdmin) {
        const resources = await prisma.resource.findMany({
            include: {
                owner: { select: { email: true } },
                acls: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ resources });
    }

    // 1. MAC Enforcement: User Clearance >= Resource Level
    // (Filtering upfront in DB)
    const allowedLevels = Object.keys(LEVELS).filter(lvl => (LEVELS[lvl] ?? 1) <= userLevel);

    const resources = await prisma.resource.findMany({
        where: {
            confidentialityLevel: { in: allowedLevels }
        },
        include: {
            owner: { select: { email: true } },
            acls: true
        },
        orderBy: { createdAt: 'desc' }
    });

    // 2. RBAC Enforcement (ACLs): 
    // If a resource has ACLs defined (specific roles), the user's role MUST be in that list.
    // If no ACLs are defined, we assume it's open to anyone with the correct clearance (MAC-only).
    const visibleResources = resources.filter(res => {
        if (res.acls.length === 0) return true; // No specific role restriction
        return res.acls.some(acl => acl.granteeRoleId === user.roleId);
    });

    return NextResponse.json({ resources: visibleResources });
}

export async function POST(req: Request) {
    const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const auth = await verifyAuth(authHeader);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { name, type, level, roles } = await req.json(); // roles = array of roleIds
        if (!name || !type) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        // Validate Level
        const requestedLevel = level || 'INTERNAL';
        if (!(requestedLevel in LEVELS)) {
            return NextResponse.json({ error: 'Invalid security level' }, { status: 400 });
        }

        const resource = await prisma.resource.create({
            data: {
                name,
                type,
                ownerId: auth.user.id,
                confidentialityLevel: requestedLevel,
                tags: "{}",
                acls: {
                    create: (roles || []).map((roleId: string) => ({
                        permission: 'READ',
                        granteeRoleId: roleId,
                        grantedBy: auth.user.id
                    }))
                }
            },
            include: { acls: true }
        });

        return NextResponse.json({ resource });
    } catch (e) {
        console.error('Create resource error', e);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
