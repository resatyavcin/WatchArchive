"use client";

import { BookmarkPlus, BookmarkCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddToListSheet } from "./AddToListSheet";
import type { TMDBDetail } from "../types";
import type { WatchedItem } from "@/types/watch";

interface ContentDetailActionsProps {
  detail: TMDBDetail;
  existingItem: WatchedItem | null;
  isInWatchlist: boolean;
  markCompleteAnimating: boolean;
  sheetOpen: boolean;
  setSheetOpen: (v: boolean) => void;
  rating: number | undefined;
  setRating: (v: number | undefined) => void;
  notes: string;
  setNotes: (v: string) => void;
  watchedAt: Date;
  setWatchedAt: (v: Date) => void;
  watchedProgressMinutes: number | "";
  setWatchedProgressMinutes: (v: number | "") => void;
  watchedProgressSeconds: number | "";
  setWatchedProgressSeconds: (v: number | "") => void;
  asDropped: boolean;
  setAsDropped: (v: boolean) => void;
  adding: boolean;
  onAddToWatchlist: () => void;
  onRemoveFromWatchlist: () => void;
  onMarkCompleteClick: () => void;
  onMarkComplete: () => void;
  onAdd: () => Promise<void>;
}

export function ContentDetailActions({
  detail,
  existingItem,
  isInWatchlist,
  markCompleteAnimating,
  sheetOpen,
  setSheetOpen,
  rating,
  setRating,
  notes,
  setNotes,
  watchedAt,
  setWatchedAt,
  watchedProgressMinutes,
  setWatchedProgressMinutes,
  watchedProgressSeconds,
  setWatchedProgressSeconds,
  asDropped,
  setAsDropped,
  adding,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onMarkCompleteClick,
  onMarkComplete,
  onAdd,
}: ContentDetailActionsProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Listeme ekle (puan, yarım bıraktım) - her zaman ilk sırada, izleyeceğimdekiler için de erişilebilir */}
      <AddToListSheet
        detail={detail}
        existingItem={existingItem}
        isInWatchlist={isInWatchlist}
        rating={rating}
        setRating={setRating}
        notes={notes}
        setNotes={setNotes}
        watchedAt={watchedAt}
        setWatchedAt={setWatchedAt}
        watchedProgressMinutes={watchedProgressMinutes}
        setWatchedProgressMinutes={setWatchedProgressMinutes}
        watchedProgressSeconds={watchedProgressSeconds}
        setWatchedProgressSeconds={setWatchedProgressSeconds}
        asDropped={asDropped}
        setAsDropped={setAsDropped}
        sheetOpen={sheetOpen}
        setSheetOpen={setSheetOpen}
        adding={adding}
        onAdd={onAdd}
      />

      <Button
        type="button"
        variant={isInWatchlist ? "secondary" : "outline"}
        size="lg"
        className="w-full gap-2 flex-wrap justify-center h-auto min-h-10 py-3 px-4 whitespace-normal min-w-0"
        onClick={isInWatchlist ? onRemoveFromWatchlist : onAddToWatchlist}
        disabled={!!existingItem}
        title={existingItem ? "İzlediğiniz, puan verdiğiniz veya yarım bıraktığınız içerikler izleyeceğim listesine eklenemez" : undefined}
      >
        {isInWatchlist ? (
          <>
            <BookmarkCheck className="h-4 w-4 shrink-0" />
            İzleyeceğim listesinden çıkar
          </>
        ) : existingItem ? (
          <>
            <BookmarkPlus className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline break-words">
              İzlediğiniz, puan verdiğiniz veya yarım bıraktığınız için eklenemez
            </span>
            <span className="sm:hidden">Listeye eklenemez</span>
          </>
        ) : (
          <>
            <BookmarkPlus className="h-4 w-4 shrink-0" />
            İzleyeceğim listesine ekle
          </>
        )}
      </Button>

      {detail.type === "tv" && existingItem?.watchingStatus === "watching" && (
        <Button
          type="button"
          variant="outline"
          onClick={onMarkCompleteClick}
          disabled={markCompleteAnimating}
          className="relative w-full gap-2 overflow-hidden"
          size="lg"
        >
          <span
            className="absolute inset-0 rounded-[inherit] transition-all duration-500 ease-out z-0 bg-green-700 dark:bg-green-600"
            style={{
              width: markCompleteAnimating ? "100%" : "0%",
              left: 0,
              top: 0,
            }}
            onTransitionEnd={() => {
              if (markCompleteAnimating) onMarkComplete();
            }}
          />
          <span
            className={`relative z-10 flex items-center justify-center gap-2 transition-colors ${
              markCompleteAnimating ? "text-white" : ""
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            Bitirdim
          </span>
        </Button>
      )}
    </div>
  );
}
