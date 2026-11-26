"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api";
import { AuthShell } from "./AuthShell";
import { useAuth } from "./AuthProvider";
import { PasswordInput } from "./PasswordInput";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError("");

    const nextErrors: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = "Masukkan email yang valid";
    if (!password) nextErrors.password = "Password wajib diisi";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      router.replace("/dashboard");
    } catch (error) {
      if (error instanceof ApiError && error.errors) setErrors(error.errors);
      setFormError(error instanceof Error ? error.message : "Gagal masuk");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Selamat datang 👋"
      subtitle="Masuk untuk melanjutkan mengatur keuanganmu."
      footer={
        <>
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-lavender-ink hover:underline">
            Daftar sekarang
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <p role="alert" className="rounded-xl bg-red-soft px-4 py-3 text-sm font-medium text-red-ink">
            {formError}
          </p>
        )}
        <Field label="Email" error={errors.email}>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="nama@email.com"
            invalid={!!errors.email}
            icon={<Mail className="h-4.5 w-4.5" />}
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <PasswordInput
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            placeholder="Password kamu"
            invalid={!!errors.password}
          />
        </Field>
        <Button type="submit" loading={loading} className="w-full">
          Masuk
        </Button>
      </form>
    </AuthShell>
  );
}
