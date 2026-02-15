import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";

function toItem(row: Record<string, unknown>) {
  return {
    id: row.id,
    tmdbId: row.tmdb_id,
    title: row.title,
    type: row.type,
    posterPath: row.poster_path,
    releaseYear: row.release_year,
    addedAt: row.added_at,
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await getSupabaseAdmin()
    .from("watchlist_items")
    .select("*")
    .eq("user_id", session.user.email)
    .order("added_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const items = (data || []).map(toItem);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();

  const { data: existing } = await getSupabaseAdmin()
    .from("watched_items")
    .select("id")
    .eq("user_id", session.user.email)
    .eq("tmdb_id", body.tmdbId)
    .eq("type", body.type)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      {
        error:
          "İzlediğiniz, puan verdiğiniz veya yarım bıraktığınız içerikler izleyeceğim listesine eklenemez",
      },
      { status: 400 }
    );
  }

  const row = {
    user_id: session.user.email,
    tmdb_id: body.tmdbId,
    title: body.title,
    type: body.type,
    poster_path: body.posterPath ?? null,
    release_year: body.releaseYear ?? "",
  };
  const { data, error } = await getSupabaseAdmin()
    .from("watchlist_items")
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

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const tmdbId = searchParams.get("tmdbId");
  const type = searchParams.get("type");
  let query = getSupabaseAdmin()
    .from("watchlist_items")
    .delete()
    .eq("user_id", session.user.email);
  if (id) {
    query = query.eq("id", id);
  } else if (tmdbId && type) {
    query = query.eq("tmdb_id", Number(tmdbId)).eq("type", type);
  } else {
    return NextResponse.json(
      { error: "id veya tmdbId+type gerekli" },
      { status: 400 }
    );
  }
  const { error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
