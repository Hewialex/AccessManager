
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    try {
        // Delete in order of dependency (Dependents first)
        await prisma.resourceACL.deleteMany();
        await prisma.resource.deleteMany();
        await prisma.policy.deleteMany();
        await prisma.user.deleteMany();
        await prisma.rolePermission.deleteMany();
        await prisma.role.deleteMany();
        await prisma.permission.deleteMany();
        await prisma.tag.deleteMany();
    } catch (e) {
        console.log('Error clearing tables (might be empty):', e.message);
    }

    // 2. Create Permissions
    const perms = [
        { name: 'folder_create', group: 'Data Workbench', description: 'Create folders' },
        { name: 'folder_edit', group: 'Data Workbench', description: 'Edit folders' },
        { name: 'folder_view', group: 'Data Workbench', description: 'View folders' },
        { name: 'folder_tag_create', group: 'Data Workbench', description: 'Create folder tags' },
        { name: 'folder_tag_edit', group: 'Data Workbench', description: 'Edit folder tags' },
        { name: 'user_manage', group: 'Security', description: 'Manage users' },
        { name: 'role_manage', group: 'Security', description: 'Manage roles' },
        { name: 'policy_manage', group: 'Security', description: 'Manage policies' },
    ];

    const permissionMap = {};
    for (const p of perms) {
        // Upsert to be safe, though deleteMany should have cleared it
        const created = await prisma.permission.upsert({
            where: { name: p.name },
            update: {},
            create: { name: p.name, group: p.group, description: p.description }
        });
        permissionMap[p.name] = created.id;
    }

    // 3. Create Roles
    const rolesData = [
        {
            name: 'Administrator',
            type: 'System role',
            description: 'Full system access',
            permissions: Object.values(permissionMap)
        },
        {
            name: 'Tag Admin',
            type: 'User role',
            description: 'Can create tag groups and set them to folders and resources.',
            permissions: [permissionMap['folder_tag_create'], permissionMap['folder_tag_edit']]
        },
        {
            name: 'Data Engineer',
            type: 'User role',
            description: 'Engineers who manage data pipelines.',
            permissions: [permissionMap['folder_view'], permissionMap['folder_create']]
        },
        {
            name: 'Manager',
            type: 'User role',
            description: 'Department manager',
            permissions: [permissionMap['folder_view']]
        }
    ];

    const roleMap = {};
    for (const r of rolesData) {
        // Create role first
        const createdRole = await prisma.role.create({
            data: {
                name: r.name,
                type: r.type,
                description: r.description
            }
        });
        roleMap[r.name] = createdRole.id;

        // Create permissions for this role
        if (r.permissions && r.permissions.length > 0) {
            for (const pid of r.permissions) {
                await prisma.rolePermission.create({
                    data: {
                        roleId: createdRole.id,
                        permissionId: pid
                    }
                });
            }
        }
    }

    // 4. Create Tags
    await prisma.tag.create({ data: { key: 'Geo', values: JSON.stringify(['APAC', 'EMEA', 'LAD', 'NA', 'US', 'Japan']), type: 'Resource access' } });
    await prisma.tag.create({ data: { key: 'Department', values: JSON.stringify(['HR', 'IT', 'Engineering', 'Sales']), type: 'Resource access' } });

    // 5. Create Users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Admin User
    await prisma.user.create({
        data: {
            email: 'admin@secure.com',
            name: 'Admin User',
            password: hashedPassword,
            roleId: roleMap['Administrator'],
            isAdmin: true,
            clearance: 'CONFIDENTIAL',
            department: 'IT',
            jobTitle: 'System Administrator'
        }
    });

    await prisma.user.create({
        data: {
            email: 'abebe@secure.com',
            name: 'Abebe',
            password: hashedPassword,
            roleId: roleMap['Manager'],
            department: 'HR',
            jobTitle: 'Manager',
            clearance: 'INTERNAL',
            attributes: JSON.stringify({ department: 'HR', geo: 'EMEA' })
        }
    });

    await prisma.user.create({
        data: {
            email: 'marta@secure.com',
            name: 'Marta',
            password: hashedPassword,
            roleId: roleMap['Data Engineer'],
            department: 'IT',
            jobTitle: 'Intern',
            clearance: 'PUBLIC',
            attributes: JSON.stringify({ department: 'IT', geo: 'Japan' })
        }
    });

    // 6. Create Policies
    await prisma.policy.create({
        data: {
            name: 'Japan Data Engineer Policy',
            description: 'For data engineers in Japan to load in and manage credentials and data.',
            type: 'User Policy',
            roleId: roleMap['Data Engineer'],
            tags: JSON.stringify({ 'Geo': 'Japan' }),
            effect: 'ALLOW'
        }
    });

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error('Error seeding data:');
        console.error(e.message);
        if (e.meta) console.error('Meta:', JSON.stringify(e.meta, null, 2));
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
