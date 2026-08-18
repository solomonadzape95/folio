import type { Book } from "./types";

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.length > 0) : [];
}

export function normalizeVolume(volume: unknown): Book | null {
  if (!record(volume) || typeof volume.id !== "string" || !record(volume.volumeInfo)) return null;

  const info = volume.volumeInfo;
  if (typeof info.title !== "string" || !info.title.trim()) return null;
  const images = record(info.imageLinks) ? info.imageLinks : {};
  const rawCover = typeof images.thumbnail === "string" ? images.thumbnail : typeof images.smallThumbnail === "string" ? images.smallThumbnail : undefined;
  const publishedDate = typeof info.publishedDate === "string" ? info.publishedDate : undefined;

  return {
    googleId: volume.id,
    title: info.title.trim(),
    authors: stringArray(info.authors),
    description: typeof info.description === "string" ? info.description.trim() : "",
    publishedYear: publishedDate?.match(/^\d{4}/)?.[0] ?? null,
    coverUrl: rawCover?.replace(/^http:/, "https:") ?? null,
    pageCount:
      typeof info.pageCount === "number" && info.pageCount > 0
        ? info.pageCount
        : null,
    categories: stringArray(info.categories),
  };
}

export function normalizeVolumes(items: unknown): Book[] {
  const books = (Array.isArray(items) ? items : [])
    .map(normalizeVolume)
    .filter((book): book is Book => book !== null);

  return [...new Map(books.map((book) => [book.googleId, book])).values()];
}
