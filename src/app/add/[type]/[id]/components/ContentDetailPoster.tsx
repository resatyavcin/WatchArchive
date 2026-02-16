"use client";

import Image from "next/image";
import { Film, Tv, Play } from "lucide-react";
import { ImageLightbox } from "@/components/ImageLightbox";
import { useLightbox } from "@/hooks/useLightbox";
import type { TMDBDetail } from "../types";
import type { WatchedItem } from "@/types/watch";

interface ContentDetailPosterProps {
  detail: TMDBDetail;
  existingItem: WatchedItem | null;
}

export function ContentDetailPoster({ detail, existingItem }: ContentDetailPosterProps) {
  const lightbox = useLightbox();

  return (
    <>
      <div className="flex-shrink-0 w-32 sm:w-40 md:w-44 self-start">
        <button
          type="button"
          onClick={() => detail.posterPath && lightbox.openLightbox()}
          className="w-full aspect-[2/3] relative rounded-lg overflow-hidden bg-muted shadow-xl cursor-zoom-in"
        >
          {detail.posterPath ? (
            <Image
              src={detail.posterPath}
              alt={detail.title}
              fill
              sizes="(max-width: 768px) 160px, 176px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {detail.type === "movie" ? (
                <Film className="h-24 w-24 text-muted-foreground/50" />
              ) : (
                <Tv className="h-24 w-24 text-muted-foreground/50" />
              )}
            </div>
          )}
          {detail.type === "tv" && existingItem?.watchingStatus === "watching" && (
            <span
              className="absolute top-2 right-2 z-10 inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white shadow-lg dark:bg-amber-500 dark:text-white"
              title="İzliyorum"
            >
              <Play className="h-4 w-4 fill-current" />
            </span>
          )}
        </button>
      </div>

      {detail.posterPath && (
        <ImageLightbox src={detail.posterPath} alt={detail.title} lightbox={lightbox} />
      )}
    </>
  );
}
