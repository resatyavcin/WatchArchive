import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

function toDbRow(item: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  const map: Record<string, string> = {
    tmdbId: "tmdb_id",
    posterPath: "poster_path",
    releaseYear: "release_year",
    watchedAt: "watched_at",
    isFavorite: "is_favorite",
    episodeRatings: "episode_ratings",
    watchingStatus: "watching_status",
    watchedProgressSeconds: "watched_progress_seconds",
    watchedEpisodes: "watched_episodes",
    originCountry: "origin_country",
  };
  for (const [k, v] of Object.entries(item)) {
    if (v === undefined) continue;
    const dbKey = map[k] ?? k;
    row[dbKey] = v;
  }
  return row;
}

function toItem(row: Record<string, unknown>) {
  const map: Record<string, string> = {
    tmdb_id: "tmdbId",
    poster_path: "posterPath",
    release_year: "releaseYear",
    watched_at: "watchedAt",
    is_favorite: "isFavorite",
    episode_ratings: "episodeRatings",
    watching_status: "watchingStatus",
    watched_progress_seconds: "watchedProgressSeconds",
    watched_episodes: "watchedEpisodes",
    origin_country: "originCountry",
  };
  const item: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    const jsKey = map[k] ?? k;
    item[jsKey] = v;
  }
  return item;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await getSupabaseAdmin()
    .from("watched_items")
    .select("*")
    .eq("user_id", session.user.email)
    .order("watched_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const items = (data || []).map((r) => ({
    ...toItem(r),
    watchedAt: r.watched_at,
  }));
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const row = {
    ...toDbRow(body),
    user_id: session.user.email,
    watched_at: body.watchedAt ?? new Date().toISOString(),
  };
  const { data, error } = await getSupabaseAdmin()
    .from("watched_items")
    .upsert(row, {
      onConflict: "user_id,tmdb_id,type",
    })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(toItem(data));
}
