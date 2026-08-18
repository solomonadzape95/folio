"use client";

import Link from "next/link";
import { useActionState } from "react";
import { authAction, type AuthState } from "./actions";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(authAction, {});
  const signup = mode === "signup";
  return (
    <form action={action} className="mt-10 space-y-5">
      <input type="hidden" name="mode" value={mode} />
      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-faint">Email address</span>
        <input name="email" type="email" autoComplete="email" required className="mt-2 w-full border border-line bg-bg px-4 py-4 text-[15px] text-text placeholder:text-faint" placeholder="reader@example.com" />
      </label>
      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-faint">Password</span>
        <input name="password" type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={8} required className="mt-2 w-full border border-line bg-bg px-4 py-4 text-[15px] text-text placeholder:text-faint" placeholder="At least 8 characters" />
      </label>
      {state.error ? <p role="alert" className="border-l border-sage pl-4 text-sm leading-relaxed text-muted">{state.error}</p> : null}
      <button disabled={pending} className="stripe-dense w-full border border-line-strong px-6 py-4 font-mono text-[11px] uppercase tracking-[0.24em] transition hover:bg-line">
        {pending ? "Working…" : signup ? "Create account" : "Enter library"}
      </button>
      <p className="text-center text-sm text-faint">
        {signup ? "Already have a library?" : "New to Folio?"}{" "}
        <Link className="text-muted underline decoration-line-strong underline-offset-4 hover:text-text" href={signup ? "/auth" : "/auth?mode=signup"}>{signup ? "Sign in" : "Create one"}</Link>
      </p>
    </form>
  );
}
