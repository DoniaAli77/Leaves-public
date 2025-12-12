// services/leaves/leaveRequests.api.ts
import axiosInstance from "@/utils/axiosInstance";

export const getLeaveRequests = () => axiosInstance.get("/leave-request");
export const getLeaveRequestById = (id: string) =>
  axiosInstance.get(`/leave-request/${id}`);

export const createLeaveRequest = (data: any) =>
  axiosInstance.post("/leave-request", data);

export const updateLeaveRequest = (id: string, data: any) =>
  axiosInstance.put(`/leave-request/${id}`, data);

export const approveLeaveRequest = (id: string, approverId: string) =>
  axiosInstance.put(`/leave-request/${id}/approve/manager`, { approverId });

export const rejectLeaveRequest = (
  id: string,
  approverId: string,
  comment: string
) =>
  axiosInstance.put(`/leave-request/${id}/reject/manager`, {
    approverId,
    comment,
  });
