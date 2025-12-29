
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userCount = await prisma.user.count();
    const roleCount = await prisma.role.count();
    const tagCount = await prisma.tag.count();
    const policyCount = await prisma.policy.count();
    const permCount = await prisma.permission.count();

    console.log(`Verification Results:`);
    console.log(`Users: ${userCount}`);
    console.log(`Roles: ${roleCount}`);
    console.log(`Tags: ${tagCount}`);
    console.log(`Policies: ${policyCount}`);
    console.log(`Permissions: ${permCount}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
