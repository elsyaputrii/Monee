"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EntryRow } from "@/components/ui/EntryRow";
import { EmptyState, ErrorNotice, PageLoader } from "@/components/ui/Feedback";
import { Input, Select } from "@/components/ui/Input";
import { MonthSwitcher } from "@/components/ui/MonthSwitcher";
import { PageHeader } from "@/components/ui/PageHeader";
import { Segmented } from "@/components/ui/Segmented";
import { EXPENSE_CATEGORIES, getDebtMeta, getExpenseMeta, getIncomeMeta, INCOME_SOURCES } from "@/lib/constants";
import { currentMonth, formatRupiah } from "@/lib/format";
import { useApi, useDebounced } from "@/lib/hooks";
import type { Transaction } from "@/types";
import { transactionApi, type TransactionParams } from "./transaction.api";

type TypeFilter = TransactionParams["type"];
type Period = "month" | "all";

function describe(tx: Transaction) {
  if (tx.type === "income") {
    const meta = getIncomeMeta(tx.category);
    return { emoji: meta.emoji, tone: meta.tone, title: meta.label, subtitle: tx.description };
  }
  if (tx.type === "expense") {
    const meta = getExpenseMeta(tx.category);
    return { emoji: meta.emoji, tone: meta.tone, title: meta.label, subtitle: tx.description };
  }
  // pembayaran utang / penerimaan piutang
  const meta = getDebtMeta(tx.category);
  const isUtang = tx.category === "utang";
  return {
    emoji: meta.emoji,
    tone: meta.tone,
    title: isUtang ? `Bayar utang ke ${tx.personName}` : `Terima piutang dari ${tx.personName}`,
    subtitle: tx.description,
  };
}

export function TransactionPage() {
  const [type, setType] = useState<TypeFilter>("all");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<Period>("month");
  const [month, setMonth] = useState(currentMonth());
  const [page, setPage] = useState(1);

  const q = useDebounced(search.trim());
  const params: TransactionParams = {
    type,
    category,
    q,
    month: period === "month" ? month : "",
    page,
  };

  const { data, loading, error, reload } = useApi(
    () => transactionApi.list(params),
    [type, category, q, period, month, page],
  );

  // Setiap filter berubah, kembali ke halaman 1
  const resetPage = () => setPage(1);

  const categoryOptions =
    type === "income" ? INCOME_SOURCES : type === "expense" ? EXPENSE_CATEGORIES : null;

  const items = data?.items ?? [];
  const filtered = type !== "all" || category !== "" || q !== "";

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Riwayat Transaksi"
        description="Semua pemasukan, pengeluaran, dan pembayaran utang dalam satu daftar."
      />

      <Card className="mb-4 space-y-3">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            resetPage();
          }}
          placeholder="Cari keterangan, nama orang, atau kategori..."
          icon={<Search className="h-4.5 w-4.5" />}
          aria-label="Cari transaksi"
        />

        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            value={type}
            onChange={(value) => {
              setType(value);
              setCategory("");
              resetPage();
            }}
            options={[
              { value: "all", label: "Semua" },
              { value: "income", label: "Masuk" },
              { value: "expense", label: "Keluar" },
              { value: "debt_payment", label: "Utang" },
            ]}
          />

          {categoryOptions && (
            <Select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                resetPage();
              }}
              aria-label={type === "income" ? "Sumber" : "Kategori"}
              className="w-full sm:w-48"
            >
              <option value="">{type === "income" ? "Semua sumber" : "Semua kategori"}</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.emoji} {option.label}
                </option>
              ))}
            </Select>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            value={period}
            onChange={(value) => {
              setPeriod(value);
              resetPage();
            }}
            options={[
              { value: "month", label: "Per bulan" },
              { value: "all", label: "Semua waktu" },
            ]}
          />
          {period === "month" && (
            <MonthSwitcher
              value={month}
              onChange={(value) => {
                setMonth(value);
                resetPage();
              }}
            />
          )}
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Uang masuk</p>
          <p className="mt-1 text-lg font-extrabold tabular-nums text-mint-ink">
            {formatRupiah(data?.summary.totalIn ?? 0)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Uang keluar</p>
          <p className="mt-1 text-lg font-extrabold tabular-nums text-pink-ink">
            {formatRupiah(data?.summary.totalOut ?? 0)}
          </p>
        </Card>
      </div>

      {error && !data ? (
        <ErrorNotice message={error} onRetry={reload} />
      ) : loading && !data ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            emoji={filtered ? "🔍" : "🧾"}
            title={filtered ? "Tidak ada hasil" : "Belum ada transaksi"}
            description={
              filtered
                ? "Coba ubah kata kunci atau filter yang dipakai."
                : "Transaksi yang kamu catat akan muncul di sini."
            }
          />
        </Card>
      ) : (
        <Card className={loading ? "p-2 opacity-60 transition sm:p-3" : "p-2 transition sm:p-3"}>
          {items.map((tx) => {
            const info = describe(tx);
            return (
              <EntryRow
                key={tx.uid}
                emoji={info.emoji}
                tone={info.tone}
                title={info.title}
                subtitle={info.subtitle}
                date={tx.date}
                amount={tx.amount}
                direction={tx.direction}
              />
            );
          })}
        </Card>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Sebelumnya
          </Button>
          <p className="text-xs font-medium text-muted">
            Halaman {data.page} dari {data.totalPages} · {data.total} transaksi
          </p>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= data.totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Berikutnya
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
