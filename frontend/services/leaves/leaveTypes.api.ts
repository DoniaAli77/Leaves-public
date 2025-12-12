// services/leaves/leaveTypes.api.ts
import axiosInstance from "@/utils/axiosInstance";

export const getLeaveTypes = () => axiosInstance.get("/leave-type");
export const getLeaveTypeById = (id: string) => axiosInstance.get(`/leave-type/${id}`);
export const createLeaveType = (data: any) => axiosInstance.post("/leave-type", data);
export const updateLeaveType = (id: string, data: any) =>
  axiosInstance.patch(`/leave-type/${id}`, data);
export const deleteLeaveType = (id: string) => axiosInstance.delete(`/leave-type/${id}`);
