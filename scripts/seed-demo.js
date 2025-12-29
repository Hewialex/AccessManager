
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Demo Data...');

    // 1. Label Check
    const internalLabel = await prisma.securityLabel.findFirst({ where: { level: 'INTERNAL' } });
    const confLabel = await prisma.securityLabel.findFirst({ where: { level: 'CONFIDENTIAL' } });
    const role = await prisma.role.findFirst({ where: { name: 'Employee' } });

    if (!internalLabel || !confLabel || !role) {
        console.error('Missing basic labels/roles. Run initial seed first.');
        return;
    }

    // 2. Create Users
    const pw = await bcrypt.hash('123456', 10);

    // Alice (Internal)
    try {
        await prisma.user.create({
            data: {
                email: 'alice@internal.com',
                password: pw,
                roleId: role.id,
                clearance: 'INTERNAL',
                attributes: '{}'
            }
        });
        console.log('Created: alice@internal.com / 123456 (INTERNAL)');
    } catch (e) { }

    // Bob (Confidential)
    try {
        await prisma.user.create({
            data: {
                email: 'bob@secure.com',
                password: pw,
                roleId: role.id,
                clearance: 'CONFIDENTIAL',
                attributes: '{}'
            }
        });
        console.log('Created: bob@secure.com / 123456 (CONFIDENTIAL)');
    } catch (e) { }

    // 3. Create Resources
    // Owner can be admin
    const admin = await prisma.user.findFirst({ where: { isAdmin: true } });

    const res1 = await prisma.resource.create({
        data: {
            name: 'Top Secret Alien Research',
            type: 'document',
            labelId: confLabel.id,
            ownerId: admin.id
        }
    });
    console.log(`Created CONFIDENTIAL Doc: ${res1.id}`);

    const res2 = await prisma.resource.create({
        data: {
            name: 'Company Lunch Menu',
            type: 'document',
            labelId: internalLabel.id,
            ownerId: admin.id
        }
    });
    console.log(`Created INTERNAL Doc: ${res2.id}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
