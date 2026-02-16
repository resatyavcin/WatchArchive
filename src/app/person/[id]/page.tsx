"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Film, Tv, Star, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollRow } from "@/components/ScrollRow";
import { ImageLightbox } from "@/components/ImageLightbox";
import { useLightbox } from "@/hooks/useLightbox";
import { cachedFetch, CACHE_TTL } from "@/lib/api-cache";

interface PersonCredit {
  id: number;
  title: string;
  character: string;
  type: "movie" | "tv";
  posterPath: string | null;
  releaseDate: string;
  voteAverage: number;
  popularity: number;
}

interface Person {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  profilePath: string | null;
  knownForDepartment: string | null;
  imdbId: string | null;
  credits: PersonCredit[];
}

export default function PersonPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const lightbox = useLightbox();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchPerson = async () => {
      try {
        const { data, ok } = await cachedFetch<Person | { error?: string }>(
          `/api/person/${id}`,
          CACHE_TTL.long
        );
        if (cancelled) return;
        if (!ok) {
          setError((data as { error?: string })?.error || "Yüklenemedi");
          return;
        }
        setPerson(data as Person);
      } catch {
        if (!cancelled) setError("Yüklenemedi");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPerson();
    return () => { cancelled = true; };
  }, [id]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const calcAge = (birthday: string | null, deathday: string | null) => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--;
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 sm:px-6 py-2.5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-6 w-40" />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
          <div className="flex flex-col sm:flex-row gap-6">
            <Skeleton className="w-40 sm:w-48 aspect-[2/3] rounded-xl mx-auto sm:mx-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">{error || "Kişi bulunamadı."}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Geri dön
        </Button>
      </div>
    );
  }

  const age = calcAge(person.birthday, person.deathday);
  const movieCredits = person.credits.filter((c) => c.type === "movie");
  const tvCredits = person.credits.filter((c) => c.type === "tv");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold truncate">{person.name}</h1>
            {person.imdbId && (
              <Button variant="outline" size="sm" asChild className="ml-auto">
                <a
                  href={`https://www.imdb.com/name/${person.imdbId}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-1.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  IMDB
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <div className="w-40 sm:w-48 flex-shrink-0 mx-auto sm:mx-0">
            <button
              type="button"
              onClick={() => person.profilePath && lightbox.openLightbox()}
              className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-lg cursor-zoom-in"
            >
              {person.profilePath ? (
                <Image
                  src={person.profilePath}
                  alt={person.name}
                  width={192}
                  height={288}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl text-muted-foreground/50">?</span>
                </div>
              )}
            </button>
            {person.profilePath && (
              <ImageLightbox src={person.profilePath} alt={person.name} lightbox={lightbox} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              {person.name}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground mb-4">
              {person.knownForDepartment && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-500/15 text-blue-700 dark:bg-blue-500/25 dark:text-blue-300">
                  {person.knownForDepartment === "Acting" ? "Oyuncu" : person.knownForDepartment}
                </span>
              )}
              {person.birthday && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(person.birthday)}
                  {age != null && ` (${age})`}
                </span>
              )}
              {person.deathday && (
                <span className="text-destructive">
                  — {formatDate(person.deathday)}
                </span>
              )}
              {person.placeOfBirth && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {person.placeOfBirth}
                </span>
              )}
            </div>

            {person.biography && (
              <div className="relative">
                <p
                  className={`text-sm text-muted-foreground leading-relaxed ${
                    !bioExpanded ? "line-clamp-5" : ""
                  }`}
                >
                  {person.biography}
                </p>
                {person.biography.length > 300 && !bioExpanded && (
                  <button
                    type="button"
                    onClick={() => setBioExpanded(true)}
                    className="text-xs text-primary font-medium mt-1"
                  >
                    Devamını oku
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {movieCredits.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Film className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold">Filmler</h3>
              <span className="text-xs text-muted-foreground">({movieCredits.length})</span>
            </div>
            <ScrollRow>
              {movieCredits.map((c, i) => (
                <Link
                  key={`movie-${c.id}-${i}`}
                  href={`/add/movie/${c.id}`}
                  className="flex-shrink-0 w-[100px] sm:w-[120px] group"
                >
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted transition-transform group-hover:scale-[1.02] mb-1.5 relative">
                    {c.posterPath ? (
                      <Image
                        src={c.posterPath}
                        alt={c.title}
                        width={120}
                        height={180}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                    )}
                    {c.voteAverage > 0 && (
                      <span className="absolute bottom-1 left-1 flex items-center gap-0.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                        <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                        {c.voteAverage.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium truncate">{c.title}</p>
                  {c.character && (
                    <p className="text-[10px] text-muted-foreground truncate">{c.character}</p>
                  )}
                </Link>
              ))}
            </ScrollRow>
          </section>
        )}

        {tvCredits.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Tv className="h-4 w-4 text-green-500" />
              <h3 className="text-sm font-semibold">Diziler</h3>
              <span className="text-xs text-muted-foreground">({tvCredits.length})</span>
            </div>
            <ScrollRow>
              {tvCredits.map((c, i) => (
                <Link
                  key={`tv-${c.id}-${i}`}
                  href={`/add/tv/${c.id}`}
                  className="flex-shrink-0 w-[100px] sm:w-[120px] group"
                >
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted transition-transform group-hover:scale-[1.02] mb-1.5 relative">
                    {c.posterPath ? (
                      <Image
                        src={c.posterPath}
                        alt={c.title}
                        width={120}
                        height={180}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Tv className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                    )}
                    {c.voteAverage > 0 && (
                      <span className="absolute bottom-1 left-1 flex items-center gap-0.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                        <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                        {c.voteAverage.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium truncate">{c.title}</p>
                  {c.character && (
                    <p className="text-[10px] text-muted-foreground truncate">{c.character}</p>
                  )}
                </Link>
              ))}
            </ScrollRow>
          </section>
        )}
      </main>
    </div>
  );
}
