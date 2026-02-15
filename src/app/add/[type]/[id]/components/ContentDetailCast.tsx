"use client";

import Image from "next/image";
import { ScrollRow } from "@/components/ScrollRow";
import type { CastMember } from "../types";

interface ContentDetailCastProps {
  cast: CastMember[];
}

export function ContentDetailCast({ cast }: ContentDetailCastProps) {
  if (cast.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold mb-3">Oyuncular</h3>
      <ScrollRow>
        {cast.map((c) => (
          <div key={c.id} className="flex-shrink-0 w-20 text-left">
            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-1.5">
              {c.profilePath ? (
                <Image
                  src={c.profilePath}
                  alt={c.name}
                  width={80}
                  height={120}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl text-muted-foreground/50">?</span>
                </div>
              )}
            </div>
            <p className="text-xs font-medium truncate">{c.name}</p>
            {c.character && (
              <p className="text-[10px] text-muted-foreground truncate">{c.character}</p>
            )}
          </div>
        ))}
      </ScrollRow>
    </div>
  );
}
