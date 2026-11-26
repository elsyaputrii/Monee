"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLoader } from "@/components/ui/Feedback";
import { useAuth } from "@/features/auth/AuthProvider";

/** Halaman awal: arahkan ke dashboard (sudah login) atau login. */
export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [loading, user, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <PageLoader />
    </div>
  );
}
