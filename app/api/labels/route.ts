
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
    const labels = await prisma.securityLabel.findMany();
    // Ensure we have the basics if DB is empty
    const basicLabels = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL'];
    const missing = basicLabels.filter(l => !labels.find(dbL => dbL.level === l));

    if (missing.length > 0) {
        // Lazy seed
        for (const level of missing) {
            await prisma.securityLabel.create({
                data: { name: level.charAt(0) + level.slice(1).toLowerCase(), level }
            });
        }
        const updated = await prisma.securityLabel.findMany();
        return NextResponse.json({ labels: updated });
    }

    return NextResponse.json({ labels });
}
