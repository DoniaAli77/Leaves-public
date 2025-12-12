// utils/axiosInstance.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/v1", // frontend → backend (via Next.js rewrite)
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Log backend errors nicely
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error?.response?.data ?? error?.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
