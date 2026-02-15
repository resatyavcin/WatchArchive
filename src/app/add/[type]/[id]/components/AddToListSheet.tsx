"use client";

import { useRef, useEffect } from "react";
import { Star, Loader2, CalendarIcon, Circle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { tr as trDateFns } from "date-fns/locale";
import { tr } from "react-day-picker/locale";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import type { TMDBDetail } from "../types";
import type { WatchedItem } from "@/types/watch";

interface AddToListSheetProps {
  detail: TMDBDetail;
  existingItem: WatchedItem | null;
  isInWatchlist?: boolean;
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
  sheetOpen: boolean;
  setSheetOpen: (v: boolean) => void;
  adding: boolean;
  onAdd: () => Promise<void>;
}

export function AddToListSheet({
  detail,
  existingItem,
  isInWatchlist = false,
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
  sheetOpen,
  setSheetOpen,
  adding,
  onAdd,
}: AddToListSheetProps) {
  const openedAtRef = useRef(0);
  useEffect(() => {
    if (sheetOpen) openedAtRef.current = Date.now();
  }, [sheetOpen]);

  const preventCloseRecently = (e: Event) => {
    if (Date.now() - openedAtRef.current < 400) e.preventDefault();
  };

  return (
    <>
      <Button
        type="button"
        className="w-full gap-2"
        size="lg"
        variant={
          detail.type === "tv" && existingItem?.watchingStatus === "watching"
            ? "outline"
            : "default"
        }
        onClick={() => setSheetOpen(true)}
      >
        <Star className="h-4 w-4" />
        {existingItem
          ? existingItem.watchingStatus === "watching"
            ? "Puan veya not ekle"
            : "Puanı veya notu güncelle"
          : isInWatchlist
            ? "Puan ver / Yarım bıraktım / İzledim"
            : "Listeme ekle (puan, not, tarih)"}
      </Button>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[85vh] overflow-y-auto"
        onPointerDownOutside={preventCloseRecently}
        onInteractOutside={preventCloseRecently}
        onFocusOutside={preventCloseRecently}
      >
        <SheetHeader className="text-left pb-4">
          <SheetTitle>{existingItem ? "Güncelle" : "Listeme Ekle"}</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 pb-8">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Puan (1-5 yıldız)
            </label>
            <StarRating
              value={rating ?? 0}
              onChange={(v) => setRating(v === 0 ? undefined : v)}
              max={5}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="notes-sheet"
              className="text-sm text-muted-foreground"
            >
              Not (isteğe bağlı)
            </label>
            <Textarea
              id="notes-sheet"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="İzlerken aklına gelenler..."
              rows={3}
              className="resize-none"
            />
          </div>

          {detail.type === "movie" && (
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                İzlenen süre (isteğe bağlı)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={999}
                  placeholder="dk"
                  value={watchedProgressMinutes}
                  onChange={(e) =>
                    setWatchedProgressMinutes(
                      e.target.value === ""
                        ? ""
                        : Math.min(
                            999,
                            Math.max(0, parseInt(e.target.value, 10) || 0),
                          ),
                    )
                  }
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">dk</span>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  placeholder="sn"
                  value={watchedProgressSeconds}
                  onChange={(e) =>
                    setWatchedProgressSeconds(
                      e.target.value === ""
                        ? ""
                        : Math.min(
                            59,
                            Math.max(0, parseInt(e.target.value, 10) || 0),
                          ),
                    )
                  }
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">sn</span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setAsDropped(!asDropped)}
            className={`flex items-center gap-2 w-full rounded-lg border px-4 py-3 text-left transition-colors ${
              asDropped
                ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-500"
                : "border-border hover:bg-muted/50"
            }`}
          >
            {asDropped ? (
              <XCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">
              Yarım bıraktım olarak ekle
            </span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-sm text-muted-foreground">
              İzlenme tarihi:
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-[200px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(watchedAt, "d MMMM yyyy", { locale: trDateFns })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={watchedAt}
                  onSelect={(date) => date && setWatchedAt(date)}
                  locale={tr}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button
            type="button"
            onClick={onAdd}
            disabled={adding}
            className="w-full"
            size="lg"
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : existingItem ? (
              "Güncelle"
            ) : (
              "Listeme Ekle"
            )}
          </Button>
        </div>
      </SheetContent>
      </Sheet>
    </>
  );
}
