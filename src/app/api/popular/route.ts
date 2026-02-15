import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export interface PopularItem {
  id: number;
  title: string;
  posterPath: string | null;
  releaseYear: string;
  type: "movie" | "tv";
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY tanımlı değil." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "movie";

  if (!["movie", "tv"].includes(type)) {
    return NextResponse.json({ error: "Geçersiz tip." }, { status: 400 });
  }

  try {
    const endpoint =
      type === "tv"
        ? `${TMDB_BASE}/tv/popular?api_key=${apiKey}&language=tr-TR&include_adult=true`
        : `${TMDB_BASE}/movie/popular?api_key=${apiKey}&language=tr-TR&include_adult=true`;

    const res = await fetch(endpoint, {
      next: { revalidate: 86400 }, // 1 gün
    });
    const data = await res.json();

    const results: PopularItem[] = (data.results || []).slice(0, 12).map(
      (item: {
        id: number;
        title?: string;
        name?: string;
        poster_path: string | null;
        release_date?: string;
        first_air_date?: string;
      }) => ({
        id: item.id,
        title: item.title || item.name || "",
        posterPath: item.poster_path ? `${IMAGE_BASE}${item.poster_path}` : null,
        releaseYear: (item.release_date || item.first_air_date || "").slice(
          0,
          4
        ),
        type: type as "movie" | "tv",
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("TMDB popular error:", error);
    return NextResponse.json(
      { error: "Popüler içerikler alınamadı." },
      { status: 500 }
    );
  }
}
