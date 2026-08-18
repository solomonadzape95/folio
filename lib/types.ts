export const READING_STATUSES = ["want-to-read", "reading", "finished"] as const;

export type ReadingStatus = (typeof READING_STATUSES)[number];

export type Book = {
  googleId: string;
  title: string;
  authors: string[];
  description: string;
  publishedYear: string | null;
  coverUrl: string | null;
  pageCount: number | null;
  categories: string[];
};

export type LibraryBook = Book & {
  id: string;
  status: ReadingStatus;
  addedAt: string;
};
