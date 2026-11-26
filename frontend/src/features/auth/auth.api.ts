import { api } from "@/lib/api";
import type { User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export const authApi = {
  me: () => api<{ user: User }>("/auth/me").then((data) => data.user),
  login: (payload: LoginPayload) =>
    api<{ user: User }>("/auth/login", { method: "POST", body: payload }).then((data) => data.user),
  register: (payload: RegisterPayload) =>
    api<{ user: User }>("/auth/register", { method: "POST", body: payload }).then((data) => data.user),
  logout: () => api<unknown>("/auth/logout", { method: "POST" }),
};
