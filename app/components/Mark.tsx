import Link from "next/link";

export function Mark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-4">
      <div className={`stripe-dense flex shrink-0 items-center justify-center border border-line-strong ${compact ? "h-11 w-11" : "h-14 w-14 sm:h-16 sm:w-16"}`}>
        <span className={`font-mono ${compact ? "text-base" : "text-xl sm:text-2xl"}`}>F</span>
      </div>
      <div>
        <span className={`${compact ? "text-xl" : "text-[clamp(1.5rem,3vw,2.25rem)]"} font-medium leading-none tracking-tight`}>Folio</span>
        <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.26em] text-faint">Personal library</span>
      </div>
    </Link>
  );
}
