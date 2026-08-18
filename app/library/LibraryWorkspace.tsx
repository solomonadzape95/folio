"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";
import Image from "next/image";
import type { Book, LibraryBook, ReadingStatus } from "@/lib/types";
import { BookReader } from "./BookReader";

const statusLabels: Record<ReadingStatus, string> = {
  "want-to-read": "Want to read",
  reading: "Reading now",
  finished: "Finished",
};

type Filter = "all" | ReadingStatus;

export function LibraryWorkspace({ initialBooks }: { initialBooks: LibraryBook[] }) {
  const [books, setBooks] = useState(initialBooks);
  const [results, setResults] = useState<Book[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [readerBook, setReaderBook] = useState<Book | null>(null);
  const closeReader = useCallback(() => setReaderBook(null), []);

  const visible = useMemo(() => filter === "all" ? books : books.filter((book) => book.status === filter), [books, filter]);
  const savedIds = useMemo(() => new Set(books.map((book) => book.googleId)), [books]);

  async function search(event: FormEvent) {
    event.preventDefault();
    if (query.trim().length < 2) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Search failed.");
      setResults(data.books);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Search failed."); }
    finally { setLoading(false); }
  }

  async function save(book: Book) {
    setError("");
    try {
      const response = await fetch("/api/library", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ googleId: book.googleId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "That book could not be saved.");
      setBooks((current) => [data.book, ...current.filter((item) => item.googleId !== book.googleId)]);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "That book could not be saved."); }
  }

  async function changeStatus(id: string, status: ReadingStatus) {
    setError("");
    try {
      const response = await fetch("/api/library", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "That shelf change did not save.");
      setBooks((current) => current.map((book) => book.id === id ? data.book : book));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "That shelf change did not save."); }
  }

  async function remove(id: string) {
    setError("");
    try {
      const response = await fetch(`/api/library?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "That book could not be removed.");
      setBooks((current) => current.filter((book) => book.id !== id));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "That book could not be removed."); }
  }

  const counts = { all: books.length, "want-to-read": books.filter((b) => b.status === "want-to-read").length, reading: books.filter((b) => b.status === "reading").length, finished: books.filter((b) => b.status === "finished").length };

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
        {(Object.keys(counts) as Filter[]).map((key) => (
          <button key={key} onClick={() => setFilter(key)} className={`bg-surface px-5 py-5 text-left transition hover:bg-surface-2 sm:px-7 sm:py-7 ${filter === key ? "text-text" : "text-muted"}`}>
            <span className="font-mono text-3xl tracking-tighter">{String(counts[key]).padStart(2, "0")}</span>
            <span className="mt-2 block font-mono text-[9px] uppercase tracking-[0.22em] text-faint">{key === "all" ? "All books" : statusLabels[key]}</span>
          </button>
        ))}
      </section>

      <section className="border border-line bg-surface">
        <form onSubmit={search} className="flex flex-col gap-px bg-line sm:flex-row">
          <div className="flex flex-1 items-center bg-surface px-5 py-5">
            <span className="mr-4 font-mono text-faint">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, author, or ISBN…" className="w-full bg-transparent text-[15px] placeholder:text-faint focus:outline-none" />
          </div>
          <button disabled={loading || query.trim().length < 2} className="stripe-dense border-l border-line-strong px-8 py-5 font-mono text-[10px] uppercase tracking-[0.24em] hover:bg-line">{loading ? "Searching…" : "Search catalogue"}</button>
        </form>
        {error ? <p className="border-t border-line px-5 py-4 text-sm text-muted">{error}</p> : null}
        {results.length ? (
          <div className="border-t border-line p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between"><h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-faint">Catalogue results</h2><button onClick={() => setResults([])} className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint hover:text-text">Clear</button></div>
            <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
              {results.slice(0, 9).map((book) => <SearchResult key={book.googleId} book={book} saved={savedIds.has(book.googleId)} onSave={() => save(book)} onRead={() => setReaderBook(book)} />)}
            </div>
          </div>
        ) : null}
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between border-b border-line pb-4">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.24em] text-faint">Current shelf</p><h2 className="mt-2 text-2xl font-medium tracking-tight">{filter === "all" ? "The whole library" : statusLabels[filter]}</h2></div>
          <span className="font-mono text-[10px] tracking-[.18em] text-faint">{visible.length} {visible.length === 1 ? "volume" : "volumes"}</span>
        </div>
        {visible.length ? <div className="grid gap-px border border-line bg-line md:grid-cols-2 xl:grid-cols-3">{visible.map((book) => <LibraryCard key={book.id} book={book} onStatus={changeStatus} onRemove={remove} onRead={() => setReaderBook(book)} />)}</div> : <div className="stripe border border-line px-6 py-24 text-center"><p className="font-mono text-[11px] uppercase tracking-[0.24em] text-faint">This shelf is waiting for its first book</p></div>}
      </section>
      {readerBook ? <BookReader key={readerBook.googleId} book={readerBook} onClose={closeReader} /> : null}
    </div>
  );
}

function Cover({ book, small = false }: { book: Book; small?: boolean }) {
  return book.coverUrl ? <Image src={book.coverUrl} alt={`Cover of ${book.title}`} width={small ? 64 : 112} height={small ? 96 : 160} unoptimized className={`book-cover shrink-0 border border-line object-cover ${small ? "h-24 w-16" : "h-40 w-28"}`} /> : <div className={`stripe book-cover flex shrink-0 items-center justify-center border border-line font-mono text-2xl text-faint ${small ? "h-24 w-16" : "h-40 w-28"}`}>F</div>;
}

function SearchResult({ book, saved, onSave, onRead }: { book: Book; saved: boolean; onSave: () => void; onRead: () => void }) {
  return <article className="flex min-h-40 gap-5 bg-bg p-5"><Cover book={book} small /><div className="flex min-w-0 flex-1 flex-col"><h3 className="line-clamp-2 font-medium leading-snug">{book.title}</h3><p className="mt-2 line-clamp-1 text-xs text-muted">{book.authors.join(", ") || "Unknown author"}</p><div className="mt-auto flex flex-wrap gap-2"><button onClick={onRead} className="border border-sage px-3 py-2 font-mono text-[8px] uppercase tracking-[0.2em] text-sage hover:bg-sage hover:text-bg">Read preview</button><button disabled={saved} onClick={onSave} className="border border-line px-3 py-2 font-mono text-[8px] uppercase tracking-[0.2em] text-muted hover:border-line-strong hover:text-text">{saved ? "In library" : "+ Save book"}</button></div></div></article>;
}

function LibraryCard({ book, onStatus, onRemove, onRead }: { book: LibraryBook; onStatus: (id: string, status: ReadingStatus) => void; onRemove: (id: string) => void; onRead: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return <article className="bg-surface p-6 sm:p-7"><div className="flex min-h-52 gap-6"><Cover book={book} /><div className="flex min-w-0 flex-1 flex-col"><p className="font-mono text-[8px] uppercase tracking-[0.22em] text-sage">{statusLabels[book.status]}</p><h3 className="mt-3 line-clamp-3 text-lg font-medium leading-snug tracking-tight">{book.title}</h3><p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{book.authors.join(", ") || "Unknown author"}{book.publishedYear ? ` · ${book.publishedYear}` : ""}</p><div className="mt-4 flex flex-wrap gap-3"><button onClick={onRead} className="font-mono text-[8px] uppercase tracking-[0.18em] text-sage hover:text-text">Read preview →</button><button onClick={() => setExpanded((value) => !value)} className="font-mono text-[8px] uppercase tracking-[0.18em] text-faint hover:text-text">{expanded ? "Hide details" : "View details"}</button></div><div className="mt-auto flex items-end gap-2"><select aria-label={`Shelf for ${book.title}`} value={book.status} onChange={(event) => onStatus(book.id, event.target.value as ReadingStatus)} className="min-w-0 flex-1 border border-line bg-bg px-3 py-2.5 font-mono text-[8px] uppercase tracking-[0.14em] text-muted">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button aria-label={`Remove ${book.title}`} title="Remove book" onClick={() => onRemove(book.id)} className="border border-line px-3 py-2 text-faint hover:text-text">×</button></div></div></div>{expanded ? <div className="mt-6 border-t border-line pt-5"><div className="flex flex-wrap gap-2 font-mono text-[8px] uppercase tracking-[0.16em] text-faint">{book.pageCount ? <span>{book.pageCount} pages</span> : null}{book.categories.map((category) => <span key={category} className="border-l border-line pl-2">{category}</span>)}</div><p className="mt-4 line-clamp-6 text-[13px] leading-relaxed text-muted">{book.description || "No description is available for this edition."}</p></div> : null}</article>;
}
