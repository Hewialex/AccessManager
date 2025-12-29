import { prisma } from './prisma';
import { createAuditLog } from './audit';

// Very small helpers for enforcement logic. These are starting points
// and not intended as final production policy engines.

export async function checkMAC(userId: string, resourceId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    // Admin bypass: Admins can access everything to manage the system
    if (user.isAdmin) return true;

    const resource = await (prisma as any).resource.findUnique({
      where: { id: resourceId }
    });

    if (!resource) return false;

    // Define hierarchies explicitly
    const LEVELS: Record<string, number> = {
      'PUBLIC': 0,
      'INTERNAL': 1,
      'CONFIDENTIAL': 2
    };

    // Default to INTERNAL (1) if undefined, for safety
    const resourceLevelStr = resource.confidentialityLevel || 'INTERNAL';
    const userClearanceStr = user.clearance || 'INTERNAL';

    const resourceLevel = LEVELS[resourceLevelStr] ?? 1;
    const userLevel = LEVELS[userClearanceStr] ?? 1;

    // Strict Matching (User request): User can ONLY read if clearance === resource level
    // This denies 'Read Down' (e.g. Confidential user reading Internal resource) and 'Read Up'.

    // const allowed = userLevel >= resourceLevel; // Standard Bell-LaPadula
    const allowed = userLevel === resourceLevel; // Strict Matching

    if (!allowed) {
      try {
        await createAuditLog({
          userId,
          action: `MAC_DENY: User(${userClearanceStr}) tried accessing Resource(${resourceLevelStr})`,
          ip: 'system'
        });
      } catch (e) {
        console.warn('Audit log failed', e);
      }
    }
    return allowed;
  } catch (err) {
    console.error('checkMAC error', err);
    return false;
  }
}

export async function checkRBAC(userId: string, permissionName: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    // RolePermission model links roles to permissions. Query those entries.
    const rolePerms = await (prisma as any).rolePermission.findMany({ where: { roleId: user.roleId }, include: { permission: true } });
    if (!rolePerms || rolePerms.length === 0) return false;
    return rolePerms.some(rp => rp.permission.name === permissionName);
  } catch (err) {
    console.error('checkRBAC error', err);
    return false;
  }
}

export async function checkABAC(userId: string, resourceId: string, context: Record<string, any> = {}): Promise<boolean> {
  try {
    // Simple ABAC: fetch policies and evaluate simple conditions stored as strings.
    const policies = await (prisma as any).policy.findMany();
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    const resource = await (prisma as any).resource.findUnique({ where: { id: resourceId } });
    if (!user || !resource) return false;

    for (const policy of policies) {
      if (!policy.condition) continue;
      const cond = policy.condition;
      // parse simple "key=value" conditions
      const [key, val] = cond.split('=');
      if (!key || !val) continue;
      const keyTrim = key.trim().toLowerCase();
      const valTrim = val.trim();
      if (keyTrim === 'role' && user.role?.name === valTrim) return policy.effect === 'ALLOW';
      if (keyTrim === 'type' && resource.type === valTrim) return policy.effect === 'ALLOW';
      // allow policies to reference context attributes (e.g., department)
      if (keyTrim in context && String(context[keyTrim]) === valTrim) return policy.effect === 'ALLOW';
    }

    // default deny
    return false;
  } catch (err) {
    console.error('checkABAC error', err);
    return false;
  }
}
