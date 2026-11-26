"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { Segmented } from "@/components/ui/Segmented";
import { ApiError } from "@/lib/api";
import type { Debt, DebtInput, DebtType } from "@/types";

interface DebtFormModalProps {
  open: boolean;
  onClose: () => void;
  initial: Debt | null;
  onSubmit: (values: DebtInput) => Promise<void>;
}

export function DebtFormModal({ open, onClose, initial, onSubmit }: DebtFormModalProps) {
  const [type, setType] = useState<DebtType>("utang");
  const [personName, setPersonName] = useState("");
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [installment, setInstallment] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setType(initial?.type ?? "utang");
    setPersonName(initial?.personName ?? "");
    setTotalAmount(initial?.totalAmount ?? null);
    setInstallment(initial?.installmentAmount ?? null);
    setDueDate(initial?.dueDate ?? "");
    setNote(initial?.note ?? "");
    setErrors({});
    setFormError("");
    setLoading(false);
  }, [open, initial]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError("");

    const nextErrors: Record<string, string> = {};
    if (!personName.trim()) nextErrors.personName = "Nama orang wajib diisi";
    if (!totalAmount || totalAmount <= 0) nextErrors.totalAmount = "Total harus lebih dari 0";
    if (installment && totalAmount && installment > totalAmount) {
      nextErrors.installmentAmount = "Cicilan tidak boleh lebih besar dari total";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await onSubmit({
        personName: personName.trim(),
        type,
        totalAmount: totalAmount as number,
        installmentAmount: installment && installment > 0 ? installment : null,
        dueDate: dueDate || null,
        note: note.trim() || null,
      });
    } catch (error) {
      if (error instanceof ApiError && error.errors) setErrors(error.errors);
      setFormError(error instanceof Error ? error.message : "Gagal menyimpan");
      setLoading(false);
    }
  }

  const isUtang = type === "utang";

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Ubah Data" : "Tambah Utang / Piutang"}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <p role="alert" className="rounded-xl bg-red-soft px-4 py-3 text-sm font-medium text-red-ink">
            {formError}
          </p>
        )}

        <div>
          <p className="mb-1.5 text-sm font-medium">Jenis</p>
          <Segmented
            value={type}
            onChange={setType}
            className="w-full [&>button]:flex-1"
            options={[
              { value: "utang", label: "🤝 Utang saya" },
              { value: "piutang", label: "💌 Piutang" },
            ]}
          />
          <p className="mt-1.5 text-xs text-muted">
            {isUtang
              ? "Kamu berutang ke orang lain. Saldo baru berkurang saat kamu membayar."
              : "Orang lain berutang ke kamu. Saldo baru bertambah saat dia membayar."}
          </p>
        </div>

        <Field label={isUtang ? "Berutang kepada" : "Yang berutang"} error={errors.personName}>
          <Input
            value={personName}
            onChange={(event) => setPersonName(event.target.value)}
            maxLength={100}
            placeholder="Nama orang"
            invalid={!!errors.personName}
          />
        </Field>

        <Field label="Total nominal" error={errors.totalAmount}>
          <MoneyInput value={totalAmount} onChange={setTotalAmount} invalid={!!errors.totalAmount} />
        </Field>

        <Field
          label="Cicilan per pembayaran (opsional)"
          error={errors.installmentAmount}
          hint="Dipakai untuk menghitung perkiraan sisa cicilan"
        >
          <MoneyInput value={installment} onChange={setInstallment} invalid={!!errors.installmentAmount} />
        </Field>

        <Field label="Jatuh tempo (opsional)" error={errors.dueDate}>
          <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </Field>

        <Field label="Keterangan (opsional)" error={errors.note}>
          <Textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={255} />
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
