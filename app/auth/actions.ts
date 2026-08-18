"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authenticate, endSession, register, startSession } from "@/lib/auth";
import { checkRateLimit, clearRateLimit, clientAddress } from "@/lib/rate-limit";

export type AuthState = { error?: string };

export async function authAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const mode = formData.get("mode") === "signup" ? "signup" : "login";
  const requestHeaders = await headers();
  const address = clientAddress(requestHeaders);
  const identity = email.trim().toLowerCase().slice(0, 254);

  try {
    checkRateLimit("auth-ip", address, { max: 30, windowMs: 15 * 60_000 });
    checkRateLimit("auth-identity", identity, { max: 12, windowMs: 15 * 60_000 });
    const user = mode === "signup" ? await register(email, password) : await authenticate(email, password);
    if (!user) return { error: "The email or password is incorrect." };
    await startSession(user.id);
    clearRateLimit("auth-identity", identity);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Something went wrong." };
  }
  redirect("/library");
}

export async function logoutAction() {
  await endSession();
  redirect("/");
}
