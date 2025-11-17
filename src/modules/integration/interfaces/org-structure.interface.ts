//src/modules/integration/interfaces/org-structure.interface.ts

export interface DepartmentData {
  departmentId: string;
  name: string;
  code: string;
  headOfDepartmentId?: string;
  parentDepartmentId?: string;
  isActive: boolean;
}

export interface PositionData {
  positionId: string;
  title: string;
  code: string;
  departmentId: string;
  reportsToPositionId?: string;
  grade: string;
  isActive: boolean;
}

export interface ReportingLineData {
  employeeId: string;
  positionId: string;
  departmentId: string;
  directManagerId: string;
  departmentHeadId: string;
  approvalChain: {
    level: number;
    roleType: string;
    userId: string;
    userName: string;
  }[];
}

export interface GetDepartmentRequest {
  departmentId: string;
}

export interface GetDepartmentResponse {
  success: boolean;
  data: DepartmentData;
}

export interface GetPositionRequest {
  positionId: string;
}

export interface GetPositionResponse {
  success: boolean;
  data: PositionData;
}

export interface GetReportingLineRequest {
  employeeId: string;
}

export interface GetReportingLineResponse {
  success: boolean;
  data: ReportingLineData;
}