const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api").replace(/\/$/, "");

export const UNAUTHORIZED_EVENT = "monee:unauthorized";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type QueryValue = string | number | boolean | null | undefined;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
}

function buildQuery(query?: Record<string, QueryValue>): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

/**
 * Client API. Login memakai cookie httpOnly, jadi semua request memakai credentials: "include".
 * Respon sukses backend berbentuk { success: true, data } atau { success: true, message }.
 */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query } = options;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}${buildQuery(query)}`, {
      method,
      credentials: "include",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Tidak bisa terhubung ke server. Pastikan backend sudah berjalan.", 0);
  }

  const json = await response.json().catch(() => null);

  if (!response.ok || !json || json.success === false) {
    // Sesi habis di halaman selain login/register -> beri tahu AuthProvider
    if (response.status === 401 && !path.startsWith("/auth/")) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(
      json?.message ?? "Terjadi kesalahan, coba lagi",
      response.status,
      json?.errors,
    );
  }

  return (json.data ?? json) as T;
}
