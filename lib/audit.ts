import { prisma } from './prisma';

export async function createAuditLog(params: {
  userId?: string | null;
  action: string;
  ip?: string | null;
}) {
  const { userId = null, action, ip = null } = params;
  return prisma.auditLog.create({
    data: {
      action,
      ip: ip ?? 'unknown',
      userId: userId ?? undefined,
    },
  });
}
