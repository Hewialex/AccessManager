
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Granting Admin privileges to all users...');
    try {
        const updated = await prisma.user.updateMany({
            data: { isAdmin: true }
        });
        console.log(`Success! Updated ${updated.count} users to Admin.`);
    } catch (e) {
        console.error('Error updating users:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
