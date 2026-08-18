import assert from "node:assert/strict";
import test from "node:test";
import { CatalogueError, cleanQuery, validVolumeId } from "./google-books";

test("accepts only bounded Google volume ids", () => {
  assert.equal(validVolumeId("zyTCAlFPjgYC"), true);
  assert.equal(validVolumeId("../../etc/passwd"), false);
  assert.equal(validVolumeId("x".repeat(65)), false);
});

test("trims searches and rejects oversized queries", () => {
  assert.equal(cleanQuery("  dune  "), "dune");
  assert.equal(cleanQuery("x"), null);
  assert.throws(() => cleanQuery("x".repeat(161)), CatalogueError);
});
