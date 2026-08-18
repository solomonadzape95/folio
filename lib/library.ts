import { randomUUID } from "node:crypto";
import { readStore, updateStore } from "./store";
import { READING_STATUSES, type Book, type ReadingStatus } from "./types";

export async function getLibrary(userId: string) {
  const store = await readStore();
  return store.library
    .filter((book) => book.userId === userId)
    .sort((a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt));
}

export async function addBook(userId: string, book: Book, status: ReadingStatus = "want-to-read") {
  return updateStore((store) => {
    const existing = store.library.find(
      (item) => item.userId === userId && item.googleId === book.googleId,
    );
    if (existing) return existing;
    const item = { ...book, id: randomUUID(), userId, status, addedAt: new Date().toISOString() };
    store.library.push(item);
    return item;
  });
}

export async function updateBookStatus(userId: string, id: string, status: ReadingStatus) {
  if (!READING_STATUSES.includes(status)) throw new Error("Invalid reading status.");
  return updateStore((store) => {
    const item = store.library.find((book) => book.id === id && book.userId === userId);
    if (!item) throw new Error("Book not found.");
    item.status = status;
    return item;
  });
}

export async function removeBook(userId: string, id: string) {
  return updateStore((store) => {
    const index = store.library.findIndex((book) => book.id === id && book.userId === userId);
    if (index === -1) throw new Error("Book not found.");
    store.library.splice(index, 1);
  });
}
