import React, { useState } from "react";
import api from "../api/axios";

interface RegisterForm {
  employeeNumber: string;
  password: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  dateOfHire: string;
  role: string;
  city: string;   // UI only
  street: string; // UI only
}

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState<RegisterForm>({
    employeeNumber: "",
    password: "",
    firstName: "",
    lastName: "",
    nationalId: "",
    dateOfHire: "",
    role: "DEPARTMENT_EMPLOYEE",
    city: "",
    street: "",
  });

  const [msg, setMsg] = useState<string>("");

  const update = (k: keyof RegisterForm, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setMsg("");

    try {
      // ✅ SEND ONLY WHAT BACKEND EXPECTS
      await api.post("/auth/register", {
        employeeNumber: form.employeeNumber,
        password: form.password,
        role: form.role,
        firstName: form.firstName,
        lastName: form.lastName,
        nationalId: form.nationalId,
        dateOfHire: form.dateOfHire,
      });

      setMsg("Registration successful 🎉");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (err: any) {
      setMsg(err.response?.data?.message || "Registration failed ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <form
        onSubmit={handleRegister}
        className="bg-white/10 p-8 rounded-xl w-full max-w-xl space-y-4"
      >
        <h1 className="text-2xl text-white text-center">Register</h1>

        {/* Employee Number */}
        <input
          placeholder="Employee Number"
          value={form.employeeNumber}
          onChange={(e) => update("employeeNumber", e.target.value)}
          required
          className="w-full p-3 bg-white/5 rounded text-white"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          required
          className="w-full p-3 bg-white/5 rounded text-white"
        />

        {/* First Name */}
        <input
          placeholder="First Name"
          value={form.firstName}
          onChange={(e) => update("firstName", e.target.value)}
          required
          className="w-full p-3 bg-white/5 rounded text-white"
        />

        {/* Last Name */}
        <input
          placeholder="Last Name"
          value={form.lastName}
          onChange={(e) => update("lastName", e.target.value)}
          required
          className="w-full p-3 bg-white/5 rounded text-white"
        />

        {/* National ID */}
        <input
          placeholder="National ID"
          value={form.nationalId}
          onChange={(e) => update("nationalId", e.target.value)}
          required
          className="w-full p-3 bg-white/5 rounded text-white"
        />

        {/* Date of Hire */}
        <input
          type="date"
          value={form.dateOfHire}
          onChange={(e) => update("dateOfHire", e.target.value)}
          required
          className="w-full p-3 bg-white/5 rounded text-white"
        />

        {/* Role */}
        <select
          value={form.role}
          onChange={(e) => update("role", e.target.value)}
          className="w-full p-3 bg-white/5 rounded text-white"
        >
          <option value="DEPARTMENT_EMPLOYEE">Department Employee</option>
          <option value="ADMIN">Admin</option>
          <option value="HR_MANAGER">HR Manager</option>
        </select>

        {/* Optional UI-only fields (NOT sent) */}
        <input
          placeholder="City (optional)"
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
          className="w-full p-3 bg-white/5 rounded text-white"
        />

        <input
          placeholder="Street (optional)"
          value={form.street}
          onChange={(e) => update("street", e.target.value)}
          className="w-full p-3 bg-white/5 rounded text-white"
        />

        <button className="w-full py-3 bg-blue-600 rounded-xl">
          Register
        </button>

        {msg && <p className="text-center mt-4 text-white">{msg}</p>}
      </form>
    </div>
  );
};

export default RegisterPage;
