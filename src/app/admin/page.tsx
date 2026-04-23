"use client";

import { useState, useEffect } from "react";
import { useAuth, toggleUserActive } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Users, ShieldCheck, UserX, UserCheck, Lock } from "lucide-react";

export default function AdminPage() {
  const { isSuperAdmin, getAllUsers } = useAuth(); // ✅ yahan se lo
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!isSuperAdmin) {
      router.replace("/dashboard");
      return;
    }

    setUsers(getAllUsers()); // ✅ ab sahi hai
  }, [isSuperAdmin]);

  const handleToggle = (id: string) => {
    const updated = toggleUserActive(id);
    setUsers([...updated]);
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 bg-red-900/20 rounded-2xl flex items-center justify-center mb-4">
          <Lock size={28} className="text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-500">User Management is only accessible to Super Admin.</p>
      </div>
    );
  }

  const roleBadge: Record<string, string> = {
    superadmin: "badge-yellow",
    admin: "badge-blue",
    salesperson: "badge-gray",
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage team accounts and access levels</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "Total Users", val: users.length, color: "text-blue-400", icon: Users },
          { label: "Active", val: users.filter(u => u.active !== false).length, color: "text-emerald-400", icon: UserCheck },
          { label: "Inactive", val: users.filter(u => u.active === false).length, color: "text-red-400", icon: UserX },
        ].map(({ label, val, color, icon: Icon }) => (
          <div key={label} className="stat-card">
            <span className="text-xs text-slate-500">{label}</span>
            <div className="flex items-center justify-between mt-1">
              <span className={`text-2xl font-bold ${color}`}>{val}</span>
              <Icon size={18} className={`${color} opacity-50`} />
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="crm-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-white">{u.name}</span>
                    </div>
                  </td>

                  <td>
                    <span className="font-mono text-emerald-400 text-sm">
                      {u.username}
                    </span>
                  </td>

                  <td>
                    <span className={`badge ${roleBadge[u.role] || "badge-gray"}`}>
                      {u.role}
                    </span>
                  </td>

                  <td>
                    <span className={`badge ${u.active !== false ? "badge-green" : "badge-red"}`}>
                      {u.active !== false ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    {u.role !== "superadmin" ? (
                      <button
                        onClick={() => handleToggle(u.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          u.active !== false
                            ? "bg-red-900/20 text-red-400 border-red-800/30 hover:bg-red-900/40"
                            : "bg-emerald-900/20 text-emerald-400 border-emerald-800/30 hover:bg-emerald-900/40"
                        }`}
                      >
                        {u.active !== false ? (
                          <>
                            <UserX size={12} /> Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck size={12} /> Activate
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-600 flex items-center gap-1">
                        <ShieldCheck size={12} /> Super Admin
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}