// services/leaves/leaveCategories.api.ts
import axiosInstance from "@/utils/axiosInstance";

export const getLeaveCategories = () => axiosInstance.get("/leave-category");
export const getLeaveCategoryById = (id: string) => axiosInstance.get(`/leave-category/${id}`);
export const createLeaveCategory = (data: any) => axiosInstance.post("/leave-category", data);