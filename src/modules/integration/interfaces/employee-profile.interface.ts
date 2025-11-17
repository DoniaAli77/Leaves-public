// src/modules/integration/interfaces/employee-profile.interface.ts

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
}

export enum ContractType {
  PERMANENT = 'PERMANENT',
  CONTRACT = 'CONTRACT',
  PART_TIME = 'PART_TIME',
}

export interface EmployeeProfileData {
  employeeId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    hireDate: Date;
    workStartDate: Date;
    dateOfBirth?: Date;
    gender?: 'MALE' | 'FEMALE';
  };
  employment: {
    contractType: ContractType;
    grade: string;
    departmentId: string;
    positionId: string;
    managerId: string;
    status: EmploymentStatus;
    probationEndDate?: Date;
  };
  compensation?: {
    baseSalary: number;
    currency: string;
  };
}

export interface GetEmployeeProfileRequest {
  employeeId: string;
}

export interface GetEmployeeProfileResponse {
  success: boolean;
  data: EmployeeProfileData;
}

export interface GetEmployeesByDepartmentRequest {
  departmentId: string;
}

export interface GetEmployeesByDepartmentResponse {
  success: boolean;
  data: EmployeeProfileData[];
}
