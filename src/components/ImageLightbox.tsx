"use client";

import Image from "next/image";
import type { useLightbox } from "@/hooks/useLightbox";

interface ImageLightboxProps {
  src: string;
  alt: string;
  lightbox: ReturnType<typeof useLightbox>;
}

export function ImageLightbox({ src, alt, lightbox }: ImageLightboxProps) {
  const {
    open,
    flyAway,
    imageRef,
    closeLightbox,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = lightbox;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeLightbox}
      style={{
        opacity: flyAway ? 0 : undefined,
        transition: flyAway ? "opacity 0.4s ease-out" : undefined,
      }}
    >
      <div
        ref={imageRef}
        className="relative max-w-[90vw] max-h-[90vh] animate-in zoom-in-95 duration-200 touch-none select-none"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ cursor: "grab" }}
      >
        <Image
          src={src}
          alt={alt}
          width={500}
          height={750}
          className="rounded-xl object-contain max-h-[90vh] w-auto pointer-events-none"
          draggable={false}
          priority
        />
      </div>
    </div>
  );
}
