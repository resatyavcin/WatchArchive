"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  className?: string;
}

export function StarRating({
  value,
  onChange,
  max = 5,
  className,
}: StarRatingProps) {
  return (
    <div className={cn("flex gap-0.5", className)} role="group" aria-label="Rate">
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const filled = value >= starValue;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(value === starValue ? 0 : starValue)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange(value === starValue ? 0 : starValue);
              }
            }}
            className="p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-transform hover:scale-110"
            aria-label={`${starValue} yıldız`}
            aria-pressed={filled}
          >
            <Star
              className={cn(
                "h-8 w-8 transition-colors",
                filled
                  ? "fill-amber-400 text-amber-400 dark:fill-amber-300 dark:text-amber-300"
                  : "fill-none text-muted-foreground/50 hover:text-amber-400/70 dark:text-muted-foreground/60 dark:hover:text-amber-400/80"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
