"use client";

import { formatNumber } from "@/lib/format";
import { Input } from "./Input";

interface MoneyInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  invalid?: boolean;
  autoFocus?: boolean;
}

/** Input rupiah dengan pemisah ribuan otomatis (1.250.000). Nilainya tetap number. */
export function MoneyInput({ value, onChange, placeholder = "0", invalid, autoFocus }: MoneyInputProps) {
  return (
    <Input
      inputMode="numeric"
      autoComplete="off"
      autoFocus={autoFocus}
      placeholder={placeholder}
      invalid={invalid}
      value={value === null ? "" : formatNumber(value)}
      icon={<span className="text-xs font-bold">Rp</span>}
      onChange={(event) => {
        const digits = event.target.value.replace(/\D/g, "").slice(0, 13);
        onChange(digits ? Number(digits) : null);
      }}
    />
  );
}
