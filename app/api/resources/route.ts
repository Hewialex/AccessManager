
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { verifyAuth } from '../../../lib/auth';
import * as fs from 'fs';
import * as path from 'path';

const LEVELS: Record<string, number> = {
    'PUBLIC': 0,
    'INTERNAL': 1,
    'CONFIDENTIAL': 2,
    'TOP_SECRET': 3
};

export async function GET(req: Request) {
    // ... existing GET implementation ...
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

    // 1. MAC Enforcement
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

    // 2. RBAC Enforcement
    const visibleResources = resources.filter(res => {
        if (res.acls.length === 0) return true;
        return res.acls.some(acl => acl.granteeRoleId === user.roleId);
    });

    return NextResponse.json({ resources: visibleResources });
}

export async function POST(req: Request) {
    const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const auth = await verifyAuth(authHeader);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { name, type, level, roles, fileContent } = await req.json();
        if (!name || !type) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        // Validate Level
        const requestedLevel = level || 'INTERNAL';
        if (!(requestedLevel in LEVELS)) {
            return NextResponse.json({ error: 'Invalid security level' }, { status: 400 });
        }

        let tagsJson = "{}";

        // Handle File Upload
        if (fileContent) {
            try {
                // Ensure uploads dir exists
                const uploadDir = path.join(process.cwd(), 'public', 'uploads');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                // Sanitize filename
                const sanitize = (s: string) => s.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
                const safeName = `${Date.now()}_${sanitize(name)}`;
                const filePath = path.join(uploadDir, safeName);

                // Write file (strip base64 header if present)
                const matches = fileContent.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                let buffer;

                if (matches && matches.length === 3) {
                    buffer = Buffer.from(matches[2], 'base64');
                } else {
                    buffer = Buffer.from(fileContent, 'base64');
                }

                fs.writeFileSync(filePath, buffer);

                // Store path in tags
                tagsJson = JSON.stringify({ filePath: `/uploads/${safeName}` });

            } catch (err) {
                console.error("File write error", err);
                return NextResponse.json({ error: 'File save failed' }, { status: 500 });
            }
        }

        const resource = await prisma.resource.create({
            data: {
                name,
                type,
                ownerId: auth.user.id,
                confidentialityLevel: requestedLevel,
                tags: tagsJson,
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
