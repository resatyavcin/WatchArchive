import { useEffect, useState } from "react";
import { cachedFetch, CACHE_TTL } from "@/lib/api-cache";
import type { TMDBDetail, TVSeason, WatchProviders, CastMember } from "../types";

export function useContentDetail(type: string, id: string) {
  const [detail, setDetail] = useState<TMDBDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seasons, setSeasons] = useState<TVSeason[]>([]);
  const [watchProviders, setWatchProviders] = useState<WatchProviders | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);

  useEffect(() => {
    if (!type || !id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const fetchDetail = async () => {
      try {
        const { data, ok } = await cachedFetch<TMDBDetail | { error?: string }>(
          `/api/details/${type}/${id}`,
          CACHE_TTL.long,
        );
        if (cancelled) return;
        if (!ok) {
          setError((data as { error?: string })?.error || "Yüklenemedi");
          setDetail(null);
          return;
        }
        setDetail(data as TMDBDetail);
      } catch {
        if (!cancelled) {
          setError("Yüklenemedi");
          setDetail(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [type, id]);

  useEffect(() => {
    if (type !== "tv" || !id) return;
    const fetchSeasons = async () => {
      try {
        const { data, ok } = await cachedFetch<{ seasons: TVSeason[] }>(
          `/api/tv/${id}/seasons`,
          CACHE_TTL.long,
        );
        if (ok && data?.seasons) setSeasons(data.seasons);
      } catch {
        setSeasons([]);
      }
    };
    fetchSeasons();
  }, [type, id]);

  useEffect(() => {
    if (!type || !id) return;
    const fetchProviders = async () => {
      try {
        const { data, ok } = await cachedFetch<WatchProviders>(
          `/api/watch-providers/${type}/${id}?country=TR`,
          CACHE_TTL.long,
        );
        if (ok && data) setWatchProviders(data);
      } catch {
        setWatchProviders(null);
      }
    };
    fetchProviders();
  }, [type, id]);

  useEffect(() => {
    if (!type || !id) return;
    const fetchCredits = async () => {
      try {
        const { data, ok } = await cachedFetch<{ cast: CastMember[] }>(
          `/api/credits/${type}/${id}`,
          CACHE_TTL.long,
        );
        if (ok && data?.cast) setCast(data.cast);
      } catch {
        setCast([]);
      }
    };
    fetchCredits();
  }, [type, id]);

  return {
    detail,
    loading,
    error,
    seasons,
    watchProviders,
    cast,
  };
}
