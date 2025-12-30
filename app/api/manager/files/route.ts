
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// ... GET implementation remains same ...

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, type, ownerId, confidentialityLevel, fileContent, shares } = body;
        // shares: [{ userId: '...', permission: 'READ' | 'WRITE' }]

        let tagsJson = "{}";

        // Handle File Upload
        if (fileContent) {
            try {
                const uploadDir = path.join(process.cwd(), 'public', 'uploads');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                const sanitize = (s: string) => s.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
                const safeName = `${Date.now()}_${sanitize(name)}`;
                const filePath = path.join(uploadDir, safeName);

                const matches = fileContent.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                let buffer;
                if (matches && matches.length === 3) {
                    buffer = Buffer.from(matches[2], 'base64');
                } else {
                    buffer = Buffer.from(fileContent, 'base64');
                }

                fs.writeFileSync(filePath, buffer);
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
                ownerId,
                confidentialityLevel: confidentialityLevel || 'INTERNAL',
                tags: tagsJson,
                acls: {
                    create: (shares || []).map((s: any) => ({
                        permission: s.permission || 'READ',
                        granteeId: s.userId, // User-based DAC
                        grantedBy: ownerId
                    }))
                }
            },
            include: { acls: true }
        });
        return NextResponse.json(resource);
    } catch (error) {
        console.error("Create error", error);
        return NextResponse.json({ error: 'Failed to create file' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // MAC Logic
        const LEVELS: Record<string, number> = { 'PUBLIC': 0, 'INTERNAL': 1, 'CONFIDENTIAL': 2, 'TOP_SECRET': 3 };
        const userLevel = LEVELS[user.clearance || 'INTERNAL'] ?? 1;
        const allowedLevels = Object.keys(LEVELS).filter(lvl => (LEVELS[lvl] ?? 1) <= userLevel);

        // Fetch ALL potential resources (Owner OR Shared OR Clearance-Match)
        const resources = await prisma.resource.findMany({
            where: {
                OR: [
                    { ownerId: userId }, // 1. Owner (Always see)
                    { acls: { some: { granteeId: userId } } }, // 2. Direct Share (DAC) (Always see)
                    { confidentialityLevel: { in: allowedLevels } } // 3. Potential MAC match (further filter needed)
                ]
            },
            include: {
                owner: { select: { name: true } },
                acls: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Post-Processing for Strict Rules
        const visibleResources = resources.filter(res => {
            // Rule 1: Owner or Direct Share -> ALLOW
            if (res.ownerId === userId) return true;
            if (res.acls.some(acl => acl.granteeId === userId)) return true;

            // Rule 2: MAC Check (Must match clearance if not owner/shared)
            if (!allowedLevels.includes(res.confidentialityLevel)) return false;

            // Rule 3: RBAC/ACL Check
            // If there are Role restrictions, User must have that Role.
            // If ACLs restrict to specific Roles, and I don't have them, I can't see it (unless Rule 1 passed).
            // NOTE: We need to distinguish between "User Shared ACL" and "Role Shared ACL".
            const roleAcls = res.acls.filter(acl => acl.granteeRoleId);

            if (roleAcls.length > 0) {
                // If Role ACLs exist, I must match one of them
                return roleAcls.some(acl => acl.granteeRoleId === user.roleId);
            }

            // If no Role ACLs, and no Direct Share (checked above)...
            // Default behavior: Is it open?
            // If we assume "Simple MAC" where Admin uploads file with NO roles, it's open to clearance.
            // If Admin uploads file WITH roles, it's restricted.
            // So if roleAcls is empty, and we passed MAC, we are good.
            return true;
        });

        return NextResponse.json(visibleResources);
    } catch (error) {
        console.error("Fetch error", error);
        return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }
}


