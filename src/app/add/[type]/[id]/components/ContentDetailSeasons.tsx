"use client";

import { useRef, useEffect } from "react";
import { ChevronRight, Circle, CircleCheck } from "lucide-react";
import { formatRuntime } from "@/lib/utils";
import type { TVSeason } from "../types";
import type { TMDBDetail } from "../types";

interface ContentDetailSeasonsProps {
  seasons: TVSeason[];
  detail: TMDBDetail;
  watchedEpisodes: Record<string, boolean>;
  expandedSeasons: Set<number>;
  onExpandedSeasonsChange: (fn: (prev: Set<number>) => Set<number>) => void;
  onEpisodeToggle: (key: string, next: boolean) => void;
}

export function ContentDetailSeasons({
  seasons,
  detail,
  watchedEpisodes,
  expandedSeasons,
  onExpandedSeasonsChange,
  onEpisodeToggle,
}: ContentDetailSeasonsProps) {
  const seasonRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    const [num] = Array.from(expandedSeasons);
    if (num != null && seasonRefs.current[num]) {
      seasonRefs.current[num]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [expandedSeasons]);

  if (detail.type !== "tv" || seasons.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold mb-3">Bölümler</h3>
      <div className="space-y-2">
        {seasons.map((season) => {
          const isExpanded = expandedSeasons.has(season.seasonNumber);
          return (
            <div
              key={season.seasonNumber}
              ref={(el) => {
                seasonRefs.current[season.seasonNumber] = el;
              }}
              className="rounded-lg border border-border/50 overflow-hidden scroll-mt-14"
            >
              <button
                type="button"
                onClick={() =>
                  onExpandedSeasonsChange((prev) => {
                    if (prev.has(season.seasonNumber)) {
                      const next = new Set(prev);
                      next.delete(season.seasonNumber);
                      return next;
                    }
                    return new Set([season.seasonNumber]);
                  })
                }
                className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
              >
                <span className="text-sm font-medium">{season.name}</span>
                <span className="text-xs text-muted-foreground">
                  {season.episodeCount} bölüm
                </span>
                <ChevronRight
                  className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
                />
              </button>
              {isExpanded && (
                <div className="divide-y divide-border/50">
                  {season.episodes.map((ep) => {
                    const key = `S${season.seasonNumber}E${ep.episodeNumber}`;
                    const isWatched = watchedEpisodes[key] ?? false;
                    return (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-2 hover:bg-muted/20"
                      >
                        <div className="min-w-0 flex-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEpisodeToggle(key, !isWatched);
                            }}
                            className="flex-shrink-0 p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-ring"
                            title={isWatched ? "İzlenmedi olarak işaretle" : "İzlendi olarak işaretle"}
                            aria-label={isWatched ? "İzlenmedi" : "İzlendi"}
                          >
                            {isWatched ? (
                              <CircleCheck className="h-5 w-5 text-green-600 dark:text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground/50 hover:text-muted-foreground" />
                            )}
                          </button>
                          <span className="text-xs font-mono text-muted-foreground">
                            S{season.seasonNumber}E{ep.episodeNumber}
                          </span>
                          {ep.runtime != null && ep.runtime > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {formatRuntime(ep.runtime)}
                            </span>
                          )}
                          <span
                            className={`text-sm line-clamp-1 ${isWatched ? "text-muted-foreground" : ""}`}
                          >
                            {ep.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
