import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  FileEdit,
  ClipboardList,
  Users,
  Settings,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { isAdmin } from "@/utils/roles";

export default function LeavesHome() {
  const { user } = useAuth();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ⛔ Prevent hydration mismatch
  if (!mounted) return null;

  const canManageLeaves = isAdmin(user?.roles);

  const features = [
    ...(canManageLeaves
      ? [
          {
            title: "Leave Types",
            desc: "Define and manage all leave categories such as annual, sick, unpaid, and more.",
            icon: <FileEdit className="w-8 h-8" />,
            link: "/subsystems/leaves/types",
            gradient: "from-blue-500 to-cyan-500",
          },
        ]
      : []),

    {
      title: "Leave Policies",
      desc: "Configure rules for accruals, carryovers, limits, and eligibility.",
      icon: <Settings className="w-8 h-8" />,
      link: "/subsystems/leaves/policies",
      gradient: "from-cyan-500 to-teal-500",
    },
    {
      title: "Leave Requests",
      desc: "Submit requests, track status, and manage approval workflow.",
      icon: <ClipboardList className="w-8 h-8" />,
      link: "/subsystems/leaves/requests",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Leave Entitlements",
      desc: "Manage employee annual entitlements, balances, and adjustments.",
      icon: <Users className="w-8 h-8" />,
      link: "/subsystems/leaves/entitlements",
      gradient: "from-indigo-500 to-purple-600",
    },
    {
      title: "Leave Calendar",
      desc: "Manage official holidays, blocked days, and organization schedules.",
      icon: <Calendar className="w-8 h-8" />,
      link: "/subsystems/leaves/calendar",
      gradient: "from-teal-500 to-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white px-6 py-24">
      <div className="max-w-5xl mx-auto text-center mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-cyan-400">
            Leaves Management Module
          </span>
        </div>

        <h1 className="text-5xl font-light mb-4">
          Leaves Management
          <br />
          <span className="text-blue-300">Subsystem Dashboard</span>
        </h1>

        <p className="text-gray-300 max-w-2xl mx-auto">
          Manage all leave-related configurations, policies, requests,
          entitlements, and calendar scheduling in one unified place.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f, index) => (
          <Link key={index} href={f.link}>
            <div className="group cursor-pointer relative">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-30 blur-xl transition-all rounded-3xl`}
              />
              <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl group-hover:border-white/20 transition-all hover:-translate-y-2">
                <div className="mb-5 relative">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-50 blur-md rounded-2xl`}
                  />
                  <div
                    className={`relative inline-flex p-3 rounded-2xl text-white bg-gradient-to-br ${f.gradient}`}
                  >
                    {f.icon}
                  </div>
                </div>

                <h3 className="text-2xl mb-3">{f.title}</h3>
                <p className="text-gray-400 mb-4 leading-relaxed">{f.desc}</p>

                <div className="flex items-center gap-2 text-cyan-400 opacity-0 group-hover:opacity-100 transition-all">
                  Open
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
