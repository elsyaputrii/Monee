import type { ReactNode } from "react";
import { PiggyBank, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const HIGHLIGHTS = [
  { icon: Wallet, text: "Saldo otomatis terhitung tiap bulan", tone: "bg-mint-soft text-mint-ink" },
  { icon: PiggyBank, text: "Anggaran per kategori yang rapi", tone: "bg-pink-soft text-pink-ink" },
  { icon: TrendingUp, text: "Laporan bulanan & tahunan bergrafik", tone: "bg-lavender-soft text-lavender-ink" },
];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Panel kiri: hanya tampil di laptop */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-surface-2 p-12 lg:flex">
        <div className="flex items-center gap-2.5 text-xl font-extrabold">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-soft text-xl">🐷</span>
          Monee
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            Atur uangmu,
            <br />
            tanpa ribet. <Sparkles className="inline h-8 w-8 text-lemon-ink" />
          </h2>
          <p className="mt-4 text-muted">
            Catat pemasukan, pengeluaran, dan utang piutang di satu tempat. Cocok untuk mahasiswa dan anak magang.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, text, tone }) => (
              <li key={text} className="flex items-center gap-3 text-sm font-medium">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
                  <Icon className="h-4.5 w-4.5" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted">© {new Date().getFullYear()} Monee</p>

        <div aria-hidden className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-lavender-soft" />
        <div aria-hidden className="absolute -right-10 top-24 h-32 w-32 rounded-full bg-peach-soft" />
      </aside>

      {/* Panel kanan: form */}
      <main className="flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <div className="flex items-center gap-2 text-lg font-extrabold lg:invisible">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-soft">🐷</span>
            Monee
          </div>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-12">
          <div className="animate-fade-up w-full max-w-sm">
            <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-6 text-center text-sm text-muted">{footer}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
