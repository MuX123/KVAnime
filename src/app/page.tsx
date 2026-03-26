'use client';

import { useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useSourceLoader } from '@/hooks/useSourceLoader';
import { PosterWall } from '@/components/features/poster/PosterWall';
import type { AnimeWork } from '@/types';

export default function HomePage() {
  const { animeData } = useAppStore();
  const { isLoading, totalFound, reload } = useSourceLoader();
  const [selectedAnime, setSelectedAnime] = useState<AnimeWork | null>(null);

  const animeList = useMemo(() => animeData, [animeData]);

  const handleAnimeClick = (anime: AnimeWork) => {
    setSelectedAnime(anime);
  };

  if (isLoading && animeData.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-500/30 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-cyan-400 font-orbitron text-sm">
          載入動畫資料中...
        </p>
        <p className="text-white/40 text-xs mt-2">
          已發現 {totalFound} 部作品
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold" style={{ 
              color: 'var(--neon-cyan)', 
              textShadow: '0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan)'
            }}>
              KVAnime
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-white/60 text-sm">
                {animeData.length} 部作品
              </span>
              <button
                onClick={() => reload()}
                className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all"
                style={{
                  background: 'rgba(0, 255, 255, 0.1)',
                  border: '1px solid rgba(0, 255, 255, 0.3)',
                  color: 'var(--neon-cyan)'
                }}
              >
                重新整理
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {animeList.length === 0 && !isLoading ? (
          <div className="text-center py-20">
            <p className="text-white/60 text-lg">暫無動畫資料</p>
            <button
              onClick={() => reload()}
              className="mt-4 px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: 'rgba(0, 255, 255, 0.1)',
                border: '1px solid rgba(0, 255, 255, 0.3)',
                color: 'var(--neon-cyan)'
              }}
            >
              重新載入
            </button>
          </div>
        ) : (
          <PosterWall
            animeList={animeList}
            onAnimeClick={handleAnimeClick}
            gridLayout="grid"
          />
        )}
      </main>

      {/* Detail Modal */}
      {selectedAnime && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedAnime(null)}
        >
          <div 
            className="rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            style={{
              background: 'rgba(15, 21, 37, 0.95)',
              border: '1px solid rgba(0, 255, 255, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video bg-black/50">
              {selectedAnime.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedAnime.coverImage}
                  alt={selectedAnime.title}
                  className="w-full h-full object-cover opacity-50"
                />
              )}
              <button
                onClick={() => setSelectedAnime(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white"
                style={{ background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-2">
                {selectedAnime.title}
              </h2>
              {selectedAnime.rating && (
                <span 
                  className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-4"
                  style={{
                    background: 'rgba(0, 255, 255, 0.1)',
                    border: '1px solid rgba(0, 255, 255, 0.3)',
                    color: 'var(--neon-cyan)'
                  }}
                >
                  {selectedAnime.rating}
                </span>
              )}
              <div className="mt-4 text-white/70 text-sm space-y-2">
                {selectedAnime.year && (
                  <p>年份: {selectedAnime.year}</p>
                )}
                {selectedAnime.season && (
                  <p>季節: {selectedAnime.season}</p>
                )}
                {selectedAnime.episodes && (
                  <p>集數: {selectedAnime.episodes}</p>
                )}
                {selectedAnime.genres && selectedAnime.genres.length > 0 && (
                  <p>類型: {selectedAnime.genres.join(', ')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
