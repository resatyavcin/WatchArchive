"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TMDBDetail } from "../types";

interface ContentDetailHeaderProps {
  detail: TMDBDetail;
  onBack: () => void;
  rightSlot?: React.ReactNode;
}

export function ContentDetailHeader({ detail, onBack, rightSlot }: ContentDetailHeaderProps) {
  if (detail.backdropPath) {
    return (
      <div className="relative z-0 w-full h-44 sm:h-52 md:max-h-48 md:h-48 bg-muted overflow-hidden">
        <div className="absolute inset-0 z-[1] pointer-events-none md:hidden bg-gradient-to-b from-transparent via-background/50 to-background" />
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-3 left-3 z-[100] h-9 w-9 rounded-full bg-background/90 backdrop-blur shadow-md hover:bg-background"
          onClick={onBack}
          aria-label="Geri"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {rightSlot && (
          <div className="absolute top-3 right-4 z-[100] pointer-events-auto isolate">
            {rightSlot}
          </div>
        )}
        <Image
          src={detail.backdropPath}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-top"
          priority
        />
      </div>
    );
  }
  return (
    <div className="pt-4 px-4">
      <Button variant="ghost" size="icon" onClick={onBack} aria-label="Geri">
        <ArrowLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}
