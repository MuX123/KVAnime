export interface AnimeWork {
  id: string;
  title: string;
  coverImage?: string;
  poster_url?: string;
  rating?: string;
  recommendation?: string;
  season?: string;
  year?: number;
  month?: number;
  episodes?: string;
  current_episode?: string;
  youtube_playlist_url?: string;
  category?: 'anime' | 'manga' | 'movie';
  genres?: string[];
  extra_data?: Record<string, unknown>;
}

export interface OptionsData {
  rating?: Array<{ value: string; color: string }>;
  recommendation?: Array<{ value: string; color: string }>;
  category_colors?: {
    rating?: string;
    recommendation?: string;
  };
}

export type GridLayout = 'grid' | 'list' | 'compact';
