
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst();
    const resource = await prisma.resource.findFirst();
    console.log('USER_ID:', user ? user.id : 'NONE');
    console.log('RESOURCE_ID:', resource ? resource.id : 'NONE');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
