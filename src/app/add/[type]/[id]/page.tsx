"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWatch } from "@/components/watch-provider";
import { useContentDetail } from "./hooks/useContentDetail";
import { useContentForm } from "./hooks/useContentForm";
import {
  ContentDetailHeader,
  ContentDetailPoster,
  ContentDetailMeta,
  ContentDetailMetaMenu,
  ContentDetailOverview,
  ContentDetailWatchProviders,
  ContentDetailCast,
  ContentDetailSeasons,
  ContentDetailActions,
} from "./components";

export default function ContentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const type = params.type as string;
  const id = params.id as string;

  const { items, upsertWatched, removeWatchedItem, addToWatchlist, removeFromWatchlist, isInWatchlist } =
    useWatch();

  const { detail, loading, error, seasons, watchProviders, cast } = useContentDetail(type, id);

  const form = useContentForm(detail, items, id);

  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set([1]));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [markCompleteAnimating, setMarkCompleteAnimating] = useState(false);

  const handleBack = useCallback(() => router.back(), [router]);

  const handleRemove = useCallback(async () => {
    if (!form.existingItem || !confirm("Bu öğeyi listeden kaldırmak istediğinize emin misiniz?"))
      return;
    await removeWatchedItem(form.existingItem.id);
    form.resetForm();
    router.push("/");
  }, [form, removeWatchedItem, router]);

  const handleFavoriteToggle = useCallback(async () => {
    const next = !form.isFavorite;
    form.setIsFavorite(next);
    if (form.existingItem && detail) {
      const saved = await upsertWatched({
        ...form.existingItem,
        tmdbId: detail.id,
        title: detail.title,
        type: detail.type as "movie" | "tv",
        isFavorite: next,
      });
      form.setExistingItem(saved);
    }
  }, [form, detail, upsertWatched]);

  const handleMarkAsDropped = useCallback(async () => {
    if (!detail || !confirm("Bu içeriği yarım bıraktığınızı işaretlemek istediğinize emin misiniz?"))
      return;
    const progressSec =
      detail.type === "movie" &&
      (typeof form.watchedProgressMinutes === "number" || typeof form.watchedProgressSeconds === "number")
        ? (Number(form.watchedProgressMinutes) || 0) * 60 + (Number(form.watchedProgressSeconds) || 0)
        : undefined;
    const saved = await upsertWatched({
      tmdbId: detail.id,
      title: detail.title,
      type: detail.type as "movie" | "tv",
      posterPath: detail.posterPath,
      releaseYear: detail.releaseYear,
      watchedAt: form.existingItem?.watchedAt ?? new Date().toISOString(),
      notes: form.notes.trim() || undefined,
      rating: form.existingItem?.rating ?? form.rating,
      isFavorite: form.existingItem?.isFavorite ?? form.isFavorite,
      runtime: detail.runtime ?? form.existingItem?.runtime ?? null,
      watchingStatus: "dropped",
      ...(detail.type === "movie" &&
        progressSec != null &&
        progressSec > 0 && { watchedProgressSeconds: progressSec }),
      ...(detail.type === "tv" &&
        Object.keys(form.watchedEpisodes).length > 0 && { watchedEpisodes: { ...form.watchedEpisodes } }),
      ...(detail.type === "tv" &&
        Object.keys(form.episodeRatings).length > 0 && { episodeRatings: { ...form.episodeRatings } }),
    });
    form.setExistingItem(saved);
    form.setAsDropped(true);
    setSheetOpen(false);
  }, [detail, form, upsertWatched]);

  const handleRemoveDroppedStatus = useCallback(async () => {
    if (
      !detail ||
      !form.existingItem ||
      !confirm("Yarım bıraktım işaretini kaldırmak istediğinize emin misiniz?")
    )
      return;
    const saved = await upsertWatched({
      ...form.existingItem,
      tmdbId: detail.id,
      title: detail.title,
      type: detail.type as "movie" | "tv",
      watchingStatus: detail.type === "tv" ? "watching" : undefined,
    });
    form.setExistingItem(saved);
    form.setAsDropped(false);
  }, [detail, form, upsertWatched]);

  const handleMarkCompleteClick = useCallback(() => {
    if (!detail || !form.existingItem || detail.type !== "tv" || markCompleteAnimating) return;
    setMarkCompleteAnimating(true);
  }, [detail, form.existingItem, markCompleteAnimating]);

  const handleMarkComplete = useCallback(async () => {
    if (!detail || !form.existingItem || detail.type !== "tv") return;
    const now = new Date();
    const saved = await upsertWatched({
      ...form.existingItem,
      tmdbId: detail.id,
      title: detail.title,
      type: detail.type as "movie" | "tv",
      watchingStatus: "completed",
      watchedAt: now.toISOString(),
    });
    form.setExistingItem(saved);
    form.setWatchedAt(now);
    setMarkCompleteAnimating(false);
  }, [detail, form, upsertWatched]);

  const handleAdd = useCallback(async () => {
    if (!detail) return;
    setAdding(true);
    try {
      const progressSec =
        detail.type === "movie" &&
        (typeof form.watchedProgressMinutes === "number" || typeof form.watchedProgressSeconds === "number")
          ? (Number(form.watchedProgressMinutes) || 0) * 60 + (Number(form.watchedProgressSeconds) || 0)
          : undefined;
      const saved = await upsertWatched({
        tmdbId: detail.id,
        title: detail.title,
        type: detail.type as "movie" | "tv",
        posterPath: detail.posterPath,
        releaseYear: detail.releaseYear,
        watchedAt: form.watchedAt.toISOString(),
        notes: form.notes.trim() || undefined,
        rating: form.rating,
        isFavorite: form.isFavorite,
        runtime: detail.runtime ?? form.existingItem?.runtime ?? null,
        watchingStatus:
          detail.type === "tv"
            ? form.asDropped
              ? "dropped"
              : (form.existingItem?.watchingStatus ?? "watching")
            : form.asDropped
              ? "dropped"
              : undefined,
        ...(detail.type === "movie" &&
          progressSec != null &&
          progressSec > 0 && { watchedProgressSeconds: progressSec }),
        ...(detail.type === "tv" &&
          Object.keys(form.watchedEpisodes).length > 0 && { watchedEpisodes: { ...form.watchedEpisodes } }),
        ...(detail.type === "tv" &&
          Object.keys(form.episodeRatings).length > 0 && { episodeRatings: { ...form.episodeRatings } }),
      });
      form.setExistingItem(saved);
      setSheetOpen(false);
      await removeFromWatchlist({ tmdbId: detail.id, type: detail.type });
      if (form.existingItem) router.push("/");
    } finally {
      setAdding(false);
    }
  }, [detail, form, upsertWatched, removeFromWatchlist, router]);

  const handleEpisodeToggle = useCallback(
    async (key: string, next: boolean) => {
      form.setWatchedEpisodes((prev) => ({ ...prev, [key]: next }));
      if (form.existingItem && detail) {
        const updatedEpisodes = { ...form.watchedEpisodes, [key]: next };
        const saved = await upsertWatched({
          ...form.existingItem,
          tmdbId: detail.id,
          title: detail.title,
          type: detail.type as "movie" | "tv",
          watchedEpisodes: updatedEpisodes,
        });
        form.setExistingItem(saved);
      }
    },
    [form, detail, upsertWatched],
  );

  const handleSheetOpenForDropped = useCallback(() => {
    form.setAsDropped(true);
    setSheetOpen(true);
  }, [form]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Skeleton className="w-full h-44 sm:h-52 md:h-60 rounded-none" />
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="flex-shrink-0 w-32 sm:w-40 md:w-44 mx-auto md:mx-0">
              <Skeleton className="aspect-[2/3] rounded-lg shadow-lg" />
            </div>
            <div className="flex-1 min-w-0 space-y-4">
              <Skeleton className="h-5 w-16 rounded" />
              <Skeleton className="h-9 w-3/4 max-w-sm" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-14" />
              </div>
              <Skeleton className="h-4 w-full max-w-xs" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
              <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">{error || "İçerik bulunamadı."}</p>
        <Button variant="outline" onClick={handleBack}>
          Geri dön
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <ContentDetailHeader
        detail={detail}
        onBack={handleBack}
        rightSlot={
          <div className="md:hidden">
            <ContentDetailMetaMenu
              detail={detail}
              existingItem={form.existingItem}
              isFavorite={form.isFavorite}
              menuOpen={menuOpen}
              onMenuOpenChange={setMenuOpen}
              onFavoriteToggle={handleFavoriteToggle}
              onRemove={handleRemove}
              onMarkAsDropped={handleMarkAsDropped}
              onRemoveDroppedStatus={handleRemoveDroppedStatus}
              onOpenSheetForDropped={handleSheetOpenForDropped}
            />
          </div>
        }
      />
      <main className="container mx-auto px-4 sm:px-6 max-w-4xl -mt-12 sm:-mt-16 md:mt-0 pt-6 pb-6 md:py-8 relative z-10 md:z-auto">
        <div className="flex flex-row flex-nowrap gap-4 md:gap-8 items-start">
          <ContentDetailPoster
            detail={detail}
            existingItem={form.existingItem}
          />
          <div className="flex-1 min-w-[100px] overflow-visible">
            <ContentDetailMeta
              detail={detail}
              existingItem={form.existingItem}
              isFavorite={form.isFavorite}
              onFavoriteToggle={handleFavoriteToggle}
              onRemove={handleRemove}
              onMarkAsDropped={handleMarkAsDropped}
              onRemoveDroppedStatus={handleRemoveDroppedStatus}
              onOpenSheetForDropped={handleSheetOpenForDropped}
            />
            {/* Desktop: content in column */}
            <div className="hidden md:block">
              {detail.genres.length > 0 && (
                <p className="text-sm text-muted-foreground mb-4">{detail.genres.join(", ")}</p>
              )}
              <ContentDetailOverview
                overview={detail.overview}
                expanded={overviewExpanded}
                onExpand={() => setOverviewExpanded(true)}
              />
              <ContentDetailWatchProviders watchProviders={watchProviders} />
              <ContentDetailCast cast={cast} />
              <ContentDetailSeasons
                seasons={seasons}
                detail={detail}
                watchedEpisodes={form.watchedEpisodes}
                expandedSeasons={expandedSeasons}
                onExpandedSeasonsChange={setExpandedSeasons}
                onEpisodeToggle={handleEpisodeToggle}
              />
              <ContentDetailActions
                detail={detail}
                existingItem={form.existingItem}
                isInWatchlist={isInWatchlist(detail.id, detail.type)}
                markCompleteAnimating={markCompleteAnimating}
                sheetOpen={sheetOpen}
                setSheetOpen={setSheetOpen}
                rating={form.rating}
                setRating={form.setRating}
                notes={form.notes}
                setNotes={form.setNotes}
                watchedAt={form.watchedAt}
                setWatchedAt={form.setWatchedAt}
                watchedProgressMinutes={form.watchedProgressMinutes}
                setWatchedProgressMinutes={form.setWatchedProgressMinutes}
                watchedProgressSeconds={form.watchedProgressSeconds}
                setWatchedProgressSeconds={form.setWatchedProgressSeconds}
                asDropped={form.asDropped}
                setAsDropped={form.setAsDropped}
                adding={adding}
                onAddToWatchlist={async () => {
                  if (form.existingItem) {
                    alert("Bu içerik zaten izlediğiniz listede. İzlediğiniz, puan verdiğiniz veya yarım bıraktığınız içerikler izleyeceğim listesine eklenemez.");
                    return;
                  }
                  try {
                    await addToWatchlist({
                      tmdbId: detail.id,
                      title: detail.title,
                      type: detail.type as "movie" | "tv",
                      posterPath: detail.posterPath,
                      releaseYear: detail.releaseYear,
                    });
                  } catch (e) {
                    alert(e instanceof Error ? e.message : "İzleyeceğim listesine eklenemedi.");
                  }
                }}
                onRemoveFromWatchlist={() => removeFromWatchlist({ tmdbId: detail.id, type: detail.type })}
                onMarkCompleteClick={handleMarkCompleteClick}
                onMarkComplete={handleMarkComplete}
                onAdd={handleAdd}
              />
            </div>
          </div>
        </div>
        {/* Mobile: full-width content below poster+title row */}
        <div className="mt-4 md:hidden">
          {detail.genres.length > 0 && (
            <p className="text-sm text-muted-foreground mb-4">{detail.genres.join(", ")}</p>
          )}
          <ContentDetailOverview
            overview={detail.overview}
            expanded={overviewExpanded}
            onExpand={() => setOverviewExpanded(true)}
          />
          <ContentDetailWatchProviders watchProviders={watchProviders} />
          <ContentDetailCast cast={cast} />
          <ContentDetailSeasons
            seasons={seasons}
            detail={detail}
            watchedEpisodes={form.watchedEpisodes}
            expandedSeasons={expandedSeasons}
            onExpandedSeasonsChange={setExpandedSeasons}
            onEpisodeToggle={handleEpisodeToggle}
          />
          <ContentDetailActions
            detail={detail}
            existingItem={form.existingItem}
            isInWatchlist={isInWatchlist(detail.id, detail.type)}
            markCompleteAnimating={markCompleteAnimating}
            sheetOpen={sheetOpen}
            setSheetOpen={setSheetOpen}
            rating={form.rating}
            setRating={form.setRating}
            notes={form.notes}
            setNotes={form.setNotes}
            watchedAt={form.watchedAt}
            setWatchedAt={form.setWatchedAt}
            watchedProgressMinutes={form.watchedProgressMinutes}
            setWatchedProgressMinutes={form.setWatchedProgressMinutes}
            watchedProgressSeconds={form.watchedProgressSeconds}
            setWatchedProgressSeconds={form.setWatchedProgressSeconds}
            asDropped={form.asDropped}
            setAsDropped={form.setAsDropped}
            adding={adding}
            onAddToWatchlist={async () => {
              if (form.existingItem) {
                alert("Bu içerik zaten izlediğiniz listede. İzlediğiniz, puan verdiğiniz veya yarım bıraktığınız içerikler izleyeceğim listesine eklenemez.");
                return;
              }
              try {
                await addToWatchlist({
                  tmdbId: detail.id,
                  title: detail.title,
                  type: detail.type as "movie" | "tv",
                  posterPath: detail.posterPath,
                  releaseYear: detail.releaseYear,
                });
              } catch (e) {
                alert(e instanceof Error ? e.message : "İzleyeceğim listesine eklenemedi.");
              }
            }}
            onRemoveFromWatchlist={() => removeFromWatchlist({ tmdbId: detail.id, type: detail.type })}
            onMarkCompleteClick={handleMarkCompleteClick}
            onMarkComplete={handleMarkComplete}
            onAdd={handleAdd}
          />
        </div>
      </main>
    </div>
  );
}
