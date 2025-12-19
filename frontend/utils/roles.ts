import { SystemRole } from "../enums/SystemRole";

/**
 * =========================
 * ADMIN ROLES
 * =========================
 */
export const ADMIN_ROLES: SystemRole[] = [
  SystemRole.SYSTEM_ADMIN,
  SystemRole.LEGAL_POLICY_ADMIN,
  SystemRole.HR_ADMIN,
];

/**
 * =========================
 * ROLE CHECK HELPERS
 * =========================
 */

export function isAdmin(userRoles?: SystemRole[]) {
  if (!userRoles) return false;
  return userRoles.some((role) => ADMIN_ROLES.includes(role));
}

export function isEmployee(userRoles?: SystemRole[]) {
  if (!userRoles) return false;
  return (
    userRoles.includes(SystemRole.DEPARTMENT_EMPLOYEE) ||
    userRoles.includes(SystemRole.HR_EMPLOYEE)
  );
}

export function isManager(userRoles?: SystemRole[]) {
  if (!userRoles) return false;
  return (
    userRoles.includes(SystemRole.DEPARTMENT_HEAD) ||
    userRoles.includes(SystemRole.HR_MANAGER)
  );
}
