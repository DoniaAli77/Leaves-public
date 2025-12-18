import { SystemRole } from "../enums/SystemRole";
//import { SystemRole } from "../../backend/employee-profile/enums/employee-profile.enums";


export const ADMIN_ROLES: SystemRole[] = [
  SystemRole.SYSTEM_ADMIN,
  SystemRole.LEGAL_POLICY_ADMIN,
  SystemRole.HR_ADMIN,
];

export function isAdmin(userRoles?: string[]) {
  if (!userRoles) return false;
  return userRoles.some((role) => ADMIN_ROLES.includes(role as SystemRole));
}

export function isEmployee(userRoles?: string[]) {
  if (!userRoles) return false;
  return userRoles.includes(SystemRole.DEPARTMENT_EMPLOYEE);
}

export function isManager(userRoles?: string[]) {
  if (!userRoles) return false;
  return (
    userRoles.includes(SystemRole.DEPARTMENT_HEAD) ||
    userRoles.includes(SystemRole.HR_MANAGER)
  );
}
