
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const tags = await prisma.tag.findMany();
        // Parse values from JSON string
        const formattedTags = tags.map(tag => ({
            ...tag,
            values: JSON.parse(tag.values)
        }));
        return NextResponse.json(formattedTags);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { key, values, type } = body;
        // values expected as array of strings

        // Check if key already exists? Maybe not for now.

        const tag = await prisma.tag.create({
            data: {
                key,
                values: JSON.stringify(values),
                type
            }
        });

        return NextResponse.json(tag);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
    }
}
