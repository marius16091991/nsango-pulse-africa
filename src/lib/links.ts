const APP_HOSTS = new Set([
  "nsangomagazine.com",
  "www.nsangomagazine.com",
  "nsango-mag.lovable.app",
]);

export const toAppPath = (href?: string | null, fallback = "/") => {
  const raw = (href || "").trim();
  if (!raw) return fallback;
  if (raw.startsWith("/") || raw.startsWith("#")) return raw;

  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin === window.location.origin || APP_HOSTS.has(url.hostname)) {
      return `${url.pathname || "/"}${url.search}${url.hash}`;
    }
  } catch {
    return fallback;
  }

  return raw;
};