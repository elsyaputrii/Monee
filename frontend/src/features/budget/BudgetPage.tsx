"use client";

import { useState } from "react";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge, IconBubble } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState, ErrorNotice, PageLoader } from "@/components/ui/Feedback";
import { MonthSwitcher } from "@/components/ui/MonthSwitcher";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import { getExpenseMeta, TONE_BAR_CLASS } from "@/lib/constants";
import { currentMonth, formatRupiah, shiftMonth } from "@/lib/format";
import { useApi } from "@/lib/hooks";
import type { BudgetItem } from "@/types";
import { budgetApi } from "./budget.api";
import { BudgetFormModal, type BudgetFormInitial } from "./BudgetFormModal";

const STATUS_BADGE = {
  ok: { tone: "mint", label: "Aman" },
  warning: { tone: "lemon", label: "Hampir habis" },
  over: { tone: "red", label: "Melebihi" },
} as const;

export function BudgetPage() {
  const toast = useToast();
  const [month, setMonth] = useState(currentMonth());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetFormInitial | null>(null);
  const [deleting, setDeleting] = useState<BudgetItem | null>(null);
  const [copying, setCopying] = useState(false);

  const { data, loading, error, reload } = useApi(() => budgetApi.overview(month), [month]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  async function handleSubmit(values: { category: string; amount: number }) {
    await budgetApi.save({ ...values, month });
    toast.success("Anggaran disimpan");
    setFormOpen(false);
    reload();
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await budgetApi.remove(deleting.id);
      toast.success("Anggaran dihapus");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    }
    setDeleting(null);
  }

  async function handleCopy() {
    setCopying(true);
    try {
      const result = await budgetApi.copy({ from: shiftMonth(month, -1), to: month });
      toast.success(result.items.length > 0 ? "Anggaran bulan lalu disalin" : "Bulan lalu belum punya anggaran");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyalin");
    } finally {
      setCopying(false);
    }
  }

  const items = data?.items ?? [];
  const summary = data?.summary;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Anggaran"
        description="Tentukan batas pengeluaran per kategori setiap bulan."
        action={
          <Button onClick={openCreate} leftIcon={<Plus className="h-4.5 w-4.5" />}>
            Tambah Anggaran
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <MonthSwitcher value={month} onChange={setMonth} />
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          loading={copying}
          leftIcon={<Copy className="h-4 w-4" />}
        >
          Salin dari bulan lalu
        </Button>
      </div>

      {error && !data ? (
        <ErrorNotice message={error} onRetry={reload} />
      ) : loading && !data ? (
        <PageLoader />
      ) : (
        <>
          {summary && items.length > 0 && (
            <Card className="mb-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted">Terpakai dari total anggaran</p>
                  <p className="mt-1 text-2xl font-extrabold tabular-nums">
                    {formatRupiah(summary.totalSpent)}
                    <span className="text-base font-semibold text-muted"> / {formatRupiah(summary.totalBudget)}</span>
                  </p>
                </div>
                <Badge tone={summary.remaining < 0 ? "red" : "mint"}>
                  {summary.remaining < 0
                    ? `Lebih ${formatRupiah(-summary.remaining)}`
                    : `Sisa ${formatRupiah(summary.remaining)}`}
                </Badge>
              </div>
              <ProgressBar
                value={summary.percent}
                barClassName={summary.percent > 100 ? "bg-red-ink/60" : "bg-lavender-ink/60"}
                className="mt-4"
              />
            </Card>
          )}

          {items.length === 0 ? (
            <Card>
              <EmptyState
                emoji="🐖"
                title="Belum ada anggaran"
                description="Buat anggaran per kategori, atau salin dari bulan lalu supaya tidak mengulang."
                action={
                  <Button onClick={openCreate} leftIcon={<Plus className="h-4.5 w-4.5" />}>
                    Tambah Anggaran
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {items.map((item) => {
                const meta = getExpenseMeta(item.category);
                const badge = STATUS_BADGE[item.status];
                return (
                  <Card key={item.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <IconBubble emoji={meta.emoji} tone={meta.tone} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{meta.label}</p>
                        <Badge tone={badge.tone} className="mt-1">
                          {badge.label}
                        </Badge>
                      </div>
                      <div className="flex shrink-0">
                        <button
                          type="button"
                          aria-label="Ubah"
                          onClick={() => {
                            setEditing({ category: item.category, amount: item.amount });
                            setFormOpen(true);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Hapus"
                          onClick={() => setDeleting(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-red-soft hover:text-red-ink"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-end justify-between gap-2 text-sm">
                        <span className="font-bold tabular-nums">{formatRupiah(item.spent)}</span>
                        <span className="text-xs text-muted tabular-nums">dari {formatRupiah(item.amount)}</span>
                      </div>
                      <ProgressBar
                        value={item.percent}
                        barClassName={
                          item.status === "over"
                            ? "bg-red-ink/60"
                            : item.status === "warning"
                              ? "bg-lemon-ink/60"
                              : TONE_BAR_CLASS[meta.tone]
                        }
                      />
                      <p className="mt-2 text-xs text-muted">
                        {item.remaining >= 0
                          ? `Sisa ${formatRupiah(item.remaining)} (${item.percent}% terpakai)`
                          : `Melebihi ${formatRupiah(-item.remaining)}`}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {data && data.unbudgeted.length > 0 && (
            <Card className="mt-4">
              <CardTitle title="Pengeluaran tanpa anggaran" />
              <ul className="space-y-2">
                {data.unbudgeted.map((row) => {
                  const meta = getExpenseMeta(row.category);
                  return (
                    <li key={row.category} className="flex items-center gap-3 text-sm">
                      <IconBubble emoji={meta.emoji} tone={meta.tone} size="sm" />
                      <span className="flex-1 font-medium">{meta.label}</span>
                      <span className="font-semibold tabular-nums">{formatRupiah(row.spent)}</span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </>
      )}

      <BudgetFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        month={month}
        initial={editing}
        usedCategories={items.map((item) => item.category)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Hapus anggaran ini?"
        message="Pengeluaran yang sudah tercatat tidak ikut terhapus."
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
