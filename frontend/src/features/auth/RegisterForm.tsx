"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Mail, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { ApiError } from "@/lib/api";
import { AuthShell } from "./AuthShell";
import { useAuth } from "./AuthProvider";
import { PasswordInput } from "./PasswordInput";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError("");

    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 2) nextErrors.name = "Nama minimal 2 karakter";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = "Masukkan email yang valid";
    if (password.length < 8) nextErrors.password = "Password minimal 8 karakter";
    else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      nextErrors.password = "Password harus mengandung huruf dan angka";
    }
    if (confirm !== password) nextErrors.confirm = "Konfirmasi password tidak sama";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      router.replace("/dashboard");
    } catch (error) {
      if (error instanceof ApiError && error.errors) setErrors(error.errors);
      setFormError(error instanceof Error ? error.message : "Gagal mendaftar");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Buat akun Monee ✨"
      subtitle="Gratis. Mulai catat keuanganmu dalam semenit."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-lavender-ink hover:underline">
            Masuk
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
        <Field label="Nama" error={errors.name}>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            placeholder="Nama lengkap"
            invalid={!!errors.name}
            icon={<User className="h-4.5 w-4.5" />}
          />
        </Field>
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
        <Field label="Password" error={errors.password} hint="Minimal 8 karakter, kombinasi huruf dan angka">
          <PasswordInput
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            placeholder="Buat password"
            invalid={!!errors.password}
          />
        </Field>
        <Field label="Konfirmasi password" error={errors.confirm}>
          <PasswordInput
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            placeholder="Ulangi password"
            invalid={!!errors.confirm}
          />
        </Field>
        <Button type="submit" loading={loading} className="w-full">
          Daftar
        </Button>
      </form>
    </AuthShell>
  );
}
