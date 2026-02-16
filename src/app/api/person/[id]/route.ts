import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";
const PROFILE_SIZE = "h632";
const POSTER_SIZE = "w500";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB_API_KEY tanımlı değil." }, { status: 500 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Geçersiz parametre." }, { status: 400 });
  }

  try {
    const endpoint = `${TMDB_BASE}/person/${id}?api_key=${apiKey}&language=tr-TR&append_to_response=combined_credits,external_ids`;
    const res = await fetch(endpoint, { next: { revalidate: 86400 } });
    const data = await res.json();

    if (data.status_code === 34 || !data.id) {
      return NextResponse.json({ error: "Kişi bulunamadı." }, { status: 404 });
    }

    const profilePath = data.profile_path
      ? `${IMAGE_BASE}/${PROFILE_SIZE}${data.profile_path}`
      : null;

    const credits = [
      ...((data.combined_credits?.cast as Array<Record<string, unknown>>) || []).map((c) => ({
        id: c.id as number,
        title: (c.title || c.name || "") as string,
        character: (c.character || "") as string,
        type: (c.media_type || "movie") as "movie" | "tv",
        posterPath: c.poster_path
          ? `${IMAGE_BASE}/${POSTER_SIZE}${c.poster_path}`
          : null,
        releaseDate: (c.release_date || c.first_air_date || "") as string,
        voteAverage: (c.vote_average || 0) as number,
        popularity: (c.popularity || 0) as number,
      })),
    ]
      .filter((c) => c.posterPath)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 30);

    const person = {
      id: data.id,
      name: data.name,
      biography: data.biography || "",
      birthday: data.birthday || null,
      deathday: data.deathday || null,
      placeOfBirth: data.place_of_birth || null,
      profilePath,
      knownForDepartment: data.known_for_department || null,
      imdbId: data.external_ids?.imdb_id || null,
      credits,
    };

    return NextResponse.json(person);
  } catch (error) {
    console.error("TMDB person error:", error);
    return NextResponse.json({ error: "Kişi bilgileri alınamadı." }, { status: 500 });
  }
}
