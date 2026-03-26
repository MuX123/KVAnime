import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AnimeWork, GridLayout, OptionsData } from '../types';

interface AppState {
  animeData: AnimeWork[];
  favorites: string[];
  optionsData: OptionsData;
  gridLayout: GridLayout;

  setAnimeData: (animeData: AnimeWork[]) => void;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setOptionsData: (optionsData: OptionsData) => void;
  setGridLayout: (gridLayout: GridLayout) => void;
}

const defaultOptionsData: OptionsData = {};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      animeData: [],
      favorites: [],
      optionsData: defaultOptionsData,
      gridLayout: 'grid',

      setAnimeData: (animeData) => set({ animeData }),

      addFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id) ? state.favorites : [...state.favorites, id],
        })),

      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((favoriteId) => favoriteId !== id),
        })),

      toggleFavorite: (id) => {
        const isFavorite = get().favorites.includes(id);
        if (isFavorite) {
          get().removeFavorite(id);
          return;
        }
        get().addFavorite(id);
      },

      setOptionsData: (optionsData) => set({ optionsData }),

      setGridLayout: (gridLayout) => set({ gridLayout }),
    }),
    {
      name: 'kvanime-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favorites: state.favorites,
      }),
    }
  )
);
