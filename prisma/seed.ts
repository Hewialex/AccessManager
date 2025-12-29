import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function findOrCreateRole(name: string) {
  const existing = await (prisma as any).role.findFirst({ where: { name } });
  if (existing) return existing;
  return (prisma as any).role.create({ data: { name } });
}

async function findOrCreatePermission(name: string, description = '') {
  const existing = await (prisma as any).permission.findFirst({ where: { name } });
  if (existing) return existing;
  return (prisma as any).permission.create({ data: { name, description } });
}

async function main() {
  console.log('Seeding roles and permissions...');

  const adminRole = await findOrCreateRole('Admin');
  const managerRole = await findOrCreateRole('Manager');
  const employeeRole = await findOrCreateRole('Employee');

  const pRead = await findOrCreatePermission('read', 'Read resource');
  const pWrite = await findOrCreatePermission('write', 'Write resource');

  // RolePermission entries (create if missing)
  const makeRolePerm = async (roleId: string, permissionId: string) => {
    const found = await (prisma as any).rolePermission.findFirst({ where: { roleId, permissionId } });
    if (!found) await (prisma as any).rolePermission.create({ data: { roleId, permissionId } });
  };
  await makeRolePerm(managerRole.id, pRead.id);
  await makeRolePerm(adminRole.id, pRead.id);
  await makeRolePerm(adminRole.id, pWrite.id);

  console.log('Seeding labels...');
  const getOrCreateLabel = async (name: string, level: string) => {
    const found = await (prisma as any).securityLabel.findFirst({ where: { name } });
    if (found) return found;
    return (prisma as any).securityLabel.create({ data: { name, level } });
  };
  const publicLabel = await getOrCreateLabel('Public', 'PUBLIC');
  const internalLabel = await getOrCreateLabel('Internal', 'INTERNAL');
  const confidentialLabel = await getOrCreateLabel('Confidential', 'CONFIDENTIAL');

  console.log('Seeding admin user...');
  const hashed = await bcrypt.hash('Admin#1234', 10);
  let adminUser = await (prisma as any).user.findFirst({ where: { email: 'admin@example.com' } });
  if (!adminUser) {
    adminUser = await (prisma as any).user.create({ data: { email: 'admin@example.com', password: hashed, roleId: adminRole.id } });
  }

  console.log('Seeding example resource...');
  let resource = await (prisma as any).resource.findFirst({ where: { name: 'Payroll Report' } });
  if (!resource) {
    resource = await (prisma as any).resource.create({ data: { ownerId: adminUser.id, name: 'Payroll Report', type: 'payroll', labelId: confidentialLabel.id } });
  }

  console.log('Seeding policies...');
  const policyFound = await (prisma as any).policy.findFirst({ where: { name: 'ManagersCanReadDuringWorkHours' } });
  if (!policyFound) {
    await (prisma as any).policy.create({ data: { name: 'ManagersCanReadDuringWorkHours', effect: 'ALLOW', condition: 'role=Manager AND time=09:00-17:00' } });
  }

  console.log('Done.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
