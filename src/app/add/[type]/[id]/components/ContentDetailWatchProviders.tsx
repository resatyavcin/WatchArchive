"use client";

import type { WatchProviders } from "../types";

function ProviderLogo({
  logoPath,
  name,
  size = "md",
}: {
  logoPath: string | null;
  name: string;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  if (logoPath) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoPath} alt={name} className={`${sizeClass} rounded object-contain`} />
    );
  }
  return <span className={size === "sm" ? "text-[10px]" : "text-xs"}>{name}</span>;
}

interface ContentDetailWatchProvidersProps {
  watchProviders: WatchProviders | null;
}

export function ContentDetailWatchProviders({ watchProviders }: ContentDetailWatchProvidersProps) {
  const hasProviders =
    watchProviders &&
    (watchProviders.flatrate?.length > 0 ||
      watchProviders.rent?.length > 0 ||
      watchProviders.buy?.length > 0);

  if (!hasProviders) return null;

  return (
    <div className="mb-6 space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Nerden izlenir
      </p>
      <div className="space-y-2">
        {watchProviders!.flatrate?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {watchProviders!.flatrate.map((p) => (
              <a
                key={p.id}
                href={watchProviders!.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-2 py-1.5 hover:bg-muted/50 transition-colors"
                title={p.name}
              >
                <ProviderLogo logoPath={p.logoPath} name={p.name} />
              </a>
            ))}
          </div>
        )}
        {watchProviders!.rent?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] text-muted-foreground w-full">Kiralama</span>
            {watchProviders!.rent.map((p) => (
              <a
                key={p.id}
                href={watchProviders!.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded border border-border/30 bg-muted/20 px-1.5 py-1 hover:bg-muted/40 transition-colors"
                title={p.name}
              >
                <ProviderLogo logoPath={p.logoPath} name={p.name} size="sm" />
              </a>
            ))}
          </div>
        )}
        {watchProviders!.buy?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] text-muted-foreground w-full">Satın alma</span>
            {watchProviders!.buy.map((p) => (
              <a
                key={p.id}
                href={watchProviders!.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded border border-border/30 bg-muted/20 px-1.5 py-1 hover:bg-muted/40 transition-colors"
                title={p.name}
              >
                <ProviderLogo logoPath={p.logoPath} name={p.name} size="sm" />
              </a>
            ))}
          </div>
        )}
      </div>
      <p className="text-[9px] text-muted-foreground/80">JustWatch</p>
    </div>
  );
}
