import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcrypt';
import { signJwt } from '../../../../lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate Token
    const token = signJwt(user.id);

    // Set Cookie
    cookies().set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
    cookies().set('x-user-id', user.id, { path: '/' }); // For our demo context

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name
      },
      redirect: (user.role.name === 'Administrator' || user.role.name === 'Admin') ? '/' :
        (user.role.name === 'Manager') ? '/dashboard' : '/workspace'
    });

  } catch (error) {
    console.error('Login error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
