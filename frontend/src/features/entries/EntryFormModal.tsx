"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import { TONE_CLASS, type OptionMeta } from "@/lib/constants";
import { todayString } from "@/lib/format";

export interface EntryFormValues {
  kind: string;
  amount: number;
  date: string;
  note: string | null;
}

export interface EntryFormInitial {
  id: number;
  kind: string;
  amount: number;
  date: string;
  note: string | null;
}

interface EntryFormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  kindLabel: string;
  options: OptionMeta<string>[];
  initial: EntryFormInitial | null;
  onSubmit: (values: EntryFormValues) => Promise<void>;
}

/** Form tambah/ubah pemasukan atau pengeluaran (pilihan sumber/kategori + nominal + tanggal + catatan). */
export function EntryFormModal({ open, onClose, title, kindLabel, options, initial, onSubmit }: EntryFormModalProps) {
  const [kind, setKind] = useState(options[0].value);
  const [amount, setAmount] = useState<number | null>(null);
  const [date, setDate] = useState(todayString());
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  // Isi ulang form setiap kali dibuka
  useEffect(() => {
    if (!open) return;
    setKind(initial?.kind ?? options[0].value);
    setAmount(initial?.amount ?? null);
    setDate(initial?.date ?? todayString());
    setNote(initial?.note ?? "");
    setErrors({});
    setFormError("");
    setLoading(false);
  }, [open, initial, options]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError("");

    const nextErrors: Record<string, string> = {};
    if (!amount || amount <= 0) nextErrors.amount = "Nominal harus lebih dari 0";
    if (!date) nextErrors.date = "Tanggal wajib diisi";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await onSubmit({ kind, amount: amount as number, date, note: note.trim() || null });
    } catch (error) {
      if (error instanceof ApiError && error.errors) setErrors(error.errors);
      setFormError(error instanceof Error ? error.message : "Gagal menyimpan");
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <p role="alert" className="rounded-xl bg-red-soft px-4 py-3 text-sm font-medium text-red-ink">
            {formError}
          </p>
        )}

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">{kindLabel}</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {options.map((option) => {
              const selected = option.value === kind;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setKind(option.value)}
                  aria-pressed={selected}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition",
                    selected
                      ? cn("border-transparent", TONE_CLASS[option.tone])
                      : "border-border text-muted hover:bg-surface-2 hover:text-foreground",
                  )}
                >
                  <span aria-hidden>{option.emoji}</span>
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <Field label="Nominal" error={errors.amount}>
          <MoneyInput value={amount} onChange={setAmount} invalid={!!errors.amount} autoFocus />
        </Field>

        <Field label="Tanggal" error={errors.date}>
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} invalid={!!errors.date} />
        </Field>

        <Field label="Keterangan (opsional)" error={errors.note}>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={255}
            placeholder="Contoh: makan siang bareng teman"
          />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" loading={loading}>
            Simpan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
