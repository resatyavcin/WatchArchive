"use client";

import { useState, useCallback } from "react";
import {
  Search,
  Loader2,
  Film,
  Tv,
  ArrowLeft,
  ChevronRight,
  Clapperboard,
  Heart,
  BookmarkCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { cachedFetch, CACHE_TTL } from "@/lib/api-cache";

import { useWatch } from "@/components/watch-provider";

interface SearchResult {
  id: number;
  title: string;
  posterPath: string | null;
  releaseYear: string;
  type: string;
}

export default function AddPage() {
  const { items, isInWatchlist } = useWatch();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"movie" | "tv">("movie");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const { data, ok } = await cachedFetch<{ results: SearchResult[] }>(
        `/api/search?q=${encodeURIComponent(query)}&type=${type}`,
        CACHE_TTL.search
      );
      if (!ok) {
        setResults([]);
        return;
      }
      setResults(data?.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, type]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/" aria-label="Geri">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold tracking-tight">
                Film veya Dizi Ekle
              </h1>
            </div>
            <LogoutButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        <div className="space-y-6 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant={type === "movie" ? "default" : "outline"}
                size="sm"
                onClick={() => setType("movie")}
                className={
                  type === "movie" ? "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400" : ""
                }
              >
                <Film className="h-4 w-4" />
                Film
              </Button>
              <Button
                variant={type === "tv" ? "default" : "outline"}
                size="sm"
                onClick={() => setType("tv")}
                className={
                  type === "tv" ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400" : ""
                }
              >
                <Tv className="h-4 w-4" />
                Dizi
              </Button>
            </div>
            <div className="relative flex-1 flex flex-col sm:flex-row gap-2 min-w-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && search()}
                  placeholder={
                    type === "movie"
                      ? "Film adı yaz..."
                      : "Dizi adı yaz..."
                  }
                  className="pl-9 h-10"
                />
              </div>
              <Button
                onClick={search}
                disabled={loading || !query.trim()}
                size="default"
                className="h-10 gap-1.5"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Ara
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        {loading && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">Aranıyor...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {results.map((r) => {
              const saved = items.find(
                (s) => s.tmdbId === r.id && s.type === r.type
              );
              const isFavorite = saved?.isFavorite ?? false;
              return (
              <Link
                key={`${r.type}-${r.id}`}
                href={`/add/${r.type}/${r.id}`}
                className="group rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-200"
              >
                <div className="aspect-[2/3] relative bg-muted overflow-hidden">
                  {(isFavorite || isInWatchlist(r.id, r.type)) && (
                    <div className="absolute top-2 left-2 z-10 flex gap-1">
                      {isFavorite && (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-500 text-white dark:bg-red-400 dark:text-white">
                          <Heart className="h-4 w-4 fill-current" />
                        </span>
                      )}
                      {isInWatchlist(r.id, r.type) && (
                        <span
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-500 text-white dark:bg-blue-400 dark:text-white"
                          title="İzleyeceğim listesinde"
                        >
                          <BookmarkCheck className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  )}
                  {r.posterPath ? (
                    <Image
                      src={r.posterPath}
                      alt={r.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 180px"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {type === "movie" ? (
                        <Film className="h-14 w-14 text-muted-foreground/40" />
                      ) : (
                        <Tv className="h-14 w-14 text-muted-foreground/40" />
                      )}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ChevronRight className="h-10 w-10 text-white drop-shadow-lg" />
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                    {r.title}
                  </p>
                  {r.releaseYear && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {r.releaseYear}
                    </p>
                  )}
                </div>
              </Link>
            );
            })}
          </div>
        ) : (
          <Empty className="border-0 py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                {hasSearched ? (
                  <Search className="h-6 w-6" />
                ) : (
                  <Clapperboard className="h-6 w-6" />
                )}
              </EmptyMedia>
              <EmptyTitle>
                {hasSearched ? "Sonuç bulunamadı" : "Ne izlemek istersin?"}
              </EmptyTitle>
              <EmptyDescription>
                {hasSearched
                  ? "Başka bir anahtar kelime veya farklı bir tür deneyebilirsin."
                  : "Yukarıdaki arama kutusuna film veya dizi adı yazıp ara."}
              </EmptyDescription>
            </EmptyHeader>
            {hasSearched && (
              <EmptyContent>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    setHasSearched(false);
                  }}
                >
                  Aramayı temizle
                </Button>
              </EmptyContent>
            )}
          </Empty>
        )}
      </main>
    </div>
  );
}
