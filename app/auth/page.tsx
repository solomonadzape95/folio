import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { Mark } from "../components/Mark";
import { AuthForm } from "./AuthForm";

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  if (await currentUser()) redirect("/library");
  const { mode } = await searchParams;
  const authMode = mode === "signup" ? "signup" : "login";
  return (
    <main className="relative flex min-h-screen items-center justify-center px-5 py-12">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <section className="relative w-full max-w-lg border border-line bg-surface p-6 sm:p-10">
        <Mark compact />
        <div className="stripe mt-9 h-12 border-y border-line" />
        <h1 className="mt-9 text-3xl font-medium tracking-tight">{authMode === "signup" ? "Begin your catalogue." : "Welcome back."}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{authMode === "signup" ? "Create a private home for the books behind you and ahead of you." : "Pick up where your reading left off."}</p>
        <AuthForm mode={authMode} />
      </section>
    </main>
  );
}
