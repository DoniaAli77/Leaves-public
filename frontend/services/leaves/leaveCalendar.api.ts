// services/leaves/leaveCalendar.api.ts
import axiosInstance from "@/utils/axiosInstance";

export const leaveCalendarAPI = {
  create: (data: any) =>
    axiosInstance.post("/calendar", data),

  getByYear: (year: number) =>
    axiosInstance.get(`/calendar/${year}`),

  update: (year: number, data: any) =>
    axiosInstance.patch(`/calendar/${year}`, data),

  addBlockedPeriod: (year: number, data: {
    startDate: string;
    endDate: string;
    reason: string;
  }) =>
    axiosInstance.post(`/calendar/${year}/blocked-period`, data),

  removeBlockedPeriod: (year: number, index: number) =>
    axiosInstance.delete(`/calendar/${year}/blocked-period/${index}`),
};
