import type { WatchedItem, WatchlistItem } from "@/types/watch";

const API = "/api";
const FETCH_TIMEOUT_MS = 10_000;

async function fetchWithTimeout(url: string, options?: RequestInit, timeout = FETCH_TIMEOUT_MS): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetchWithTimeout(
    url,
    {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
      credentials: "include",
    },
    FETCH_TIMEOUT_MS
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || "Request failed");
  }
  return res.json();
}

export async function getWatched(): Promise<WatchedItem[]> {
  const { items } = await fetchJson<{ items: WatchedItem[] }>(`${API}/watched`);
  return items;
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const { items } = await fetchJson<{ items: WatchlistItem[] }>(`${API}/watchlist`);
  return items;
}

export async function upsertWatched(item: Partial<WatchedItem> & { tmdbId: number; title: string; type: "movie" | "tv" }): Promise<WatchedItem> {
  return fetchJson<WatchedItem>(`${API}/watched`, {
    method: "POST",
    body: JSON.stringify(item),
  });
}

export async function removeWatched(id: string): Promise<void> {
  await fetch(`${API}/watched/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function addWatchlist(item: Omit<WatchlistItem, "id" | "addedAt">): Promise<WatchlistItem> {
  return fetchJson<WatchlistItem>(`${API}/watchlist`, {
    method: "POST",
    body: JSON.stringify(item),
  });
}

export async function removeWatchlist(idOrParams: string | { tmdbId: number; type: string }): Promise<void> {
  const url =
    typeof idOrParams === "string"
      ? `${API}/watchlist?id=${encodeURIComponent(idOrParams)}`
      : `${API}/watchlist?tmdbId=${idOrParams.tmdbId}&type=${idOrParams.type}`;
  await fetch(url, { method: "DELETE" });
}
