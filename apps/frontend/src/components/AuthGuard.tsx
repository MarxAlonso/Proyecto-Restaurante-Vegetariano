"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      // Not authenticated — replace so back button won't return here
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);

      // Check if the token is expired by decoding the JWT payload
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }

      // Check role if specified
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.replace("/login");
        return;
      }

      setAuthorized(true);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/login");
    }
  }, [router, allowedRoles]);

  // Listen for storage changes (logout in another tab)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "token" && !e.newValue) {
        router.replace("/login");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
