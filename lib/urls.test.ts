import assert from "node:assert/strict";
import test from "node:test";
import { configuredSiteOrigin, safeInternalPath } from "./urls";

test("requires a canonical http or https site origin", () => {
  assert.equal(configuredSiteOrigin("https://folio.example/path"), "https://folio.example");
  assert.throws(() => configuredSiteOrigin(undefined), /not configured/);
  assert.throws(() => configuredSiteOrigin("javascript:alert(1)"), /http or https/);
});

test("allows same-origin paths and rejects redirect bypasses", () => {
  const origin = "https://folio.example";
  assert.equal(safeInternalPath("/library?view=reading", origin), "/library?view=reading");
  assert.equal(safeInternalPath("//evil.example", origin), "/library");
  assert.equal(safeInternalPath("/\\evil.example", origin), "/library");
  assert.equal(safeInternalPath("https://evil.example", origin), "/library");
});
