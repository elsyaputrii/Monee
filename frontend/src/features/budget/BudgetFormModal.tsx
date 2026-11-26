"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import { EXPENSE_CATEGORIES, TONE_CLASS } from "@/lib/constants";
import { formatMonth } from "@/lib/format";

export interface BudgetFormInitial {
  category: string;
  amount: number;
}

interface BudgetFormModalProps {
  open: boolean;
  onClose: () => void;
  month: string;
  initial: BudgetFormInitial | null;
  /** Kategori yang sudah punya anggaran bulan ini (tidak bisa dipilih lagi saat menambah). */
  usedCategories: string[];
  onSubmit: (values: { category: string; amount: number }) => Promise<void>;
}

export function BudgetFormModal({ open, onClose, month, initial, usedCategories, onSubmit }: BudgetFormModalProps) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const available = EXPENSE_CATEGORIES.filter(
    (item) => initial?.category === item.value || !usedCategories.includes(item.value),
  );

  useEffect(() => {
    if (!open) return;
    setCategory(initial?.category ?? available[0]?.value ?? "");
    setAmount(initial?.amount ?? null);
    setErrors({});
    setFormError("");
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError("");

    const nextErrors: Record<string, string> = {};
    if (!category) nextErrors.category = "Pilih kategori";
    if (!amount || amount <= 0) nextErrors.amount = "Nominal harus lebih dari 0";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await onSubmit({ category, amount: amount as number });
    } catch (error) {
      if (error instanceof ApiError && error.errors) setErrors(error.errors);
      setFormError(error instanceof Error ? error.message : "Gagal menyimpan");
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Ubah Anggaran" : "Tambah Anggaran"}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <p className="text-sm text-muted">Anggaran untuk {formatMonth(month)}</p>

        {formError && (
          <p role="alert" className="rounded-xl bg-red-soft px-4 py-3 text-sm font-medium text-red-ink">
            {formError}
          </p>
        )}

        {available.length === 0 ? (
          <p className="rounded-xl bg-lavender-soft px-4 py-3 text-sm font-medium text-lavender-ink">
            Semua kategori sudah punya anggaran bulan ini. Ubah salah satunya dari daftar.
          </p>
        ) : (
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">Kategori</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {available.map((option) => {
                const selected = option.value === category;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={!!initial}
                    onClick={() => setCategory(option.value)}
                    aria-pressed={selected}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition",
                      "disabled:cursor-not-allowed",
                      selected
                        ? cn("border-transparent", TONE_CLASS[option.tone])
                        : "border-border text-muted hover:bg-surface-2 hover:text-foreground disabled:opacity-40",
                    )}
                  >
                    <span aria-hidden>{option.emoji}</span>
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.category && <p className="mt-1.5 text-xs text-red-ink">{errors.category}</p>}
          </fieldset>
        )}

        <Field label="Batas anggaran" error={errors.amount}>
          <MoneyInput value={amount} onChange={setAmount} invalid={!!errors.amount} autoFocus />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" loading={loading} disabled={available.length === 0}>
            Simpan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
