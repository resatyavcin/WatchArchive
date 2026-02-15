const CACHE_PREFIX = "watcharchive_api_";

/** Cache süreleri (ms) */
export const CACHE_TTL = {
  /** Detay, sezon, watch providers - 24 saat */
  long: 24 * 60 * 60 * 1000,
  /** Arama - 10 dakika */
  search: 10 * 60 * 1000,
} as const;

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

function getCacheKey(url: string): string {
  return CACHE_PREFIX + url.replace(/^\/api/, "").replace(/^\//, "").replace(/\//g, ":");
}

function getFromStorage<T>(key: string): CacheEntry<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (entry.expiresAt < Date.now()) {
      localStorage.removeItem(key);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function setToStorage<T>(key: string, data: T, ttl: number): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry<T> = {
      data,
      expiresAt: Date.now() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // quota exceeded vb.
  }
}

/**
 * API çağrılarını cache'ler. Önce cache'e bakar, geçerliyse döner; yoksa fetch edip cache'e yazar.
 */
export async function cachedFetch<T = unknown>(
  url: string,
  ttl: number = CACHE_TTL.long
): Promise<{ data: T; ok: boolean; status: number; fromCache: boolean }> {
  const key = getCacheKey(url);

  const cached = getFromStorage<T>(key);
  if (cached) {
    return {
      data: cached.data,
      ok: true,
      status: 200,
      fromCache: true,
    };
  }

  const res = await fetch(url);
  const data = (await res.json()) as T;

  if (res.ok) {
    setToStorage(key, data, ttl);
  }

  return {
    data,
    ok: res.ok,
    status: res.status,
    fromCache: false,
  };
}
