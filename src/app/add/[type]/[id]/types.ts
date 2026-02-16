export interface TMDBDetail {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseYear: string;
  voteAverage: number;
  runtime: number | null;
  genres: string[];
  type: string;
  imdbId: string | null;
  trailerKey: string | null;
  originCountry: string[];
}

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

export interface WatchProvider {
  id: number;
  name: string;
  logoPath: string | null;
}

export interface WatchProviders {
  flatrate: WatchProvider[];
  rent: WatchProvider[];
  buy: WatchProvider[];
  link: string | null;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
  order: number;
}
