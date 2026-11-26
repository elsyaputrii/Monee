"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { PageLoader } from "@/components/ui/Feedback";
import { useAuth } from "@/features/auth/AuthProvider";

/** Pengguna yang sudah login tidak perlu melihat halaman login/register. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  return <>{children}</>;
}
