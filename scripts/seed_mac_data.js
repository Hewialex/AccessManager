
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
    const role = await prisma.role.findFirst({ where: { name: 'Employee' } });
    if (!role) throw new Error('Role Employee not found');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const levels = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL'];

    // Ensure SecurityLabels exist
    for (const level of levels) {
        const existing = await prisma.securityLabel.findFirst({ where: { name: level } });
        if (!existing) {
            await prisma.securityLabel.create({
                data: { name: level, level: level, description: level + ' Level Access' }
            });
        }
    }

    const results = { user: {}, resource: {} };

    // Create Users and Resources
    for (const level of levels) {
        // Upsert User
        const email = 'user_' + level.toLowerCase() + '@test.com';
        const user = await prisma.user.upsert({
            where: { email },
            update: { clearance: level, password: hashedPassword, roleId: role.id, isAdmin: false },
            create: {
                email,
                password: hashedPassword,
                clearance: level,
                roleId: role.id,
                isAdmin: false
            }
        });
        results.user[level] = user.id;

        // Connect Label
        const label = await prisma.securityLabel.findFirst({ where: { name: level } });

        // Create Resource
        const resourceName = 'Resource_' + level;
        let resource = await prisma.resource.findFirst({ where: { name: resourceName } });
        if (!resource) {
            resource = await prisma.resource.create({
                data: {
                    name: resourceName,
                    type: 'DOCUMENT',
                    ownerId: user.id,
                    labelId: label.id
                }
            });
        } else {
            await prisma.resource.update({
                where: { id: resource.id },
                data: { labelId: label.id }
            });
        }
        results.resource[level] = resource.id;
    }

    console.log('--- TEST DATA ---');
    console.log(JSON.stringify(results, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
