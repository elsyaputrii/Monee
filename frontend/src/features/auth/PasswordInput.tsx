"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
  invalid?: boolean;
}

export function PasswordInput({ value, onChange, autoComplete, placeholder, invalid }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      type={visible ? "text" : "password"}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      autoComplete={autoComplete}
      placeholder={placeholder}
      invalid={invalid}
      icon={<Lock className="h-4.5 w-4.5" />}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
        </button>
      }
    />
  );
}
