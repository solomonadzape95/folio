import assert from "node:assert/strict";
import test from "node:test";
import { supabaseConfig } from "./supabase/config";

test("supports legacy anon keys and prefers publishable keys", (t) => {
  const previous = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishable: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
  t.after(() => {
    if (previous.url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = previous.url;
    if (previous.publishable === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = previous.publishable;
    if (previous.anon === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = previous.anon;
  });
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "legacy";
  assert.deepEqual(supabaseConfig(), { url: "https://example.supabase.co", key: "legacy" });
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "modern";
  assert.equal(supabaseConfig().key, "modern");

});
