import { SystemRole } from "../enums/SystemRole";


export const ADMIN_ROLES: SystemRole[] = [
  SystemRole.SYSTEM_ADMIN,
  SystemRole.LEGAL_POLICY_ADMIN,
  SystemRole.HR_ADMIN,
];

export function isAdmin(userRoles?: string[]) {
  if (!userRoles) return false;
  return userRoles.some((role) => ADMIN_ROLES.includes(role as SystemRole));
}

