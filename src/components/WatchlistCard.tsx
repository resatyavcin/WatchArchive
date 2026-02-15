"use client";

import Link from "next/link";
import type { WatchlistItem } from "@/types/watch";
import { Film, Tv } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface WatchlistCardProps {
  item: WatchlistItem;
  onRemove?: (item: WatchlistItem) => void;
  compact?: boolean;
}

export function WatchlistCard({
  item,
  onRemove,
  compact = false,
}: WatchlistCardProps) {
  return (
    <div
      className={cn(
        "group relative w-full",
        compact ? "max-w-[70px] sm:max-w-[80px]" : "w-[100px] sm:w-[120px]"
      )}
    >
      <Link
        href={`/add/${item.type}/${item.tmdbId}`}
        className="block flex-shrink-0 group/card"
      >
        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted transition-transform group-hover/card:scale-[1.02] mb-1">
          {item.posterPath ? (
            <Image
              src={item.posterPath}
              alt={item.title}
              width={compact ? 80 : 120}
              height={compact ? 120 : 180}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {item.type === "movie" ? (
                <Film className={cn(compact ? "w-8 h-8" : "w-10 h-10", "text-muted-foreground/50")} />
              ) : (
                <Tv className={cn(compact ? "w-8 h-8" : "w-10 h-10", "text-muted-foreground/50")} />
              )}
            </div>
          )}
        </div>
        {!compact && (
          <>
            <p className="text-xs font-medium truncate">{item.title}</p>
            {item.releaseYear && (
              <p className="text-[10px] text-muted-foreground">{item.releaseYear}</p>
            )}
          </>
        )}
      </Link>
      {onRemove && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/90"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(item);
          }}
          aria-label="Watchlistten çıkar"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
