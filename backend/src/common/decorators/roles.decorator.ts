import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  HR_ADMIN = 'HR_ADMIN',
  HR_MANAGER = 'HR_MANAGER',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  PAYROLL_OFFICER = 'PAYROLL_OFFICER',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);