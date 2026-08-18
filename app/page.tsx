import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { Mark } from "./components/Mark";

const shelves = [
  { n: "01", title: "Want to read", body: "A considered queue, not an endless pile. Keep the books that genuinely call you back." },
  { n: "02", title: "Reading now", body: "A small, visible stack of what currently has your attention." },
  { n: "03", title: "Finished", body: "A durable record of where your curiosity has already taken you." },
];

export default async function Home() {
  const user = await currentUser();
  return (
    <main className="relative min-h-screen">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="relative mx-auto w-full max-w-[1400px] px-5 py-10 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
        <header className="flex items-center justify-between gap-6 border-b border-line pb-8">
          <Mark />
          <Link href={user ? "/library" : "/auth"} className="hidden border border-line px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted transition hover:border-line-strong hover:text-text sm:block">
            {user ? "Open library" : "Sign in"}
          </Link>
        </header>

        <section className="border-b border-line py-16 sm:py-24">
          <p className="mb-7 font-mono text-[11px] uppercase tracking-[0.28em] text-sage">Your reading life, indexed</p>
          <h1 className="max-w-5xl text-[clamp(2.5rem,7vw,5.5rem)] font-medium leading-[.98] tracking-[-0.045em]">
            A quiet place for every book that stays with you.
          </h1>
          <p className="mt-8 max-w-2xl text-[clamp(1rem,1.8vw,1.25rem)] leading-relaxed text-muted">
            Search the world&apos;s books, build a library of your own, and keep the distance between wanting to read and having read beautifully clear.
          </p>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link href={user ? "/library" : "/auth?mode=signup"} className="stripe-dense border border-line-strong px-9 py-5 text-center font-mono text-[12px] uppercase tracking-[0.24em] transition-colors hover:bg-line">
              {user ? "Return to library" : "Start your library"}
            </Link>
            <a href="#shelves" className="border border-line px-9 py-5 text-center font-mono text-[12px] uppercase tracking-[0.24em] text-muted transition hover:border-line-strong hover:text-text">How it works</a>
          </div>
        </section>

        <section id="shelves" className="grid grid-cols-1 gap-px border-b border-line bg-line lg:grid-cols-3">
          {shelves.map((shelf) => (
            <article key={shelf.n} className="bg-bg px-6 py-12 sm:px-8 sm:py-16">
              <p className="font-mono text-4xl tracking-tighter text-faint">{shelf.n}</p>
              <h2 className="mt-8 text-2xl font-medium tracking-tight">{shelf.title}</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">{shelf.body}</p>
            </article>
          ))}
        </section>

        <footer className="flex flex-col gap-3 pt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-faint sm:flex-row sm:justify-between">
          <span>Powered by Google Books</span><span>Built for deliberate readers</span>
        </footer>
      </div>
    </main>
  );
}
