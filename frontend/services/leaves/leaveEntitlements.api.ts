import axiosInstance from "@/utils/axiosInstance";

export const createLeaveEntitlement = (data: {
  employeeId: string;
  leaveTypeId: string;
  totalDays: number;
  usedDays?: number;
  pendingDays?: number;
  year: number;
}) => axiosInstance.post("/leave-entitlement", data);

export const getEmployeeEntitlement = (employeeId: string) =>
  axiosInstance.get(`/leave-entitlement/${employeeId}`);

export const updateLeaveEntitlement = (
  employeeId: string,
  data: {
    leaveTypeId: string;
    totalDays?: number;
    usedDays?: number;
    pendingDays?: number;
  }
) => axiosInstance.put(`/leave-entitlement/${employeeId}`, data);

export const deleteLeaveEntitlement = (employeeId: string) =>
  axiosInstance.delete(`/leave-entitlement/${employeeId}`);
