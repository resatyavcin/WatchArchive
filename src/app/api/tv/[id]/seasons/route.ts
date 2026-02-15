import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";
const IMAGE_SIZE = "w185";

export interface TVEpisode {
  episodeNumber: number;
  name: string;
  overview: string;
  airDate: string | null;
  stillPath: string | null;
  runtime: number | null;
}

export interface TVSeason {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  episodes: TVEpisode[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY tanımlı değil." },
      { status: 500 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Geçersiz ID." }, { status: 400 });
  }

  try {
    const showRes = await fetch(
      `${TMDB_BASE}/tv/${id}?api_key=${apiKey}&language=tr-TR`,
      { next: { revalidate: 86400 } }
    );
    const showData = await showRes.json();

    if (showData.status_code === 34 || !showData.id) {
      return NextResponse.json(
        { error: "Dizi bulunamadı." },
        { status: 404 }
      );
    }

    const numSeasons = Math.min(showData.number_of_seasons || 0, 20);
    const seasons: TVSeason[] = [];

    for (let s = 1; s <= numSeasons; s++) {
      const seasonRes = await fetch(
        `${TMDB_BASE}/tv/${id}/season/${s}?api_key=${apiKey}&language=tr-TR`,
        { next: { revalidate: 86400 } }
      );
      const seasonData = await seasonRes.json();

      if (seasonData.status_code === 34 || !seasonData.episodes) {
        continue;
      }

      const episodes: TVEpisode[] = (seasonData.episodes || []).map(
        (ep: {
          episode_number: number;
          name: string;
          overview: string;
          air_date: string | null;
          still_path: string | null;
          runtime: number | null;
        }) => ({
          episodeNumber: ep.episode_number,
          name: ep.name || `Bölüm ${ep.episode_number}`,
          overview: ep.overview || "",
          airDate: ep.air_date || null,
          stillPath: ep.still_path
            ? `${IMAGE_BASE}/${IMAGE_SIZE}${ep.still_path.startsWith("/") ? ep.still_path : `/${ep.still_path}`}`
            : null,
          runtime: ep.runtime || null,
        })
      );

      seasons.push({
        seasonNumber: s,
        name: seasonData.name || `Sezon ${s}`,
        episodeCount: episodes.length,
        episodes,
      });
    }

    return NextResponse.json({ seasons });
  } catch (error) {
    console.error("TV seasons error:", error);
    return NextResponse.json(
      { error: "Sezonlar alınırken hata oluştu." },
      { status: 500 }
    );
  }
}
