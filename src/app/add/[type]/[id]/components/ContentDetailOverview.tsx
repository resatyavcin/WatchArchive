"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const OVERVIEW_LIMIT = 250;

interface ContentDetailOverviewProps {
  overview: string | null | undefined;
  expanded: boolean;
  onExpand: () => void;
}

export function ContentDetailOverview({ overview, expanded, onExpand }: ContentDetailOverviewProps) {
  if (!overview) return null;

  const isLong = overview.length > OVERVIEW_LIMIT;
  const text = isLong && !expanded ? overview.slice(0, OVERVIEW_LIMIT) : overview;

  return (
    <div className="mb-6 relative">
      <p
        className={`text-sm leading-relaxed ${isLong && !expanded ? "relative" : ""}`}
        style={
          isLong && !expanded
            ? {
                maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
              }
            : undefined
        }
      >
        {text}
        {isLong && !expanded && "..."}
      </p>
      {isLong && !expanded && (
        <div className="flex justify-center mt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onExpand}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className="h-4 w-4" />
            Daha fazla yükle
          </Button>
        </div>
      )}
    </div>
  );
}
