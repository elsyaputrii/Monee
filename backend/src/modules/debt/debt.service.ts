import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../../config/database";
import { round2 } from "../../utils/date";
import { badRequest, notFound } from "../../utils/errors";
import type { DebtInput, DebtListQuery, PaymentInput } from "./debt.validation";

interface DebtRow extends RowDataPacket {
  id: number;
  person_name: string;
  type: string;
  total_amount: number;
  installment_amount: number | null;
  due_date: string | null;
  note: string | null;
  created_at: string;
  paid: number;
}

interface PaymentRow extends RowDataPacket {
  id: number;
  amount: number;
  payment_date: string;
  note: string | null;
  created_at: string;
}

// Total yang sudah dibayar dihitung dari tabel pembayaran, bukan disimpan.
// Sisa utang = total - pembayaran, sehingga tidak mungkin tidak sinkron.
const DEBT_SELECT = `
  SELECT d.id, d.person_name, d.type, d.total_amount, d.installment_amount,
         d.due_date, d.note, d.created_at,
         (SELECT COALESCE(SUM(p.amount), 0) FROM debt_payments p WHERE p.debt_id = d.id) AS paid
    FROM debts d`;

function toDebt(row: DebtRow) {
  const totalAmount = Number(row.total_amount);
  const paidAmount = round2(Number(row.paid));
  const remainingAmount = round2(totalAmount - paidAmount);
  const installmentAmount = row.installment_amount === null ? null : Number(row.installment_amount);

  return {
    id: row.id,
    personName: row.person_name,
    type: row.type,
    totalAmount,
    installmentAmount,
    installmentsLeft:
      installmentAmount && remainingAmount > 0 ? Math.ceil(remainingAmount / installmentAmount) : null,
    dueDate: row.due_date,
    note: row.note,
    paidAmount,
    remainingAmount,
    status: remainingAmount <= 0 ? "paid" : "active",
    createdAt: row.created_at,
  };
}

type Debt = ReturnType<typeof toDebt>;

function summarize(debts: Debt[]) {
  let utangRemaining = 0;
  let piutangRemaining = 0;
  let activeCount = 0;
  for (const debt of debts) {
    if (debt.status !== "active") continue;
    activeCount += 1;
    if (debt.type === "utang") utangRemaining += debt.remainingAmount;
    else piutangRemaining += debt.remainingAmount;
  }
  return {
    utangRemaining: round2(utangRemaining),
    piutangRemaining: round2(piutangRemaining),
    activeCount,
  };
}

async function fetchAllDebts(userId: number): Promise<Debt[]> {
  const [rows] = await pool.query<DebtRow[]>(
    `${DEBT_SELECT} WHERE d.user_id = ? ORDER BY d.created_at DESC, d.id DESC`,
    [userId],
  );
  return rows.map(toDebt);
}

/** Ringkasan sisa utang & piutang (dipakai dashboard). */
export async function getDebtSummary(userId: number) {
  return summarize(await fetchAllDebts(userId));
}

export async function listDebts(userId: number, query: DebtListQuery) {
  const all = await fetchAllDebts(userId);
  const items = all.filter((debt) => {
    if (query.type && debt.type !== query.type) return false;
    if (query.status !== "all" && debt.status !== query.status) return false;
    return true;
  });
  return { items, summary: summarize(all) };
}

export async function getDebt(userId: number, id: number): Promise<Debt> {
  const [rows] = await pool.query<DebtRow[]>(`${DEBT_SELECT} WHERE d.id = ? AND d.user_id = ? LIMIT 1`, [
    id,
    userId,
  ]);
  if (!rows[0]) throw notFound("Data utang/piutang tidak ditemukan");
  return toDebt(rows[0]);
}

export async function getDebtDetail(userId: number, id: number) {
  const debt = await getDebt(userId, id);
  const [payments] = await pool.query<PaymentRow[]>(
    `SELECT id, amount, payment_date, note, created_at
       FROM debt_payments
      WHERE debt_id = ? AND user_id = ?
      ORDER BY payment_date DESC, id DESC`,
    [id, userId],
  );
  return {
    ...debt,
    payments: payments.map((payment) => ({
      id: payment.id,
      amount: Number(payment.amount),
      date: payment.payment_date,
      note: payment.note,
    })),
  };
}

export async function createDebt(userId: number, input: DebtInput) {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO debts (user_id, person_name, type, total_amount, installment_amount, due_date, note)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      input.personName,
      input.type,
      input.totalAmount,
      input.installmentAmount,
      input.dueDate,
      input.note,
    ],
  );
  return getDebt(userId, result.insertId);
}

export async function updateDebt(userId: number, id: number, input: DebtInput) {
  const current = await getDebt(userId, id);
  if (input.totalAmount < current.paidAmount) {
    throw badRequest(
      `Total tidak boleh lebih kecil dari yang sudah dibayar (${current.paidAmount})`,
      { totalAmount: "Total lebih kecil dari pembayaran yang sudah tercatat" },
    );
  }
  if (input.type !== current.type && current.paidAmount > 0) {
    throw badRequest("Jenis tidak bisa diubah karena sudah ada pembayaran", {
      type: "Hapus pembayaran terlebih dahulu untuk mengubah jenis",
    });
  }

  await pool.query(
    `UPDATE debts
        SET person_name = ?, type = ?, total_amount = ?, installment_amount = ?, due_date = ?, note = ?
      WHERE id = ? AND user_id = ?`,
    [
      input.personName,
      input.type,
      input.totalAmount,
      input.installmentAmount,
      input.dueDate,
      input.note,
      id,
      userId,
    ],
  );
  return getDebt(userId, id);
}

export async function deleteDebt(userId: number, id: number) {
  await getDebt(userId, id);
  // Pembayaran ikut terhapus (ON DELETE CASCADE), saldo otomatis menyesuaikan.
  await pool.query("DELETE FROM debts WHERE id = ? AND user_id = ?", [id, userId]);
}

export async function addPayment(userId: number, debtId: number, input: PaymentInput) {
  const debt = await getDebt(userId, debtId);

  if (debt.remainingAmount <= 0) {
    throw badRequest("Data ini sudah lunas", { amount: "Sudah lunas" });
  }
  if (input.amount > debt.remainingAmount) {
    throw badRequest(`Nominal melebihi sisa (${debt.remainingAmount})`, {
      amount: `Maksimal ${debt.remainingAmount}`,
    });
  }

  await pool.query(
    "INSERT INTO debt_payments (debt_id, user_id, amount, payment_date, note) VALUES (?, ?, ?, ?, ?)",
    [debtId, userId, input.amount, input.date, input.note],
  );
  return getDebtDetail(userId, debtId);
}

export async function deletePayment(userId: number, debtId: number, paymentId: number) {
  await getDebt(userId, debtId);
  const [rows] = await pool.query<PaymentRow[]>(
    "SELECT id FROM debt_payments WHERE id = ? AND debt_id = ? AND user_id = ? LIMIT 1",
    [paymentId, debtId, userId],
  );
  if (!rows[0]) throw notFound("Pembayaran tidak ditemukan");

  await pool.query("DELETE FROM debt_payments WHERE id = ? AND user_id = ?", [paymentId, userId]);
  return getDebtDetail(userId, debtId);
}
