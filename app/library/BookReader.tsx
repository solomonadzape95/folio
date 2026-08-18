"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import type { Book } from "@/lib/types";

type Viewer = {
  load: (identifier: string, onUnavailable?: () => void, onReady?: () => void) => void;
};

type GoogleBooks = {
  load?: (options?: { language?: string }) => void;
  setOnLoadCallback?: (callback: () => void) => void;
  DefaultViewer?: new (container: HTMLElement) => Viewer;
};

declare global {
  interface Window {
    google?: { books?: GoogleBooks };
  }
}

export function BookReader({ book, onClose }: { book: Book; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "unavailable" | "error">("loading");

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;
    if (!dialog) return;

    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus();

    function closeOnCancel(event: Event) {
      event.preventDefault();
      onClose();
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    dialog.addEventListener("cancel", closeOnCancel);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      dialog.removeEventListener("cancel", closeOnCancel);
      window.removeEventListener("keydown", closeOnEscape);
      if (dialog.open) dialog.close();
      previouslyFocused?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (state !== "loading") return;
    const timeout = window.setTimeout(() => setState("error"), 12_000);
    return () => window.clearTimeout(timeout);
  }, [state]);

  function initializeViewer() {
    const books = window.google?.books;
    const container = viewerRef.current;
    if (!books || !container) {
      setState("error");
      return;
    }

    function renderViewer() {
      if (!viewerRef.current) return;
      const ViewerConstructor = window.google?.books?.DefaultViewer;
      if (!ViewerConstructor) {
        setState("error");
        return;
      }
      viewerRef.current.replaceChildren();
      const viewer = new ViewerConstructor(viewerRef.current);
      viewer.load(
        book.googleId,
        () => setState("unavailable"),
        () => setState("ready"),
      );
    }

    if (books.DefaultViewer) {
      renderViewer();
      return;
    }
    if (!books.load || !books.setOnLoadCallback) {
      setState("error");
      return;
    }

    books.load({ language: "en" });
    books.setOnLoadCallback(renderViewer);
  }

  const googleBooksUrl = `https://books.google.com/books?id=${encodeURIComponent(book.googleId)}`;

  return (
    <dialog ref={dialogRef} className="fixed inset-0 z-50 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-bg p-0 text-text" aria-labelledby="reader-title">
      <div className="flex h-full flex-col">
      <Script
        src="https://www.google.com/books/jsapi.js"
        strategy="afterInteractive"
        onReady={initializeViewer}
        onError={() => setState("error")}
      />

      <header className="flex min-h-16 items-center justify-between gap-5 border-b border-line bg-surface px-4 sm:px-7">
        <div className="min-w-0">
          <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-sage">Google Books preview</p>
          <h2 id="reader-title" className="mt-1 truncate text-sm font-medium sm:text-base">{book.title}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a href={googleBooksUrl} target="_blank" rel="noreferrer" className="hidden border border-line px-4 py-2.5 font-mono text-[8px] uppercase tracking-[0.18em] text-muted hover:border-line-strong hover:text-text sm:block">Open on Google Books ↗</a>
          <button ref={closeRef} onClick={onClose} aria-label="Close reader" className="border border-line px-4 py-2 text-lg leading-none text-muted hover:border-line-strong hover:text-text">×</button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 bg-[#f2f0eb]">
        <div ref={viewerRef} className={`h-full w-full transition-opacity ${state === "ready" ? "opacity-100" : "opacity-0"}`} aria-label={`Preview of ${book.title}`} />

        {state === "loading" ? (
          <div className="absolute inset-0 grid place-items-center bg-surface">
            <div className="text-center"><span className="mx-auto block h-8 w-8 animate-spin border border-line-strong border-t-sage" /><p className="mt-5 font-mono text-[9px] uppercase tracking-[0.24em] text-faint">Opening preview</p></div>
          </div>
        ) : null}

        {state === "unavailable" || state === "error" ? (
          <div className="absolute inset-0 grid place-items-center bg-surface p-6">
            <div className="max-w-md border border-line bg-bg p-7 text-center sm:p-10">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-sage">{state === "unavailable" ? "Preview unavailable here" : "Preview could not load"}</p>
              <p className="mt-4 text-sm leading-6 text-muted">{state === "unavailable" ? "Google does not allow this edition to be embedded in your region. Its Google Books page may still have a sample, purchase, or borrowing option." : "The embedded reader did not respond. You can still check this edition directly on Google Books."}</p>
              <a href={googleBooksUrl} target="_blank" rel="noreferrer" className="mt-7 inline-block border border-line-strong px-5 py-3 font-mono text-[9px] uppercase tracking-[0.2em] text-text hover:bg-surface-2">Check Google Books ↗</a>
            </div>
          </div>
        ) : null}
      </div>

      <footer className="flex items-center justify-between border-t border-line bg-surface px-4 py-3 font-mono text-[8px] uppercase tracking-[0.16em] text-faint sm:px-7">
        <span>Availability varies by edition and region</span>
        <span className="hidden sm:block">Esc to close</span>
      </footer>
      </div>
    </dialog>
  );
}
