"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Ellipsis, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { PageLoader } from "@/components/ui/Feedback";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/features/auth/AuthProvider";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, PRIMARY_MOBILE_HREFS } from "./nav";

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-soft text-xl">🐷</span>
      Monee
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  // Halaman di dalam aplikasi hanya untuk pengguna yang sudah login
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  // Tutup menu "Lainnya" saat pindah halaman
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const primary = NAV_ITEMS.filter((item) => PRIMARY_MOBILE_HREFS.includes(item.href));
  const secondary = NAV_ITEMS.filter((item) => !PRIMARY_MOBILE_HREFS.includes(item.href));
  const moreActive = secondary.some((item) => isActive(item.href));

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-dvh">
      {/* Sidebar (laptop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface p-5 lg:flex">
        <Logo />
        <nav className="mt-8 flex-1 space-y-1" aria-label="Menu utama">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition",
                isActive(href)
                  ? "bg-lavender-soft text-lavender-ink"
                  : "text-muted hover:bg-surface-2 hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-peach-soft font-bold text-peach-ink">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold text-muted transition hover:bg-red-soft hover:text-red-ink"
            >
              <LogOut className="h-4.5 w-4.5" />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Top bar (HP) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-10">{children}</div>
      </main>

      {/* Bottom nav (HP) */}
      <nav
        aria-label="Menu utama"
        className="pb-safe fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface/95 px-2 pt-2 backdrop-blur lg:hidden"
      >
        {primary.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className="flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-semibold"
          >
            <span
              className={cn(
                "flex h-8 w-14 items-center justify-center rounded-full transition",
                isActive(href) ? "bg-lavender-soft text-lavender-ink" : "text-muted",
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className={isActive(href) ? "text-foreground" : "text-muted"}>{label.split(" ")[0]}</span>
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-semibold"
        >
          <span
            className={cn(
              "flex h-8 w-14 items-center justify-center rounded-full transition",
              moreActive ? "bg-lavender-soft text-lavender-ink" : "text-muted",
            )}
          >
            <Ellipsis className="h-5 w-5" />
          </span>
          <span className={moreActive ? "text-foreground" : "text-muted"}>Lainnya</span>
        </button>
      </nav>

      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="Menu lainnya" size="sm">
        <div className="space-y-1">
          {secondary.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition",
                isActive(href) ? "bg-lavender-soft text-lavender-ink" : "hover:bg-surface-2",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
          <div className="my-2 border-t border-border" />
          <div className="flex items-center gap-3 px-3.5 py-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-peach-soft font-bold text-peach-ink">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold text-red-ink transition hover:bg-red-soft"
          >
            <LogOut className="h-5 w-5" />
            Keluar
          </button>
        </div>
      </Modal>
    </div>
  );
}
