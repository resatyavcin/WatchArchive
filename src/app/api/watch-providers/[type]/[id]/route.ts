import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w92";

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
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country") || "TR";

  if (!["movie", "tv"].includes(type) || !id) {
    return NextResponse.json({ error: "Geçersiz parametre." }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${TMDB_BASE}/${type}/${id}/watch/providers?api_key=${apiKey}`,
      { next: { revalidate: 86400 } }
    );
    const data = await res.json();

    if (data.status_code === 34 || !data.results) {
      return NextResponse.json({ flatrate: [], rent: [], buy: [], link: null });
    }

    const countryData = data.results[country] || data.results["US"] || {};
    const flatrate = (countryData.flatrate || []).map(
      (p: { logo_path: string | null; provider_name: string; provider_id: number }) => ({
        id: p.provider_id,
        name: p.provider_name,
        logoPath: p.logo_path
          ? `${IMAGE_BASE}${p.logo_path.startsWith("/") ? p.logo_path : `/${p.logo_path}`}`
          : null,
      })
    );
    const rent = (countryData.rent || []).map(
      (p: { logo_path: string | null; provider_name: string; provider_id: number }) => ({
        id: p.provider_id,
        name: p.provider_name,
        logoPath: p.logo_path
          ? `${IMAGE_BASE}${p.logo_path.startsWith("/") ? p.logo_path : `/${p.logo_path}`}`
          : null,
      })
    );
    const buy = (countryData.buy || []).map(
      (p: { logo_path: string | null; provider_name: string; provider_id: number }) => ({
        id: p.provider_id,
        name: p.provider_name,
        logoPath: p.logo_path
          ? `${IMAGE_BASE}${p.logo_path.startsWith("/") ? p.logo_path : `/${p.logo_path}`}`
          : null,
      })
    );

    return NextResponse.json({
      flatrate,
      rent,
      buy,
      link: countryData.link || null,
    });
  } catch (error) {
    console.error("Watch providers error:", error);
    return NextResponse.json(
      { error: "Nerden izlenir bilgisi alınamadı." },
      { status: 500 }
    );
  }
}
