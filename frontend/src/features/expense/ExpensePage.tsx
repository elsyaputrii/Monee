"use client";

import { EntryPage } from "@/features/entries/EntryPage";
import { EXPENSE_CATEGORIES, getExpenseMeta } from "@/lib/constants";
import type { Expense } from "@/types";
import { expenseApi } from "./expense.api";

const getKind = (item: Expense) => item.category;

export function ExpensePage() {
  return (
    <EntryPage<Expense>
      title="Pengeluaran"
      description="Catat ke mana uangmu pergi, lengkap dengan kategori."
      addLabel="Tambah Pengeluaran"
      direction="out"
      totalLabel="Total pengeluaran bulan ini"
      kindLabel="Kategori"
      filterAllLabel="Semua kategori"
      emptyEmoji="🛍️"
      emptyTitle="Belum ada pengeluaran"
      emptyDescription="Catat pengeluaran harianmu supaya mudah dipantau dan dibandingkan dengan anggaran."
      options={EXPENSE_CATEGORIES}
      getKind={getKind}
      getMeta={getExpenseMeta}
      fetchList={expenseApi.list}
      save={expenseApi.save}
      remove={expenseApi.remove}
    />
  );
}
