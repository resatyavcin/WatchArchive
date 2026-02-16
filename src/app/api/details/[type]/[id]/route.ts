import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";
const IMAGE_SIZE = "w500";
const BACKDROP_SIZE = "w1280";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY tanımlı değil." },
      { status: 500 }
    );
  }

  const { type, id } = await params;
  if (!["movie", "tv"].includes(type) || !id) {
    return NextResponse.json({ error: "Geçersiz parametre." }, { status: 400 });
  }

  try {
    const endpoint = `${TMDB_BASE}/${type}/${id}?api_key=${apiKey}&language=tr-TR&append_to_response=external_ids,images,videos`;
    const res = await fetch(endpoint, {
      next: { revalidate: 86400 }, // 24 saat sunucu cache
    });
    const data = await res.json();

    if (data.status_code === 34 || !data.id) {
      return NextResponse.json({ error: "İçerik bulunamadı." }, { status: 404 });
    }

    const toBackdropPath = (p: string | null | undefined) =>
      p ? `${IMAGE_BASE}/${BACKDROP_SIZE}${p.startsWith("/") ? p : `/${p}`}` : null;

    const backdropPathRaw =
      data.backdrop_path ||
      data.images?.backdrops?.[0]?.file_path ||
      null;

    const item = {
      id: data.id,
      title: data.title || data.name || "",
      overview: data.overview || "",
      posterPath: data.poster_path
        ? `${IMAGE_BASE}/${IMAGE_SIZE}${data.poster_path.startsWith("/") ? data.poster_path : `/${data.poster_path}`}`
        : null,
      backdropPath: toBackdropPath(backdropPathRaw),
      releaseYear: (
        data.release_date ||
        data.first_air_date ||
        ""
      ).slice(0, 4),
      voteAverage: data.vote_average,
      runtime:
        type === "movie"
          ? data.runtime || null
          : data.episode_run_time?.[0] ?? data.runtime ?? null,
      genres: (data.genres || []).map((g: { id: number; name: string }) => g.name),
      type,
      imdbId: data.external_ids?.imdb_id || null,
      trailerKey:
        data.videos?.results?.find(
          (v: { site: string; type: string }) => v.site === "YouTube" && v.type === "Trailer"
        )?.key ?? null,
      originCountry: data.origin_country || data.production_countries?.map((c: { iso_3166_1: string }) => c.iso_3166_1) || [],
    };

    return NextResponse.json(item);
  } catch (error) {
    console.error("TMDB details error:", error);
    return NextResponse.json(
      { error: "Detaylar alınırken hata oluştu." },
      { status: 500 }
    );
  }
}
