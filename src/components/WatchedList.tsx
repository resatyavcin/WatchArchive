"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { WatchedCard } from "./WatchedCard";
import {
  Plus,
  Search,
  Film,
  Tv,
  Clapperboard,
  Flame,
  Bookmark,
  ChevronRight,
  BookmarkCheck,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { ScrollRow } from "@/components/ScrollRow";
import { Skeleton } from "@/components/ui/skeleton";
import { cachedFetch, CACHE_TTL } from "@/lib/api-cache";
import { useWatch } from "@/components/watch-provider";

interface PopularItem {
  id: number;
  title: string;
  posterPath: string | null;
  releaseYear: string;
  type: "movie" | "tv";
}

export function WatchedList() {
  const { items, watchlist, loading } = useWatch();
  const [listType, setListType] = useState<"movie" | "tv">("movie");
  const [popularType, setPopularType] = useState<"movie" | "tv">("movie");
  const [popular, setPopular] = useState<PopularItem[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);

  const fetchPopular = useCallback(async () => {
    setPopularLoading(true);
    try {
      const { data, ok } = await cachedFetch<{ results: PopularItem[] }>(
        `/api/popular?type=${popularType}`,
        CACHE_TTL.long,
      );
      if (ok && data?.results) {
        setPopular(data.results);
      } else {
        setPopular([]);
      }
    } catch {
      setPopular([]);
    } finally {
      setPopularLoading(false);
    }
  }, [popularType]);

  useEffect(() => {
    fetchPopular();
  }, [fetchPopular]);

  const sorted = [...items].sort(
    (a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime(),
  );

  const sortedMovies = sorted.filter((i) => i.type === "movie");
  const sortedTv = sorted.filter((i) => i.type === "tv");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <Link href="/" className="group flex items-center gap-2 sm:gap-2.5">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-amber-500/15 dark:bg-amber-400/15 ring-1 ring-amber-500/20 dark:ring-amber-400/20 transition-colors group-hover:bg-amber-500/25 dark:group-hover:bg-amber-400/25">
                <Clapperboard className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                  <span className="text-foreground">Watch</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    Archive
                  </span>
                </h1>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                  İzlediğin film ve dizileri takip et
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Button size="sm" asChild>
                <Link href="/add">
                  <Search className="h-4 w-4" />
                  Ara
                </Link>
              </Button>
              <LogoutButton />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            <h2 className="text-lg font-semibold">Tüm listem</h2>
          </div>
          {sorted.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-1"
              asChild
            >
              <Link
                href={
                  listType === "movie"
                    ? "/my-list?type=movie"
                    : "/my-list?type=tv"
                }
              >
                Tümünü gör
                {listType === "movie"
                  ? sortedMovies.length > 0
                    ? ` (${sortedMovies.length})`
                    : ""
                  : sortedTv.length > 0
                    ? ` (${sortedTv.length})`
                    : ""}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        {loading ? (
          <div className="min-h-[220px]">
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-16 rounded-md" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 sm:gap-6 justify-items-start">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-full max-w-[140px]">
                  <Skeleton className="aspect-[2/3] rounded-lg" />
                  <Skeleton className="h-3 w-full rounded mt-1.5" />
                  <Skeleton className="h-2.5 w-12 rounded mt-1" />
                </div>
              ))}
            </div>
          </div>
        ) : sorted.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Clapperboard className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>Henüz liste boş</EmptyTitle>
              <EmptyDescription>
                İzlediğin film veya dizileri ekleyerek arşivini oluşturmaya
                başla.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" asChild>
                <Link href="/add">
                  <Plus className="h-4 w-4" />
                  İlk içeriği ekle
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <Button
                variant={listType === "movie" ? "default" : "outline"}
                size="sm"
                onClick={() => setListType("movie")}
                className={
                  listType === "movie"
                    ? "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400"
                    : ""
                }
              >
                <Film className="h-4 w-4" />
                Film
              </Button>
              <Button
                variant={listType === "tv" ? "default" : "outline"}
                size="sm"
                onClick={() => setListType("tv")}
                className={
                  listType === "tv"
                    ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400"
                    : ""
                }
              >
                <Tv className="h-4 w-4" />
                Dizi
              </Button>
            </div>
            <div className="min-h-[220px]">
              {listType === "movie" ? (
                sortedMovies.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    Henüz film eklemedin.
                  </p>
                ) : (
                  <ScrollRow>
                    {sortedMovies.map((item) => (
                      <div
                        key={item.id}
                        className="flex-shrink-0 w-[100px] sm:w-[120px]"
                      >
                        <WatchedCard item={item} />
                      </div>
                    ))}
                  </ScrollRow>
                )
              ) : sortedTv.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  Henüz dizi eklemedin.
                </p>
              ) : (
                <ScrollRow>
                  {sortedTv.map((item) => (
                    <div
                      key={item.id}
                      className="flex-shrink-0 w-[100px] sm:w-[120px]"
                    >
                      <WatchedCard item={item} />
                    </div>
                  ))}
                </ScrollRow>
              )}
            </div>
          </>
        )}

        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-5 w-5 text-orange-500 dark:text-orange-400" />
            <h2 className="text-lg font-semibold">Popüler</h2>
          </div>
          <div className="flex gap-2 mb-4">
            <Button
              variant={popularType === "movie" ? "default" : "outline"}
              size="sm"
              onClick={() => setPopularType("movie")}
              className={
                popularType === "movie"
                  ? "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400"
                  : ""
              }
            >
              <Film className="h-4 w-4" />
              Film
            </Button>
            <Button
              variant={popularType === "tv" ? "default" : "outline"}
              size="sm"
              onClick={() => setPopularType("tv")}
              className={
                popularType === "tv"
                  ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400"
                  : ""
              }
            >
              <Tv className="h-4 w-4" />
              Dizi
            </Button>
          </div>
          {popularLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[100px] sm:w-[120px]">
                  <Skeleton className="aspect-[2/3] rounded-lg mb-1" />
                  <Skeleton className="h-3 w-full rounded mt-1" />
                  <Skeleton className="h-2.5 w-12 rounded mt-1" />
                </div>
              ))}
            </div>
          ) : popular.length > 0 ? (
            <ScrollRow>
              {popular.map((p) => {
                const inWatchlist = watchlist.some(
                  (w) => w.tmdbId === p.id && w.type === p.type,
                );
                return (
                  <Link
                    key={`${p.type}-${p.id}`}
                    href={`/add/${p.type}/${p.id}`}
                    className="flex-shrink-0 w-[100px] sm:w-[120px] group relative"
                  >
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted transition-transform group-hover:scale-[1.02] mb-1 relative">
                      {p.posterPath ? (
                        <Image
                          src={p.posterPath}
                          alt={p.title}
                          width={120}
                          height={180}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {p.type === "movie" ? (
                            <Film className="w-10 h-10 text-muted-foreground/50" />
                          ) : (
                            <Tv className="w-10 h-10 text-muted-foreground/50" />
                          )}
                        </div>
                      )}
                      {inWatchlist && (
                        <span
                          className="absolute top-1 right-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white dark:bg-blue-400"
                          title="İzleyeceğim listesinde"
                        >
                          <BookmarkCheck className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium truncate">{p.title}</p>
                    {p.releaseYear && (
                      <p className="text-[10px] text-muted-foreground">
                        {p.releaseYear}
                      </p>
                    )}
                  </Link>
                );
              })}
            </ScrollRow>
          ) : null}
        </section>
      </main>
    </div>
  );
}
