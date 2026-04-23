"use client";
import { useAuth } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

const PUBLIC_ROUTES = ["/login", "/setup"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isIbrahimSetup } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;

    // Agar Ibrahim ka password set nahi — setup page par bhejo
    if (!isIbrahimSetup && pathname !== "/setup") {
      router.replace("/setup");
      return;
    }

    // Setup complete ho gaya — login par bhejo
    if (isIbrahimSetup && pathname === "/setup") {
      router.replace("/login");
      return;
    }

    // Login nahi — login page par bhejo
    if (!user && !PUBLIC_ROUTES.includes(pathname)) {
      router.replace("/login");
      return;
    }

    // Login ho gaya — dashboard par bhejo
    if (user && pathname === "/login") {
      router.replace("/dashboard");
      return;
    }
  }, [user, pathname, mounted, isIbrahimSetup]);

  if (!mounted) return null;

  // Public routes — sidebar nahi dikhana
  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
