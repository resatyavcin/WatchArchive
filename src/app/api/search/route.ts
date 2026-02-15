import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export async function GET(request: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY is not defined. Add it to .env.local" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const type = searchParams.get("type") || "movie";

  if (!q || q.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  try {
    const endpoint =
      type === "tv"
        ? `${TMDB_BASE}/search/tv?api_key=${apiKey}&language=tr-TR&include_adult=true&query=${encodeURIComponent(q)}`
        : `${TMDB_BASE}/search/movie?api_key=${apiKey}&language=tr-TR&include_adult=true&query=${encodeURIComponent(q)}`;

    const res = await fetch(endpoint, {
      next: { revalidate: 600 }, // 10 dakika sunucu cache
    });
    const data = await res.json();

    const results = (data.results || []).slice(0, 12).map((item: { id: number; title?: string; name?: string; poster_path: string | null; release_date?: string; first_air_date?: string }) => ({
      id: item.id,
      title: item.title || item.name || "",
      posterPath: item.poster_path ? `${IMAGE_BASE}${item.poster_path}` : null,
      releaseYear: (item.release_date || item.first_air_date || "").slice(0, 4),
      type,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("TMDB search error:", error);
    return NextResponse.json(
      { error: "Arama sırasında hata oluştu." },
      { status: 500 }
    );
  }
}
