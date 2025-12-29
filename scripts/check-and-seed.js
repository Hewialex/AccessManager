
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt'); // Need bcrypt to hash password
const prisma = new PrismaClient();

async function main() {
    console.log('Checking database state...');

    // 1. Ensure Roles exist (just in case API didn't trigger)
    let adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } });
    if (!adminRole) {
        console.log('Seeding Roles...');
        adminRole = await prisma.role.create({ data: { name: 'Admin' } });
        await prisma.role.create({ data: { name: 'Manager' } });
        await prisma.role.create({ data: { name: 'Employee' } });
    }

    // 2. Check Users
    const count = await prisma.user.count();
    console.log(`Found ${count} users.`);

    if (count === 0) {
        console.log('No users found. Creating Default Admin...');
        const hash = await bcrypt.hash('Admin#1234', 10);
        const user = await prisma.user.create({
            data: {
                email: 'admin@example.com',
                password: hash,
                roleId: adminRole.id,
                clearance: 'CONFIDENTIAL',
                isAdmin: true,
                attributes: '{}'
            }
        });
        console.log('Created User: admin@example.com / Admin#1234');
    } else {
        // Force existing to be admin just in case
        await prisma.user.updateMany({ data: { isAdmin: true } });
        console.log('Updated existing users to have Admin privileges.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
