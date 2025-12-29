import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  const hash = await bcrypt.hash(password, 12);
  // Ensure we match the Seeded role name 'Employee'
  let role = await prisma.role.findFirst({ where: { name: "Employee" } });
  if (!role) {
    // Fallback if seed didn't run
    role = await prisma.role.create({ data: { name: 'Employee' } });
  }
  const user = await prisma.user.create({
    data: { email, password: hash, name: name || 'User', role: { connect: { id: role.id } } }
  });
  return Response.json({ success: true, userId: user.id });
}
