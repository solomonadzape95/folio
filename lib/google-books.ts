import { normalizeVolume, normalizeVolumes } from "./books";

const booksEndpoint = "https://www.googleapis.com/books/v1";
const queryLimit = 160;

export class CatalogueError extends Error {
  constructor(message: string, readonly status = 502) {
    super(message);
  }
}

function apiKey() {
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  if (!key) throw new CatalogueError("Add GOOGLE_BOOKS_API_KEY to .env.local to search the catalogue.", 503);
  return key;
}

async function googleRequest(url: URL) {
  const response = await fetch(url, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new CatalogueError("Google Books could not complete that request.");
  return response.json() as Promise<unknown>;
}

export function validVolumeId(value: unknown): value is string {
  return typeof value === "string" && value.length <= 64 && /^[A-Za-z0-9_-]+$/.test(value);
}

export function cleanQuery(value: string | null) {
  const query = value?.trim() ?? "";
  if (query.length < 2) return null;
  if (query.length > queryLimit) throw new CatalogueError(`Searches are limited to ${queryLimit} characters.`, 400);
  return query;
}

export async function searchCatalogue(query: string) {
  const url = new URL(`${booksEndpoint}/volumes`);
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", "18");
  url.searchParams.set("printType", "books");
  url.searchParams.set("projection", "lite");
  url.searchParams.set("key", apiKey());
  const data = await googleRequest(url);
  return normalizeVolumes(typeof data === "object" && data !== null && "items" in data ? data.items : undefined);
}

export async function getCatalogueBook(id: string) {
  if (!validVolumeId(id)) throw new CatalogueError("Invalid Google Books volume id.", 400);
  const url = new URL(`${booksEndpoint}/volumes/${encodeURIComponent(id)}`);
  url.searchParams.set("projection", "full");
  url.searchParams.set("key", apiKey());
  const book = normalizeVolume(await googleRequest(url));
  if (!book) throw new CatalogueError("Google Books returned an invalid volume.");
  return book;
}
