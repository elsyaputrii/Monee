"use client";

import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorNotice, PageLoader } from "@/components/ui/Feedback";
import { Field, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { formatDate, formatRupiah, todayString } from "@/lib/format";
import { debtApi } from "./debt.api";

interface DebtDetailModalProps {
  debtId: number | null;
  onClose: () => void;
  /** Dipanggil setiap data berubah agar daftar di belakang ikut diperbarui. */
  onChanged: () => void;
}

export function DebtDetailModal({ debtId, onClose, onChanged }: DebtDetailModalProps) {
  return (
    <Modal open={debtId !== null} onClose={onClose} title="Detail & Pembayaran" size="lg">
      {debtId !== null && <DetailContent debtId={debtId} onChanged={onChanged} />}
    </Modal>
  );
}

function DetailContent({ debtId, onChanged }: { debtId: number; onChanged: () => void }) {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(() => debtApi.detail(debtId), [debtId]);
  const [amount, setAmount] = useState<number | null>(null);
  const [date, setDate] = useState(todayString());
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  if (error && !data) return <ErrorNotice message={error} onRetry={reload} />;
  if (loading && !data) return <PageLoader />;
  if (!data) return null;

  const isUtang = data.type === "utang";
  const percent = data.totalAmount > 0 ? (data.paidAmount / data.totalAmount) * 100 : 0;

  async function handlePay(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!amount || amount <= 0) nextErrors.amount = "Nominal harus lebih dari 0";
    else if (amount > (data?.remainingAmount ?? 0)) {
      nextErrors.amount = `Maksimal ${formatRupiah(data?.remainingAmount ?? 0)}`;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await debtApi.addPayment(debtId, { amount: amount as number, date, note: note.trim() || null });
      toast.success(isUtang ? "Pembayaran dicatat" : "Penerimaan dicatat");
      setAmount(null);
      setNote("");
      reload();
      onChanged();
    } catch (err) {
      if (err instanceof ApiError && err.errors) setErrors(err.errors);
      else toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemovePayment(paymentId: number) {
    try {
      await debtApi.removePayment(debtId, paymentId);
      toast.success("Pembayaran dihapus");
      reload();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-surface-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-lg font-bold">{data.personName}</p>
            <p className="text-xs text-muted">{isUtang ? "Utang saya" : "Piutang"}</p>
          </div>
          <Badge tone={data.status === "paid" ? "mint" : isUtang ? "peach" : "sky"}>
            {data.status === "paid" ? "Lunas ✨" : isUtang ? "Belum lunas" : "Belum diterima"}
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[11px] text-muted">Total</p>
            <p className="text-sm font-bold tabular-nums">{formatRupiah(data.totalAmount)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted">{isUtang ? "Dibayar" : "Diterima"}</p>
            <p className="text-sm font-bold tabular-nums text-mint-ink">{formatRupiah(data.paidAmount)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted">Sisa</p>
            <p className="text-sm font-bold tabular-nums text-peach-ink">{formatRupiah(data.remainingAmount)}</p>
          </div>
        </div>

        <ProgressBar value={percent} barClassName="bg-mint-ink/60" className="mt-4 bg-surface" />

        {(data.installmentAmount || data.dueDate || data.note) && (
          <ul className="mt-4 space-y-1 text-xs text-muted">
            {data.installmentAmount && (
              <li>
                Cicilan: {formatRupiah(data.installmentAmount)}
                {data.installmentsLeft ? ` · sisa ±${data.installmentsLeft}x` : ""}
              </li>
            )}
            {data.dueDate && <li>Jatuh tempo: {formatDate(data.dueDate)}</li>}
            {data.note && <li>Catatan: {data.note}</li>}
          </ul>
        )}
      </div>

      {data.status === "active" && (
        <form onSubmit={handlePay} noValidate className="space-y-3 rounded-2xl border border-border p-4">
          <p className="text-sm font-bold">{isUtang ? "Bayar cicilan" : "Catat penerimaan"}</p>
          <p className="text-xs text-muted">
            {isUtang
              ? "Pembayaran akan mengurangi saldo kamu pada tanggal yang dipilih."
              : "Penerimaan akan menambah saldo kamu pada tanggal yang dipilih."}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nominal" error={errors.amount}>
              <MoneyInput
                value={amount}
                onChange={setAmount}
                invalid={!!errors.amount}
                placeholder={data.installmentAmount ? String(data.installmentAmount) : "0"}
              />
            </Field>
            <Field label="Tanggal" error={errors.date}>
              <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Catatan (opsional)"
              maxLength={255}
              className="min-w-0 flex-1"
            />
            <Button type="submit" loading={saving}>
              Simpan
            </Button>
          </div>
          {data.installmentAmount && (
            <button
              type="button"
              onClick={() => setAmount(Math.min(data.installmentAmount as number, data.remainingAmount))}
              className="text-xs font-semibold text-lavender-ink hover:underline"
            >
              Isi sesuai cicilan ({formatRupiah(data.installmentAmount)})
            </button>
          )}
        </form>
      )}

      <div>
        <p className="mb-2 text-sm font-bold">Riwayat pembayaran</p>
        {data.payments.length === 0 ? (
          <EmptyState emoji="🧾" title="Belum ada pembayaran" description="Pembayaran yang kamu catat akan muncul di sini." />
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border">
            {data.payments.map((payment) => (
              <li key={payment.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold tabular-nums">{formatRupiah(payment.amount)}</p>
                  <p className="truncate text-xs text-muted">
                    {formatDate(payment.date)}
                    {payment.note ? ` · ${payment.note}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Hapus pembayaran"
                  onClick={() => handleRemovePayment(payment.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-red-soft hover:text-red-ink"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
