import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";
const PROFILE_SIZE = "w185";

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
  order: number;
}

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
    const endpoint = `${TMDB_BASE}/${type}/${id}/credits?api_key=${apiKey}&language=tr-TR`;
    const res = await fetch(endpoint, {
      next: { revalidate: 86400 },
    });
    const data = await res.json();

    if (data.status_code === 34 || !data.cast) {
      return NextResponse.json({ cast: [] });
    }

    const cast: CastMember[] = (data.cast || [])
      .slice(0, 15)
      .map(
        (
          c: {
            id: number;
            name: string;
            character?: string;
            profile_path: string | null;
            order: number;
          },
          i: number
        ) => ({
          id: c.id,
          name: c.name,
          character: c.character || "",
          profilePath: c.profile_path
            ? `${IMAGE_BASE}/${PROFILE_SIZE}${c.profile_path.startsWith("/") ? c.profile_path : `/${c.profile_path}`}`
            : null,
          order: c.order ?? i,
        })
      );

    return NextResponse.json({ cast });
  } catch (error) {
    console.error("TMDB credits error:", error);
    return NextResponse.json(
      { error: "Oyuncu listesi alınamadı." },
      { status: 500 }
    );
  }
}
