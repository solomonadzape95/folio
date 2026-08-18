export function configuredSiteOrigin(value: string | undefined) {
  if (!value) throw new Error("NEXT_PUBLIC_SITE_URL is not configured.");
  const url = new URL(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("NEXT_PUBLIC_SITE_URL must use http or https.");
  return url.origin;
}

export function safeInternalPath(value: string | null, origin: string, fallback = "/library") {
  if (!value) return fallback;
  const resolved = new URL(value, origin);
  if (resolved.origin !== origin) return fallback;
  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}
