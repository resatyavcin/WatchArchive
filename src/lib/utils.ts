import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Dakika cinsinden süreyi saat ve dakika formatına çevirir.
 * @param minutes - Süre (dakika)
 * @returns Örn: "2s 22dk" veya "45dk"
 */
export function formatRuntime(minutes: number | null | undefined): string {
  if (minutes == null || minutes <= 0) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} dk`;
  if (mins === 0) return `${hours} saat`;
  return `${hours}s ${mins}dk`;
}
