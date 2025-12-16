import React, { useState } from "react";
import api from "../api/axios";

const LoginPage: React.FC = () => {
  const [employeeNumber, setEmployeeNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [msg, setMsg] = useState<string>("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("");

    try {
      const res = await api.post("/auth/login", {
        employeeNumber,
        password,
      });

      const data = res.data;

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", String(data.payload.role));
      localStorage.setItem("userId", data.payload.id);
      localStorage.setItem("username", data.payload.username);
      localStorage.setItem("loginSuccess", "true");

      window.location.href = "/";
    } catch (err: any) {
      setMsg(err.response?.data?.message || "Login failed ❌");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10">

        <h1 className="text-3xl font-semibold text-center text-white mb-6">
          Employee Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Employee Number"
            value={employeeNumber}
            onChange={(e) => setEmployeeNumber(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-white/5 text-white"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-white/5 text-white"
          />

          <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl">
            Login
          </button>
        </form>

        {msg && <p className="text-center text-red-400 mt-4">{msg}</p>}

        <div className="mt-6 text-center text-sm text-gray-300">
          Don’t have an account?{" "}
          <a href="/register" className="text-cyan-400 hover:underline">
            Register
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
