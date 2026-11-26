"use client";

import { useCallback, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EntryRow } from "@/components/ui/EntryRow";
import { EmptyState, ErrorNotice, PageLoader } from "@/components/ui/Feedback";
import { Select } from "@/components/ui/Input";
import { MonthSwitcher } from "@/components/ui/MonthSwitcher";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/components/ui/Toast";
import type { OptionMeta } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useApi } from "@/lib/hooks";
import { currentMonth, formatRupiah } from "@/lib/format";
import { EntryFormModal, type EntryFormInitial, type EntryFormValues } from "./EntryFormModal";

interface EntryItem {
  id: number;
  amount: number;
  date: string;
  note: string | null;
}

interface EntryPageProps<T extends EntryItem> {
  title: string;
  description: string;
  addLabel: string;
  direction: "in" | "out";
  totalLabel: string;
  kindLabel: string;
  filterAllLabel: string;
  emptyEmoji: string;
  emptyTitle: string;
  emptyDescription: string;
  options: OptionMeta<string>[];
  getKind: (item: T) => string;
  getMeta: (value: string) => OptionMeta<string>;
  fetchList: (params: { month: string; kind: string }) => Promise<{ items: T[]; total: number }>;
  save: (id: number | null, values: EntryFormValues) => Promise<unknown>;
  remove: (id: number) => Promise<unknown>;
}

/** Halaman daftar + tambah/ubah/hapus untuk pemasukan dan pengeluaran (logikanya sama). */
export function EntryPage<T extends EntryItem>(props: EntryPageProps<T>) {
  const {
    title,
    description,
    addLabel,
    direction,
    totalLabel,
    kindLabel,
    filterAllLabel,
    emptyEmoji,
    emptyTitle,
    emptyDescription,
    options,
    getKind,
    getMeta,
    fetchList,
    save,
    remove,
  } = props;

  const toast = useToast();
  const [month, setMonth] = useState(currentMonth());
  const [kind, setKind] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [deleting, setDeleting] = useState<T | null>(null);

  const { data, loading, error, reload } = useApi(
    () => fetchList({ month, kind }),
    [month, kind],
  );

  const initial = useMemo<EntryFormInitial | null>(
    () =>
      editing
        ? {
            id: editing.id,
            kind: getKind(editing),
            amount: editing.amount,
            date: editing.date,
            note: editing.note,
          }
        : null,
    [editing, getKind],
  );

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  async function handleSubmit(values: EntryFormValues) {
    await save(editing?.id ?? null, values);
    toast.success(editing ? "Perubahan disimpan" : "Berhasil ditambahkan");
    setFormOpen(false);
    reload();
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await remove(deleting.id);
      toast.success("Berhasil dihapus");
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
      setDeleting(null);
    }
  }

  const items = data?.items ?? [];

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={title}
        description={description}
        action={
          <Button onClick={openCreate} leftIcon={<Plus className="h-4.5 w-4.5" />}>
            {addLabel}
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <MonthSwitcher value={month} onChange={setMonth} />
        <Select
          value={kind}
          onChange={(event) => setKind(event.target.value)}
          aria-label={kindLabel}
          className="w-full sm:w-52"
        >
          <option value="">{filterAllLabel}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.emoji} {option.label}
            </option>
          ))}
        </Select>
      </div>

      <Card className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-muted">{totalLabel}</span>
        <span
          className={cn(
            "text-xl font-extrabold tabular-nums",
            direction === "in" ? "text-mint-ink" : "text-pink-ink",
          )}
        >
          {formatRupiah(data?.total ?? 0)}
        </span>
      </Card>

      {error && !data ? (
        <ErrorNotice message={error} onRetry={reload} />
      ) : loading && !data ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            emoji={emptyEmoji}
            title={emptyTitle}
            description={emptyDescription}
            action={
              <Button onClick={openCreate} leftIcon={<Plus className="h-4.5 w-4.5" />}>
                {addLabel}
              </Button>
            }
          />
        </Card>
      ) : (
        <Card className="p-2 sm:p-3">
          {items.map((item) => {
            const meta = getMeta(getKind(item));
            return (
              <EntryRow
                key={item.id}
                emoji={meta.emoji}
                tone={meta.tone}
                title={meta.label}
                subtitle={item.note}
                date={item.date}
                amount={item.amount}
                direction={direction}
                actions={
                  <>
                    <button
                      type="button"
                      aria-label="Ubah"
                      onClick={() => {
                        setEditing(item);
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
                  </>
                }
              />
            );
          })}
        </Card>
      )}

      <EntryFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `Ubah ${title}` : addLabel}
        kindLabel={kindLabel}
        options={options}
        initial={initial}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Hapus data ini?"
        message="Data yang dihapus tidak bisa dikembalikan, dan saldo akan dihitung ulang otomatis."
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
