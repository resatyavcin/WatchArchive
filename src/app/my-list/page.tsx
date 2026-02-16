"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { WatchedCard } from "@/components/WatchedCard";
import { WatchlistCard } from "@/components/WatchlistCard";
import { Button } from "@/components/ui/button";
import { Film, Tv, ArrowLeft, Search, Heart } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { Input } from "@/components/ui/input";

import { useWatch } from "@/components/watch-provider";

function MyListContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const [listType, setListType] = useState<"movie" | "tv">(
    typeParam === "tv" ? "tv" : "movie",
  );
  const [filterType, setFilterType] = useState<
    "all" | "movie" | "tv" | "favorites" | "korean"
  >("all");
  const { items, watchlist } = useWatch();
  const [tab, setTab] = useState<"watched" | "watchlist">("watched");
  const [searchQuery, setSearchQuery] = useState("");
  const [watchlistType, setWatchlistType] = useState<"movie" | "tv">("movie");

  const filtered = items.filter((item) => {
    const matchSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType =
      listType === "movie" ? item.type === "movie" : item.type === "tv";
    const matchFilter =
      filterType === "all"
        ? matchType
        : filterType === "favorites"
          ? item.isFavorite && matchType
          : filterType === "korean"
            ? matchType &&
              (item.originCountry?.split(",").includes("KR") ?? false)
            : item.type === filterType;
    return matchSearch && matchFilter;
  });
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime(),
  );

  const watchlistFiltered = watchlist.filter((item) => {
    const matchType = item.type === watchlistType;
    const matchSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/" aria-label="Geri">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold flex-1">Tüm listem</h1>
            <LogoutButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex border-b border-border mb-4">
          <button
            type="button"
            onClick={() => setTab("watched")}
            className={`flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === "watched"
                ? "border-amber-500 text-amber-600 dark:text-amber-400 dark:border-amber-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            İzlediğim listem
          </button>
          <button
            type="button"
            onClick={() => setTab("watchlist")}
            className={`flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === "watchlist"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            İzleyeceğim
          </button>
        </div>

        {tab === "watched" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Listede ara..."
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={listType === "movie" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setListType("movie")}
                  className={`min-w-[5rem] ${
                    listType === "movie"
                      ? "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400"
                      : ""
                  }`}
                >
                  <Film className="h-4 w-4" />
                  Film
                </Button>
                <Button
                  variant={listType === "tv" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setListType("tv")}
                  className={`min-w-[5rem] ${listType === "tv" ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400" : ""}`}
                >
                  <Tv className="h-4 w-4" />
                  Dizi
                </Button>
                <Button
                  variant={filterType === "favorites" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setFilterType(
                      filterType === "favorites" ? "all" : "favorites",
                    )
                  }
                  className={`min-w-[5rem] ${
                    filterType === "favorites"
                      ? "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400"
                      : ""
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${filterType === "favorites" ? "fill-current" : ""}`}
                  />
                  Favoriler
                </Button>
                <Button
                  variant={filterType === "korean" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setFilterType(filterType === "korean" ? "all" : "korean")
                  }
                  className={` ${
                    filterType === "korean"
                      ? "bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-400"
                      : ""
                  }`}
                >
                  🇰🇷 한국
                </Button>
              </div>
            </div>

            {sorted.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8">
                {listType === "movie"
                  ? "Henüz film eklemedin."
                  : "Henüz dizi eklemedin."}
              </p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 justify-items-center">
                {sorted.map((item) => (
                  <div key={item.id} className="w-[70px] sm:w-[80px]">
                    <WatchedCard item={item} compact rounded="sm" border />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "watchlist" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Listede ara..."
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={watchlistType === "movie" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWatchlistType("movie")}
                  className={`min-w-[5rem] ${
                    watchlistType === "movie"
                      ? "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400"
                      : ""
                  }`}
                >
                  <Film className="h-4 w-4" />
                  Film
                </Button>
                <Button
                  variant={watchlistType === "tv" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWatchlistType("tv")}
                  className={`min-w-[5rem] ${watchlistType === "tv" ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400" : ""}`}
                >
                  <Tv className="h-4 w-4" />
                  Dizi
                </Button>
              </div>
            </div>

            {watchlistFiltered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8">
                {watchlistType === "movie"
                  ? "İzleyeceğim film listen boş."
                  : "İzleyeceğim dizi listen boş."}
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {watchlistFiltered.map((item) => (
                  <div key={item.id} className="shrink-0 w-[70px] sm:w-[80px]">
                    <WatchlistCard item={item} compact />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function MyListPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Yükleniyor...
        </div>
      }
    >
      <MyListContent />
    </Suspense>
  );
}
