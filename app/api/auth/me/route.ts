import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    // 1. Check Header (Bearer)
    let token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || undefined;

    // 2. Check Cookie (if no header)
    if (!token) {
        const cookieStore = cookies();
        token = cookieStore.get('token')?.value;
    }

    // 3. Verify
    const auth = await verifyAuth(token); // This also checks x-user-id cookie fallback

    if (!auth) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    // 4. Return User (Formatted)
    const u = auth.user;
    // We need to fetch role details if not already in verifyAuth result (it is not, usually just user scalar)
    // verifyAuth in lib/auth.ts does `prisma.user.findUnique`. 
    // Let's re-fetch with full details to be safe or update verifyAuth.
    // simpler to re-fetch here for "me" endpoint.

    const fullUser = await prisma.user.findUnique({
        where: { id: u.id },
        include: {
            role: {
                include: { permissions: { include: { permission: true } } }
            }
        }
    });

    if (!fullUser) return NextResponse.json({ user: null }, { status: 401 });

    const safeUser = {
        id: fullUser.id,
        name: fullUser.name || fullUser.email,
        email: fullUser.email,
        role: fullUser.role.name,
        permissions: fullUser.role.permissions.map((p: any) => p.permission.name),
        department: fullUser.department,
        clearance: fullUser.clearance
    };

    return NextResponse.json({ user: safeUser });
}
