"use client";

import { useRef, useEffect } from "react";
import { Heart, Trash2, MoreVertical, XCircle, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { TMDBDetail } from "../types";
import type { WatchedItem } from "@/types/watch";

interface ContentDetailMetaMenuProps {
  detail: TMDBDetail;
  existingItem: WatchedItem | null;
  isFavorite: boolean;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onFavoriteToggle: () => void;
  onRemove: () => void;
  onMarkAsDropped: () => void;
  onRemoveDroppedStatus: () => void;
  onOpenSheetForDropped: () => void;
}

export function ContentDetailMetaMenu({
  detail,
  existingItem,
  isFavorite,
  menuOpen,
  onMenuOpenChange,
  onFavoriteToggle,
  onRemove,
  onMarkAsDropped,
  onRemoveDroppedStatus,
  onOpenSheetForDropped,
}: ContentDetailMetaMenuProps) {
  const close = () => onMenuOpenChange(false);
  const openedAtRef = useRef(0);
  const lastToggleRef = useRef(0);

  useEffect(() => {
    if (menuOpen) openedAtRef.current = Date.now();
  }, [menuOpen]);

  const handleToggle = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    if (now - lastToggleRef.current < 300) return;
    lastToggleRef.current = now;
    onMenuOpenChange(!menuOpen);
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="h-11 w-11 min-w-11 min-h-11 rounded-full bg-background/90 backdrop-blur shadow-md hover:bg-background touch-manipulation"
        aria-label="Menü"
        aria-expanded={menuOpen}
        onPointerDown={handleToggle}
        onClick={(e) => e.preventDefault()}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
      <Sheet open={menuOpen} onOpenChange={onMenuOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl"
        onPointerDownOutside={(e) => {
          if (Date.now() - openedAtRef.current < 1200) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (Date.now() - openedAtRef.current < 1200) e.preventDefault();
        }}
        onFocusOutside={(e) => {
          if (Date.now() - openedAtRef.current < 1200) e.preventDefault();
        }}
      >
        <SheetHeader className="text-left pb-4">
          <SheetTitle>İşlemler</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              onFavoriteToggle();
              close();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm hover:bg-muted"
          >
            <Heart className={`h-5 w-5 shrink-0 ${isFavorite ? "fill-current text-red-500" : ""}`} />
            {isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
          </button>
          {existingItem && (
            <button
              type="button"
              onClick={() => {
                onRemove();
                close();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-5 w-5 shrink-0" />
              Listeden kaldır
            </button>
          )}
          {existingItem?.watchingStatus === "dropped" ? (
            <button
              type="button"
              onClick={() => {
                onRemoveDroppedStatus();
                close();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm hover:bg-muted"
            >
              <CircleCheck className="h-5 w-5 shrink-0" />
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
                close();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/50"
            >
              <XCircle className="h-5 w-5 shrink-0" />
              Yarım bıraktım
            </button>
          )}
        </div>
      </SheetContent>
      </Sheet>
    </>
  );
}
