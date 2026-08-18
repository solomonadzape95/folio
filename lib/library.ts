import { createClient } from "./supabase/server";
import type { Database } from "./supabase/database.types";
import { READING_STATUSES, type Book, type LibraryBook, type ReadingStatus } from "./types";

type LibraryRow = Database["public"]["Tables"]["library_books"]["Row"];

function toLibraryBook(row: LibraryRow): LibraryBook {
  return {
    id: row.id,
    googleId: row.google_id,
    title: row.title,
    authors: row.authors,
    description: row.description,
    publishedYear: row.published_year,
    coverUrl: row.cover_url,
    pageCount: row.page_count,
    categories: row.categories,
    status: row.status,
    addedAt: row.added_at,
  };
}

export async function getLibrary(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("library_books").select("*").eq("user_id", userId).order("added_at", { ascending: false });
  if (error) throw new Error("The library could not be loaded.");
  return data.map(toLibraryBook);
}

export async function addBook(userId: string, book: Book, status: ReadingStatus = "want-to-read") {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("library_books")
    .upsert(
      {
        user_id: userId,
        google_id: book.googleId,
        title: book.title,
        authors: book.authors,
        description: book.description,
        published_year: book.publishedYear,
        cover_url: book.coverUrl,
        page_count: book.pageCount,
        categories: book.categories,
        status,
      },
      { onConflict: "user_id,google_id", ignoreDuplicates: true },
    )
    .select("*")
    .maybeSingle();
  if (error) throw new Error("That book could not be saved.");
  if (data) return toLibraryBook(data);

  const { data: existing, error: existingError } = await supabase
    .from("library_books")
    .select("*")
    .eq("user_id", userId)
    .eq("google_id", book.googleId)
    .single();
  if (existingError) throw new Error("That book could not be saved.");
  return toLibraryBook(existing);
}

export async function updateBookStatus(userId: string, id: string, status: ReadingStatus) {
  if (!READING_STATUSES.includes(status)) throw new Error("Invalid reading status.");
  const supabase = await createClient();
  const { data, error } = await supabase.from("library_books").update({ status }).eq("id", id).eq("user_id", userId).select("*").single();
  if (error) throw new Error("That shelf change could not be saved.");
  return toLibraryBook(data);
}

export async function removeBook(userId: string, id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("library_books").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error("That book could not be removed.");
}
