"use client";

import Link from "next/link";
import type { WatchedItem } from "@/types/watch";
import { Film, Tv, Heart, Star, Play, XCircle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface WatchedCardProps {
  item: WatchedItem;
  /** Compact card: poster + star only, no name/year (profile/my-list) */
  compact?: boolean;
  /** Köşe: "none" | "sm" | "lg" (varsayılan: lg) */
  rounded?: "none" | "sm" | "lg";
  /** Show border */
  border?: boolean;
}

function getStarCount(item: WatchedItem): number {
  if (item.rating == null || item.rating <= 0) return 0;
  return item.rating <= 5 ? item.rating : Math.round(item.rating / 2);
}

export function WatchedCard({ item, compact = false, rounded = "lg", border = false }: WatchedCardProps) {
  const filledStars = getStarCount(item);

  return (
    <Link
      href={`/add/${item.type}/${item.tmdbId}`}
      className={cn(
        "block w-full",
        compact ? "max-w-[70px] sm:max-w-[80px]" : "max-w-[140px]"
      )}
    >
      <div className={cn(
        "group relative aspect-[2/3] overflow-hidden bg-muted transition-transform hover:scale-[1.02]",
        rounded === "sm" && "rounded-sm",
        rounded === "lg" && "rounded-lg",
        border && "ring-1 ring-border ring-inset"
      )}>
        {item.posterPath ? (
          <Image
            src={item.posterPath}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 50vw, 140px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {item.type === "movie" ? (
              <Film className="w-12 h-12 text-muted-foreground/50" />
            ) : (
              <Tv className="w-12 h-12 text-muted-foreground/50" />
            )}
          </div>
        )}
        <div
          className={cn(
            "absolute top-1.5 right-1.5 z-10 flex items-center gap-1",
            compact && "top-1 right-1 gap-0.5"
          )}
        >
          {item.type === "tv" && item.watchingStatus === "watching" && (
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full bg-amber-600 text-white dark:bg-amber-500 dark:text-white shrink-0",
                compact ? "w-4 h-4" : "w-6 h-6"
              )}
              title="İzliyorum"
            >
              <Play className={cn("fill-current", compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5")} />
            </span>
          )}
          {item.watchingStatus === "dropped" && (
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full bg-amber-600/90 text-white dark:bg-amber-600/90 shrink-0",
                compact ? "w-4 h-4" : "w-6 h-6"
              )}
              title="Yarım bıraktım"
            >
              <XCircle className={cn("fill-current", compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5")} />
            </span>
          )}
          {item.isFavorite && (
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full bg-red-500 text-white dark:bg-red-400 dark:text-white shrink-0",
                compact ? "w-4 h-4" : "w-6 h-6"
              )}
              title="Favori"
            >
              <Heart className={cn("fill-current", compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5")} />
            </span>
          )}
        </div>
      </div>
      <div className={compact ? "mt-1" : "mt-1.5"}>
        {filledStars > 0 && (
          <div className={cn("flex justify-start gap-0.5", compact ? "mb-0" : "mb-0.5")}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={cn(
                  compact ? "h-2 w-2" : "h-2.5 w-2.5",
                  i <= filledStars
                    ? "fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400"
                    : "fill-transparent text-muted-foreground/60 dark:text-amber-400/50"
                )}
                aria-hidden
              />
            ))}
          </div>
        )}
        {!compact && (
          <>
            <p className="text-xs font-medium truncate">{item.title}</p>
            <div className="flex items-center justify-between gap-1 mt-0.5">
              <span className="text-[10px] text-muted-foreground">
                {item.releaseYear || ""}
              </span>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
