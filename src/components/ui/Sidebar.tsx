"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, Users, Phone, Target, BarChart3,
  BookOpen, GraduationCap, Settings, ChevronRight, LogOut
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();

  const allNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
    { href: "/leads", label: "Leads", icon: Users, show: true },
    { href: "/calls", label: "Call Log", icon: Phone, show: true },
    { href: "/targets", label: "Targets", icon: Target, show: isAdmin },
    { href: "/trials", label: "Trials", icon: BookOpen, show: isAdmin },
    { href: "/students", label: "Students", icon: GraduationCap, show: isAdmin },
    { href: "/reports", label: "Reports", icon: BarChart3, show: isAdmin },
    { href: "/admin", label: "User Management", icon: Settings, show: isSuperAdmin },
  ];

  const navItems = allNavItems.filter(n => n.show);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const roleBadgeColor: Record<string, string> = {
    superadmin: "bg-amber-900/40 text-amber-400",
    admin: "bg-blue-900/40 text-blue-400",
    salesperson: "bg-slate-800 text-slate-400",
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-800">
        <div className="flex items-center justify-center">
          <Image src="/logo.webp" alt="Quran Hosting" width={160} height={48} style={{ width: "160px", height: "auto" }} className="object-contain" priority />
        </div>
        <p className="text-xs text-slate-500 text-center mt-1">Sales CRM</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">Menu</p>
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group border ${
                    active
                      ? "bg-emerald-600/15 text-emerald-400 border-emerald-600/25"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800 border-transparent"
                  }`}
                >
                  <Icon size={16} className={active ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"} />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight size={13} className="text-emerald-600" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Footer */}
      <div className="px-4 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-purple-600 rounded-full flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-100 truncate">{user?.name}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleBadgeColor[user?.role || "salesperson"]}`}>
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-red-400 hover:bg-red-900/10 transition-all"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
