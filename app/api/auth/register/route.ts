import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcrypt';
import { signJwt } from '../../../../lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Find Employee Role
    const role = await prisma.role.findFirst({ where: { name: 'Employee' } });
    if (!role) {
      return NextResponse.json({ error: 'System error: Employee role not found' }, { status: 500 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: role.id,
        clearance: 'INTERNAL', // Default clearance
        department: 'General'
      },
      include: { role: true }
    });

    // Auto-login
    const token = signJwt(user.id);
    cookies().set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
    cookies().set('x-user-id', user.id, { path: '/' });

    return NextResponse.json({
      success: true,
      redirect: '/workspace'
    });

  } catch (error) {
    console.error('Register error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
