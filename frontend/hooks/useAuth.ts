import { SystemRole } from "../enums/SystemRole";

export const useAuth = () => {
  if (typeof window === "undefined") {
    return { user: null };
  }

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  console.log("Logged-in role from storage:", role);

  if (!role || !userId) {
    return { user: null };
  }

  return {
    user: {
      id: userId,
      username,
      roles: [role as SystemRole], // ✅ correct
    },
  };
};
