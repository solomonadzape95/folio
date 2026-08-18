import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getLibrary } from "@/lib/library";
import { logoutAction } from "../auth/actions";
import { Mark } from "../components/Mark";
import { LibraryWorkspace } from "./LibraryWorkspace";

export default async function LibraryPage() {
  const user = await currentUser();
  if (!user) redirect("/auth");
  const books = await getLibrary(user.id);
  return (
    <main className="relative min-h-screen">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="relative mx-auto w-full max-w-[1500px] px-5 py-8 sm:px-10 sm:py-12 lg:px-16">
        <header className="mb-10 flex flex-col gap-6 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between">
          <Mark />
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[9px] tracking-[0.16em] text-faint md:block">{user.email}</span>
            <form action={logoutAction}><button className="border border-line px-5 py-3 font-mono text-[9px] uppercase tracking-[0.2em] text-faint hover:border-line-strong hover:text-text">Sign out</button></form>
          </div>
        </header>
        <div className="mb-9"><p className="font-mono text-[10px] uppercase tracking-[0.26em] text-sage">Library index</p><h1 className="mt-3 text-[clamp(2rem,5vw,4rem)] font-medium leading-none tracking-[-0.04em]">What are you reading?</h1></div>
        <LibraryWorkspace initialBooks={books} />
      </div>
    </main>
  );
}
