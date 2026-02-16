export type MediaType = "movie" | "tv";

/** Watchlist - content not yet watched */
export interface WatchlistItem {
  id: string;
  tmdbId: number;
  title: string;
  type: MediaType;
  posterPath: string | null;
  releaseYear: string;
  addedAt: string; // ISO date
}

/** Episode ratings: key "S1E5" (Season 1 Episode 5), value 1-5 stars */
export interface WatchedItem {
  id: string;
  tmdbId: number;
  title: string;
  type: MediaType;
  posterPath: string | null;
  releaseYear: string;
  watchedAt: string; // ISO date
  rating?: number;
  notes?: string;
  isFavorite?: boolean;
  /** TV only: Episode ratings, key "S1E5" */
  episodeRatings?: Record<string, number>;
  /** Movie: total min, TV: episode runtime (min) */
  runtime?: number | null;
  /** TV only: Watch status. "completed" = finished, "dropped" = dropped */
  watchingStatus?: "watching" | "completed" | "dropped";
  /** Movie: watched duration (seconds) - how much was watched for dropped movies */
  watchedProgressSeconds?: number | null;
  /** TV only: watched episodes, key "S1E5" = true */
  watchedEpisodes?: Record<string, boolean>;
  /** Origin country codes, e.g. "KR" for Korean */
  originCountry?: string;
}

export interface TMDBMovieResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  vote_average?: number;
}

export interface TMDBTVResult {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date?: string;
  vote_average?: number;
}
