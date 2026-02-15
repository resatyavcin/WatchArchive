"use client";

import { useState } from "react";
import { Film, Tv, Star, ExternalLink, Heart, Trash2, MoreVertical, XCircle, CircleCheck, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatRuntime } from "@/lib/utils";
import type { TMDBDetail } from "../types";
import type { WatchedItem } from "@/types/watch";

interface ContentDetailMetaProps {
  detail: TMDBDetail;
  existingItem: WatchedItem | null;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onRemove: () => void;
  onMarkAsDropped: () => void;
  onRemoveDroppedStatus: () => void;
  onOpenSheetForDropped: () => void;
}

export function ContentDetailMeta({
  detail,
  existingItem,
  isFavorite,
  onFavoriteToggle,
  onRemove,
  onMarkAsDropped,
  onRemoveDroppedStatus,
  onOpenSheetForDropped,
}: ContentDetailMetaProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const typeBadge = (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
        detail.type === "movie"
          ? "bg-amber-500/25 text-amber-800 dark:bg-amber-500/30 dark:text-amber-200"
          : "bg-green-500/25 text-green-800 dark:bg-green-500/30 dark:text-green-200"
      }`}
    >
      {detail.type === "movie" ? (
        <Film className="h-3 w-3" />
      ) : (
        <Tv className="h-3 w-3" />
      )}
      {detail.type === "movie" ? "Film" : "Dizi"}
    </span>
  );

  return (
    <>
      <div className="hidden sm:block mb-2">
        {typeBadge}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-4">
        <h1 className="text-base sm:text-3xl md:text-4xl font-extrabold tracking-tight min-w-0 flex-1 break-words">
          {detail.title}
        </h1>
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <Button
            type="button"
            variant={isFavorite ? "default" : "outline"}
            size="icon"
            onClick={onFavoriteToggle}
            className={isFavorite ? "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400" : ""}
            aria-label={isFavorite ? "Favoriden çıkar" : "Favorilere ekle"}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          </Button>
          {existingItem && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
              aria-label="Listeden kaldır"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Daha fazla seçenek">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-1">
              {existingItem?.watchingStatus === "dropped" ? (
                <button
                  type="button"
                  onClick={() => {
                    onRemoveDroppedStatus();
                    setPopoverOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  <CircleCheck className="h-4 w-4" />
                  Yarım bıraktım işaretini kaldır
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (detail.type === "movie") {
                      onOpenSheetForDropped();
                    } else {
                      onMarkAsDropped();
                    }
                    setPopoverOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                >
                  <XCircle className="h-4 w-4" />
                  Yarım bıraktım
                </button>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex sm:hidden items-center gap-2 flex-wrap mb-3">
        {typeBadge}
      </div>
      <div className="flex items-center gap-2 flex-wrap mb-4">
        {detail.releaseYear && (
          <span className="text-sm text-muted-foreground">{detail.releaseYear}</span>
        )}
        {detail.voteAverage > 0 && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400 dark:fill-amber-300 dark:text-amber-300" />
            {detail.voteAverage.toFixed(1)}
          </span>
        )}
        {detail.runtime != null && detail.runtime > 0 && (
          <span className="text-sm text-muted-foreground">{formatRuntime(detail.runtime)}</span>
        )}
        {(detail.trailerKey || detail.imdbId) && (
          <span className="flex items-center gap-2 flex-wrap">
            {detail.trailerKey && (
              <Button variant="default" size="sm" asChild>
                <a
                  href={`https://www.youtube.com/watch?v=${detail.trailerKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-1.5"
                >
                  <Play className="h-3.5 w-3.5" />
                  Fragman
                </a>
              </Button>
            )}
            {detail.imdbId && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://www.imdb.com/title/${detail.imdbId}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-1.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  IMDB
                </a>
              </Button>
            )}
          </span>
        )}
      </div>
    </>
  );
}
