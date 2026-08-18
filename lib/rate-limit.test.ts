import assert from "node:assert/strict";
import test from "node:test";
import { checkRateLimit, clientAddress } from "./rate-limit";

test("enforces independent scoped limits", () => {
  const key = crypto.randomUUID();
  checkRateLimit("test", key, { max: 2, windowMs: 60_000 });
  checkRateLimit("test", key, { max: 2, windowMs: 60_000 });
  assert.throws(() => checkRateLimit("test", key, { max: 2, windowMs: 60_000 }), /Too many attempts/);
  assert.doesNotThrow(() => checkRateLimit("other", key, { max: 2, windowMs: 60_000 }));
});

test("ignores forwarded addresses unless proxy trust is explicit", () => {
  const previous = process.env.TRUST_PROXY;
  delete process.env.TRUST_PROXY;
  assert.equal(clientAddress(new Headers({ "x-forwarded-for": "203.0.113.2" })), "local");
  process.env.TRUST_PROXY = "true";
  assert.equal(clientAddress(new Headers({ "x-forwarded-for": "203.0.113.2, 10.0.0.1" })), "203.0.113.2");
  if (previous === undefined) delete process.env.TRUST_PROXY;
  else process.env.TRUST_PROXY = previous;
});
