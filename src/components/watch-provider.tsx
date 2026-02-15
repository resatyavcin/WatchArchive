"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import type { WatchedItem, WatchlistItem } from "@/types/watch";
import {
  getWatched,
  getWatchlist,
  upsertWatched,
  removeWatched,
  addWatchlist,
  removeWatchlist,
} from "@/lib/watch-api";

type WatchContextValue = {
  items: WatchedItem[];
  watchlist: WatchlistItem[];
  loading: boolean;
  refetch: () => Promise<void>;
  upsertWatched: (item: Partial<WatchedItem> & { tmdbId: number; title: string; type: "movie" | "tv" }) => Promise<WatchedItem>;
  removeWatchedItem: (id: string) => Promise<void>;
  addToWatchlist: (item: Omit<WatchlistItem, "id" | "addedAt">) => Promise<void>;
  removeFromWatchlist: (idOrParams: string | { tmdbId: number; type: string }) => Promise<void>;
  isInWatchlist: (tmdbId: number, type: string) => boolean;
};

const WatchContext = createContext<WatchContextValue | null>(null);

export function WatchProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WatchedItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const [w, wl] = await Promise.all([getWatched(), getWatchlist()]);
      setItems(w);
      setWatchlist(wl);
    } catch {
      setItems([]);
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const pathname = usePathname();
  useEffect(() => {
    // Skip fetch on login page or when pathname is not yet available
    if (pathname == null || pathname.startsWith("/login")) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        await refetch();
      } catch {
        if (!cancelled) {
          setItems([]);
          setWatchlist([]);
          setLoading(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    // Fallback: API does not respond within 8s
    const fallback = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 8_000);
    return () => {
      cancelled = true;
      clearTimeout(fallback);
    };
  }, [refetch, pathname]);

  const upsertWatchedItem = useCallback(
    async (item: Partial<WatchedItem> & { tmdbId: number; title: string; type: "movie" | "tv" }) => {
      const saved = await upsertWatched(item);
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.id === saved.id || (i.tmdbId === saved.tmdbId && i.type === saved.type));
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      return saved;
    },
    []
  );

  const removeWatchedItem = useCallback(async (id: string) => {
    await removeWatched(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const addToWatchlist = useCallback(async (item: Omit<WatchlistItem, "id" | "addedAt">) => {
    const saved = await addWatchlist(item);
    setWatchlist((prev) => {
      if (prev.some((w) => w.tmdbId === saved.tmdbId && w.type === saved.type)) return prev;
      return [saved, ...prev];
    });
  }, []);

  const removeFromWatchlist = useCallback(
    async (idOrParams: string | { tmdbId: number; type: string }) => {
      await removeWatchlist(idOrParams);
      setWatchlist((prev) =>
        typeof idOrParams === "string"
          ? prev.filter((w) => w.id !== idOrParams)
          : prev.filter(
              (w) => !(w.tmdbId === idOrParams.tmdbId && w.type === idOrParams.type)
            )
      );
    },
    []
  );

  const isInWatchlist = useCallback(
    (tmdbId: number, type: string) =>
      watchlist.some((w) => w.tmdbId === tmdbId && w.type === type),
    [watchlist]
  );

  const value: WatchContextValue = {
    items,
    watchlist,
    loading,
    refetch,
    upsertWatched: upsertWatchedItem,
    removeWatchedItem,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  };

  return (
    <WatchContext.Provider value={value}>{children}</WatchContext.Provider>
  );
}

export function useWatch() {
  const ctx = useContext(WatchContext);
  if (!ctx) {
    throw new Error("useWatch must be used within WatchProvider");
  }
  return ctx;
}
