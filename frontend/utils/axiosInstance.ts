// utils/axiosInstance.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 🔐 Attach auth headers expected by backend
 */
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userid");
      const role = localStorage.getItem("role");

      // BACKEND EXPECTS THESE 👇
      if (userId) {
        config.headers["x-user-id"] = userId;
      }

      if (role) {
        config.headers["x-user-role"] = role;
      }

      // Optional: keep JWT for future migration
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API Error:",
      error?.response?.data ?? error?.message
    );
    return Promise.reject(error);
  }
);

export default axiosInstance;