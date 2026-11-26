"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge, IconBubble } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState, ErrorNotice, PageLoader } from "@/components/ui/Feedback";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Segmented } from "@/components/ui/Segmented";
import { StatCard } from "@/components/ui/StatCard";
import { useToast } from "@/components/ui/Toast";
import { formatDate, formatRupiah } from "@/lib/format";
import { useApi } from "@/lib/hooks";
import type { Debt, DebtInput, DebtType } from "@/types";
import { debtApi } from "./debt.api";
import { DebtDetailModal } from "./DebtDetailModal";
import { DebtFormModal } from "./DebtFormModal";

type StatusFilter = "all" | "active" | "paid";

export function DebtPage() {
  const toast = useToast();
  const [status, setStatus] = useState<StatusFilter>("active");
  const [type, setType] = useState<DebtType | "">("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Debt | null>(null);
  const [deleting, setDeleting] = useState<Debt | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

  const { data, loading, error, reload } = useApi(() => debtApi.list({ status, type }), [status, type]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  async function handleSubmit(values: DebtInput) {
    if (editing) await debtApi.update(editing.id, values);
    else await debtApi.create(values);
    toast.success(editing ? "Perubahan disimpan" : "Berhasil ditambahkan");
    setFormOpen(false);
    reload();
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await debtApi.remove(deleting.id);
      toast.success("Data dihapus");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    }
    setDeleting(null);
  }

  const items = data?.items ?? [];
  const summary = data?.summary;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Utang Piutang"
        description="Catat utang, piutang, dan cicilan. Saldo hanya berubah saat ada pembayaran."
        action={
          <Button onClick={openCreate} leftIcon={<Plus className="h-4.5 w-4.5" />}>
            Tambah
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatCard
          label="Sisa utang saya"
          value={formatRupiah(summary?.utangRemaining ?? 0)}
          emoji="🤝"
          tone="peach"
          valueClassName="text-peach-ink"
        />
        <StatCard
          label="Piutang belum kembali"
          value={formatRupiah(summary?.piutangRemaining ?? 0)}
          emoji="💌"
          tone="mint"
          valueClassName="text-mint-ink"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented
          value={status}
          onChange={setStatus}
          options={[
            { value: "active", label: "Aktif" },
            { value: "paid", label: "Lunas" },
            { value: "all", label: "Semua" },
          ]}
        />
        <Segmented
          value={type === "" ? "all" : type}
          onChange={(value) => setType(value === "all" ? "" : (value as DebtType))}
          options={[
            { value: "all", label: "Semua jenis" },
            { value: "utang", label: "Utang" },
            { value: "piutang", label: "Piutang" },
          ]}
        />
      </div>

      {error && !data ? (
        <ErrorNotice message={error} onRetry={reload} />
      ) : loading && !data ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            emoji="🤝"
            title="Belum ada data"
            description="Catat utang atau piutang beserta cicilannya agar tidak ada yang terlupa."
            action={
              <Button onClick={openCreate} leftIcon={<Plus className="h-4.5 w-4.5" />}>
                Tambah
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((debt) => {
            const isUtang = debt.type === "utang";
            const percent = debt.totalAmount > 0 ? (debt.paidAmount / debt.totalAmount) * 100 : 0;
            return (
              <Card key={debt.id} className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <IconBubble emoji={isUtang ? "🤝" : "💌"} tone={isUtang ? "peach" : "mint"} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{debt.personName}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Badge tone={isUtang ? "peach" : "mint"}>{isUtang ? "Utang" : "Piutang"}</Badge>
                      {debt.status === "paid" && <Badge tone="lavender">Lunas ✨</Badge>}
                      {debt.dueDate && debt.status === "active" && (
                        <span className="text-xs text-muted">Tempo {formatDate(debt.dueDate)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0">
                    <button
                      type="button"
                      aria-label="Ubah"
                      onClick={() => {
                        setEditing(debt);
                        setFormOpen(true);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Hapus"
                      onClick={() => setDeleting(debt)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-red-soft hover:text-red-ink"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-[11px] text-muted">Sisa</p>
                      <p className="text-lg font-extrabold tabular-nums">{formatRupiah(debt.remainingAmount)}</p>
                    </div>
                    <p className="text-xs text-muted tabular-nums">
                      {formatRupiah(debt.paidAmount)} / {formatRupiah(debt.totalAmount)}
                    </p>
                  </div>
                  <ProgressBar value={percent} barClassName="bg-mint-ink/60" />
                  {debt.installmentAmount && debt.status === "active" && (
                    <p className="mt-2 text-xs text-muted">
                      Cicilan {formatRupiah(debt.installmentAmount)}
                      {debt.installmentsLeft ? ` · sisa ±${debt.installmentsLeft}x` : ""}
                    </p>
                  )}
                </div>

                <Button variant="secondary" size="sm" onClick={() => setDetailId(debt.id)}>
                  {debt.status === "active"
                    ? isUtang
                      ? "Bayar / lihat detail"
                      : "Catat penerimaan / detail"
                    : "Lihat riwayat"}
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      <DebtFormModal open={formOpen} onClose={() => setFormOpen(false)} initial={editing} onSubmit={handleSubmit} />

      <DebtDetailModal debtId={detailId} onClose={() => setDetailId(null)} onChanged={reload} />

      <ConfirmDialog
        open={deleting !== null}
        title="Hapus data ini?"
        message="Semua pembayaran di dalamnya ikut terhapus, dan saldo akan dihitung ulang otomatis."
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
