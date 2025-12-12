import axiosInstance from "@/utils/axiosInstance";

export const leavePolicyAPI = {
  
  getAll: () => axiosInstance.get("/leave-policy"),

  getOne: (id: string) => axiosInstance.get(`/leave-policy/${id}`),

  create: (data: any) => axiosInstance.post("/leave-policy", data),

  update: (id: string, data: any) =>
    axiosInstance.patch(`/leave-policy/${id}`, data),

  remove: (id: string) => axiosInstance.delete(`/leave-policy/${id}`),
};
