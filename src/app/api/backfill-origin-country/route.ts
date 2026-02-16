import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB_API_KEY not set" }, { status: 500 });
  }

  const supabase = getSupabaseAdmin();

  const { data: rows, error } = await supabase
    .from("watched_items")
    .select("id, tmdb_id, type")
    .eq("user_id", session.user.email)
    .is("origin_country", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({ message: "No items to update", updated: 0 });
  }

  let updated = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const res = await fetch(
        `${TMDB_BASE}/${row.type}/${row.tmdb_id}?api_key=${apiKey}&language=tr-TR`
      );
      const data = await res.json();

      const countries: string[] =
        data.origin_country ||
        data.production_countries?.map((c: { iso_3166_1: string }) => c.iso_3166_1) ||
        [];

      const originCountry = countries.join(",") || null;

      const { error: updateError } = await supabase
        .from("watched_items")
        .update({ origin_country: originCountry })
        .eq("id", row.id);

      if (updateError) {
        errors.push(`${row.id}: ${updateError.message}`);
      } else {
        updated++;
      }

      // TMDB rate limit: ~40 req/10s
      await new Promise((r) => setTimeout(r, 250));
    } catch (e) {
      errors.push(`${row.id}: ${e instanceof Error ? e.message : "unknown"}`);
    }
  }

  return NextResponse.json({
    message: `Backfill complete`,
    total: rows.length,
    updated,
    errors: errors.length > 0 ? errors : undefined,
  });
}
