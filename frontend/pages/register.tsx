 import React, { useState } from "react";
import { useRouter } from "next/router";
import api from "../api/axios";

type HRRole = "HR_ADMIN" | "HR_MANAGER" | "HR_EMPLOYEE" | "";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    employeeNumber: "",
    password: "",
    firstName: "",
    lastName: "",
    nationalId: "",
    dateOfHire: "",
    city: "",
    street: "",
    role: "" as HRRole,
  });

 const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // ===============================
  // ✅ VALIDATE EMPLOYEE NUMBER
  // ===============================
  function isValidHRNumber(employeeNumber: string, role: HRRole) {
    const n = employeeNumber.toUpperCase();
     
    if (role === "HR_ADMIN") return n.startsWith("HRADM");
    if (role === "HR_MANAGER")
      return n.startsWith("HRMAN") || n.startsWith("HRM");
    if (role === "HR_EMPLOYEE") return n.startsWith("HRE");

    return false;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!form.role) {
      setMsg("Please select HR role ❌");
      return;
    }

    if (!isValidHRNumber(form.employeeNumber, form.role)) {
      setMsg(
        "Employee number does NOT match selected role ❌"
      );
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        employeeNumber: form.employeeNumber,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        nationalId: form.nationalId,
        dateOfHire: form.dateOfHire,
        role: form.role,
        address: {
          city: form.city,
          street: form.street,
        },
      });

      alert("HR account registered successfully ✅");
      router.push("/login");
    } catch (err: any) {
      setMsg(err.response?.data?.message || "Registration failed ❌");
    } finally {
      setLoading(false);
    }
  }


  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
    <div className="w-full max-w-md glass-card p-8">

      <h1 className="text-3xl font-semibold text-center mb-2">
        HR Registration
      </h1>

      <p className="text-center text-white/70 mb-6">
        Create an HR account
      </p>

      <form onSubmit={handleRegister} className="space-y-4">

        {/* HR NUMBER */}
        <div>
          <label className="text-sm text-white/70">
            HR Employee Number
          </label>
          <input
            className="input"
            placeholder="HRE1003 / HRMAN1001 / HRADM1001"
            value={form.employeeNumber}
            onChange={(e) =>
              update("employeeNumber", e.target.value)
            }
            required
          />
        </div>

        {/* PASSWORD */}
        <div>
          <label className="text-sm text-white/70">
            Password
          </label>
          <input
            className="input"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
          />
        </div>

        {/* NAME */}
        <div className="grid grid-cols-2 gap-3">
          <input
            className="input"
            placeholder="First Name"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            required
          />
          <input
            className="input"
            placeholder="Last Name"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            required
          />
        </div>

        {/* NATIONAL ID */}
        <div>
          <input
            className="input"
            placeholder="National ID"
            value={form.nationalId}
            onChange={(e) => update("nationalId", e.target.value)}
            required
          />
        </div>

        {/* ROLE */}
        <div>
          <label className="text-sm text-white/70">
            HR Role
          </label>
          <select
            className="input"
            value={form.role}
            onChange={(e) =>
              update("role", e.target.value)
            }
            required
          >
            <option value="">Select HR Role</option>
            <option value="HR_ADMIN">HR Admin</option>
            <option value="HR_MANAGER">HR Manager</option>
            <option value="HR_EMPLOYEE">HR Employee</option>
          </select>
        </div>

        {/* DATE */}
        <div>
          <label className="text-sm text-white/70">
            Date of Hire
          </label>
          <input
            className="input"
            type="date"
            value={form.dateOfHire}
            onChange={(e) =>
              update("dateOfHire", e.target.value)
            }
            required
          />
        </div>

        {/* ADDRESS */}
        <div className="grid grid-cols-2 gap-3">
          <input
            className="input"
            placeholder="City"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
          />
          <input
            className="input"
            placeholder="Street"
            value={form.street}
            onChange={(e) => update("street", e.target.value)}
          />
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="glow-btn w-full mt-2"
        >
          {loading ? "Registering..." : "Register HR"}
        </button>
      </form>

      {/* ERROR */}
      {msg && (
        <p className="text-center mt-4 text-red-400">
          {msg}
        </p>
      )}

      {/* FOOTER */}
      <p className="text-center text-sm text-white/60 mt-6">
        Already have an account?{" "}
        <span
          onClick={() => router.push("/login")}
          className="text-cyan-300 cursor-pointer hover:underline"
        >
          Login
        </span>
      </p>
    </div>
  </div>
);
}