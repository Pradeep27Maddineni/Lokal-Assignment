export interface ImageSource {
  quality: string;
  link: string;
}

export interface DownloadUrl {
  quality: string;
  link: string;
}

export interface Song {
  id: string;
  name: string;
  type: string;
  album: {
    id: string;
    name: string;
    url: string;
  };
  year: string;
  releaseDate: string | null;
  duration: string; // in seconds
  label: string;
  primaryArtists: string;
  primaryArtistsId: string;
  featuredArtists: string;
  featuredArtistsId: string;
  explicitContent: number;
  playCount: string;
  language: string;
  hasLyrics: string;
  url: string;
  copyright: string;
  image: ImageSource[];
  downloadUrl: DownloadUrl[];
}

export interface SearchResponse<T> {
  status: 'SUCCESS' | 'FAILED';
  data: {
    results: T[];
    total: number;
    start: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
