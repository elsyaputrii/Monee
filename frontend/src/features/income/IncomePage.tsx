"use client";

import { EntryPage } from "@/features/entries/EntryPage";
import { getIncomeMeta, INCOME_SOURCES } from "@/lib/constants";
import type { Income } from "@/types";
import { incomeApi } from "./income.api";

const getKind = (item: Income) => item.source;

export function IncomePage() {
  return (
    <EntryPage<Income>
      title="Pemasukan"
      description="Uang jajan, gaji magang, beasiswa, dan pemasukan lainnya."
      addLabel="Tambah Pemasukan"
      direction="in"
      totalLabel="Total pemasukan bulan ini"
      kindLabel="Sumber pemasukan"
      filterAllLabel="Semua sumber"
      emptyEmoji="🐷"
      emptyTitle="Belum ada pemasukan"
      emptyDescription="Catat uang jajan, gaji magang, atau beasiswa supaya saldo kamu terhitung."
      options={INCOME_SOURCES}
      getKind={getKind}
      getMeta={getIncomeMeta}
      fetchList={incomeApi.list}
      save={incomeApi.save}
      remove={incomeApi.remove}
    />
  );
}
