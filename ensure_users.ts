import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log("Ensuring users exist...");

    // 1. Ensure Roles
    const roles = ['Administrator', 'Manager', 'Employee'];
    const roleMap: Record<string, string> = {};

    for (const r of roles) {
        // Try to find exact match or case insensitive? Seed used 'Admin', 'Manager', 'Employee'
        // Let's standardize to what Seed used.
        // Seed used: 'Admin', 'Manager', 'Employee'.
        // Wait, current roles in DB? 'Admin' or 'Administrator'?
        // The previous seed said 'Admin'.
        // My login page hint uses 'Admin'.
        // Let's check DB... I'll assume 'Admin', 'Manager', 'Employee' from typical seed.
        // But if I want to be safe, I'll search for them.
        let name = r === 'Administrator' ? 'Admin' : r;

        let role = await prisma.role.findFirst({ where: { name } });
        if (!role) {
            console.log(`Creating role ${name}`);
            role = await prisma.role.create({ data: { name } });
        }
        roleMap[r] = role.id;
    }

    // 2. Upsert Users
    const users = [
        { email: 'admin@example.com', name: 'Admin User', role: 'Administrator', pass: 'Admin#1234', dept: 'IT' },
        { email: 'martha@example.com', name: 'Martha Manager', role: 'Manager', pass: 'password123', dept: 'Sales' },
        { email: 'abebe@example.com', name: 'Abebe Employee', role: 'Employee', pass: 'password123', dept: 'Sales' }
    ];

    for (const u of users) {
        const hashedPassword = await bcrypt.hash(u.pass, 10);
        const roleId = roleMap[u.role];

        const existing = await prisma.user.findUnique({ where: { email: u.email } });
        if (existing) {
            console.log(`Updating ${u.email}...`);
            await prisma.user.update({
                where: { email: u.email },
                data: {
                    password: hashedPassword,
                    roleId: roleId,
                    department: u.dept
                }
            });
        } else {
            console.log(`Creating ${u.email}...`);
            await prisma.user.create({
                data: {
                    email: u.email,
                    name: u.name,
                    password: hashedPassword,
                    roleId: roleId,
                    department: u.dept,
                    clearance: u.role === 'Administrator' ? 'TOP_SECRET' : (u.role === 'Manager' ? 'CONFIDENTIAL' : 'INTERNAL'),
                    attributes: '{}'
                }
            });
        }
    }
    console.log("Done!");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
