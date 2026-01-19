import React, { useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { SystemRole } from "@/enums/SystemRole";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();

  const [employeeNumber, setEmployeeNumber] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("");

    try {
      setLoading(true);

      const res = await axiosInstance.post("/auth/login", {
        employeeNumber,
        password,
      });

      const { access_token, payload } = res.data;

      // Save auth info
      localStorage.setItem("token", access_token);

      // Save identity
      localStorage.setItem("userId", payload?.id ?? "");
      localStorage.setItem("username", payload?.username ?? "");

      // Save roles (support both payload.role and payload.roles)
      const roles: string[] = Array.isArray(payload?.roles)
        ? payload.roles
        : payload?.role
        ? [payload.role]
        : [];

      localStorage.setItem("roles", JSON.stringify(roles));
      localStorage.setItem("role", roles[0] ?? payload?.role ?? "");

      // ✅ IMPORTANT: Always go to an existing route
      // (Your project definitely has /dashboard.tsx)
      router.push("/dashboard");
    } catch (err: any) {
      setMsg(err?.response?.data?.message || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className="input"
            placeholder="Employee Number"
            value={employeeNumber}
            onChange={(e) => setEmployeeNumber(e.target.value)}
            required
          />

          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {msg && <p className="text-center mt-4 text-red-400">{msg}</p>}

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm mb-2">Don&apos;t have an account?</p>

          <button
            type="button"
            onClick={() => router.push("/register")}
            className="text-blue-400 hover:text-blue-300 underline text-sm"
          >
            Sign up
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-blue-400 hover:text-blue-300 underline text-sm ml-4"
          >
            back
          </button>
        </div>
      </div>
    </div>
  );
}
