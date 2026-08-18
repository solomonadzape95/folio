"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, clearRateLimit, clientAddress } from "@/lib/rate-limit";
import { configuredSiteOrigin } from "@/lib/urls";

export type AuthState = { error?: string; message?: string };

export async function authAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const normalizedEmail = email.trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const mode = formData.get("mode") === "signup" ? "signup" : "login";
  const requestHeaders = await headers();
  const address = clientAddress(requestHeaders);
  const identity = normalizedEmail.slice(0, 254);

  try {
    checkRateLimit("auth-ip", address, { max: 30, windowMs: 15 * 60_000 });
    checkRateLimit("auth-identity", identity, { max: 12, windowMs: 15 * 60_000 });
    if (normalizedEmail.length > 254 || !/^\S+@\S+\.\S+$/.test(normalizedEmail) || password.length < 8 || password.length > 128) {
      return { error: "Enter a valid email and a password between 8 and 128 characters." };
    }
    const supabase = await createClient();
    if (mode === "signup") {
      const origin = configuredSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL);
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { emailRedirectTo: `${origin}/auth/callback` },
      });
      if (error) return { error: error.message };
      clearRateLimit("auth-identity", identity);
      if (!data.session) return { message: "Check your email to confirm your account, then sign in." };
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (error) return { error: "The email or password is incorrect." };
      clearRateLimit("auth-identity", identity);
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Something went wrong." };
  }
  redirect("/library");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
