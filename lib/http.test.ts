import assert from "node:assert/strict";
import test from "node:test";
import { readBoundedJson, RequestBodyError } from "./http";

test("reads JSON within the byte limit", async () => {
  const request = new Request("http://folio.test", { method: "POST", body: JSON.stringify({ id: "one" }) });
  assert.deepEqual(await readBoundedJson(request, 64), { id: "one" });
});

test("rejects streamed request bodies beyond the byte limit", async () => {
  const request = new Request("http://folio.test", { method: "POST", body: JSON.stringify({ value: "x".repeat(100) }) });
  await assert.rejects(readBoundedJson(request, 32), RequestBodyError);
});
