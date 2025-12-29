import { checkMAC, checkRBAC, checkABAC } from './access';
import { createAuditLog } from './audit';

export async function evaluateAccess({ user, resource, action, context }: { user: any; resource: any; action: string; context: Record<string, any> }) {
  // 1. MAC
  const macOk = await checkMAC(user.id, resource.id);
  if (!macOk) {
    await createAuditLog({ userId: user.id, action: `ACCESS_DENIED_MAC:${action}`, ip: context.ip });
    return { decision: 'DENY', reason: 'MAC_DENY' };
  }

  // 2. ABAC (quick check - returns boolean)
  const abacOk = await checkABAC(user.id, resource.id, context);
  if (abacOk) {
    await createAuditLog({ userId: user.id, action: `ACCESS_ALLOWED_ABAC:${action}`, ip: context.ip });
    return { decision: 'ALLOW', reason: 'ABAC_ALLOW' };
  }

  // 3. RBAC
  const rbacOk = await checkRBAC(user.id, action);
  if (rbacOk) {
    await createAuditLog({ userId: user.id, action: `ACCESS_ALLOWED_RBAC:${action}`, ip: context.ip });
    return { decision: 'ALLOW', reason: 'RBAC_ALLOW' };
  }

  // 4. DAC - check resource ACLs (resource.acls is expected)
  const allowedByAcl = (resource.acls || []).some((acl: any) => {
    if (acl.granteeUserId && acl.granteeUserId === user.id && acl.permission === action) return true;
    if (acl.granteeRoleId && acl.granteeRoleId === user.roleId && acl.permission === action) return true;
    return false;
  });
  if (allowedByAcl) {
    await createAuditLog({ userId: user.id, action: `ACCESS_ALLOWED_DAC:${action}`, ip: context.ip });
    return { decision: 'ALLOW', reason: 'DAC_ALLOW' };
  }

  await createAuditLog({ userId: user.id, action: `ACCESS_DENIED_DEFAULT:${action}`, ip: context.ip });
  return { decision: 'DENY', reason: 'DEFAULT_DENY' };
}
