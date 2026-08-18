type Bucket = { count: number; resetAt: number };
type Limit = { max: number; windowMs: number };

const buckets = new Map<string, Bucket>();
const maximumBuckets = 5_000;
let nextCleanupAt = 0;

function cleanup(now: number) {
  if (now < nextCleanupAt && buckets.size < maximumBuckets) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  while (buckets.size >= maximumBuckets) {
    const oldest = buckets.keys().next().value as string | undefined;
    if (!oldest) break;
    buckets.delete(oldest);
  }
  nextCleanupAt = now + 60_000;
}

export function checkRateLimit(scope: string, key: string, limit: Limit) {
  const now = Date.now();
  cleanup(now);
  const bucketKey = `${scope}:${key}`;
  const current = buckets.get(bucketKey);
  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + limit.windowMs });
    return;
  }
  current.count += 1;
  if (current.count > limit.max) throw new Error("Too many attempts. Wait a few minutes and try again.");
}

export function clearRateLimit(scope: string, key: string) {
  buckets.delete(`${scope}:${key}`);
}

export function clientAddress(headers: Headers) {
  const trustProxy = process.env.TRUST_PROXY === "true" || Boolean(process.env.VERCEL);
  if (!trustProxy) return "local";
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
