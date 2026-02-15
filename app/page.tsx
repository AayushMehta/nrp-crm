"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Redirect to login
        router.push("/auth/login");
      } else {
        // Redirect to role-based dashboard
        switch (user.role) {
          case "admin":
            router.push("/admin/dashboard");
            break;
          case "rm":
            router.push("/rm/dashboard");
            break;
          case "family":
            router.push("/client/dashboard");
            break;
          case "back_office":
            router.push("/back-office/dashboard");
            break;
        }
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">NRP CRM</h1>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
