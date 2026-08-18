import assert from "node:assert/strict";
import test from "node:test";
import { normalizeVolume, normalizeVolumes } from "./books";

test("normalizes sparse Google Books data safely", () => {
  assert.deepEqual(
    normalizeVolume({ id: "abc", volumeInfo: { title: "  Dune  " } }),
    {
      googleId: "abc",
      title: "Dune",
      authors: [],
      description: "",
      publishedYear: null,
      coverUrl: null,
      pageCount: null,
      categories: [],
    },
  );
});

test("normalizes covers to https and extracts a year", () => {
  const book = normalizeVolume({
    id: "abc",
    volumeInfo: {
      title: "Dune",
      publishedDate: "1965-08-01",
      imageLinks: { thumbnail: "http://books.google.com/cover.jpg" },
    },
  });

  assert.equal(book?.publishedYear, "1965");
  assert.equal(book?.coverUrl, "https://books.google.com/cover.jpg");
});

test("drops malformed entries and duplicate ids", () => {
  const books = normalizeVolumes([
    { id: "one", volumeInfo: { title: "One" } },
    { id: "one", volumeInfo: { title: "One again" } },
    { volumeInfo: { title: "No id" } },
  ]);

  assert.equal(books.length, 1);
  assert.equal(books[0].title, "One again");
});
