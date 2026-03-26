'use client';

import Image from 'next/image';
import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';

import type { AnimeWork } from '@/types';
import { cn, getProxiedImageUrl } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

export interface PosterCardProps {
  anime: AnimeWork;
  onClick?: (anime: AnimeWork) => void;
  onEditClick?: (anime: AnimeWork) => void;
  showEditButton?: boolean;
  isLoading?: boolean;
  className?: string;
  ratingColorOverride?: string;
  layout?: 'grid' | 'list';
}

const DEFAULT_RATING_COLORS: Record<string, string> = {
  SSR: '#ff3b8d',
  SR: '#f97316',
  S: '#eab308',
  'A+': '#22d3ee',
  A: '#06b6d4',
  'B+': '#3b82f6',
  B: '#6366f1',
  C: '#8b5cf6',
  D: '#64748b',
};

function getSeasonLabel(season?: string): string {
  switch (season) {
    case 'spring':
      return '春季';
    case 'summer':
      return '夏季';
    case 'autumn':
      return '秋季';
    case 'winter':
      return '冬季';
    default:
      return '未知季';
  }
}

export const PosterCard = memo(function PosterCard({
  anime,
  onClick,
  onEditClick,
  showEditButton = false,
  isLoading = false,
  className,
  ratingColorOverride,
  layout = 'grid',
}: PosterCardProps) {
  const { favorites, toggleFavorite, optionsData } = useAppStore();
  const isFavorite = favorites.includes(anime.id);

  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const ratingColor = useMemo(() => {
    if (ratingColorOverride) return ratingColorOverride;

    const fromStore = optionsData.rating?.find((item) => item.value === anime.rating)?.color;
    if (fromStore) return fromStore;

    return DEFAULT_RATING_COLORS[anime.rating ?? ''] ?? '#00ffff';
  }, [anime.rating, optionsData.rating, ratingColorOverride]);

  const cover = getProxiedImageUrl(anime.coverImage || anime.poster_url) || '/fallback.jpg';

  const episodeText = useMemo(() => {
    const total = anime.episodes?.toString().trim();
    if (!total || total === '0' || total === 'null') return '未知集數';
    return `共 ${total.replace('集', '')} 集`;
  }, [anime.episodes]);

  if (isLoading) {
    return (
      <div className={cn('animate-pulse rounded-xl border border-white/10 bg-cyber-grid/20', layout === 'list' ? 'h-24 w-full' : 'w-full')}>
        <div className={cn(layout === 'list' ? 'h-full w-full' : 'aspect-[2/3] w-full')} />
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => onClick?.(anime)}
        className={cn(
          'group relative flex w-full items-center gap-3 rounded-xl border border-cyan-400/20 bg-cyber-dark/40 p-2 text-left',
          'shadow-[0_0_18px_rgba(0,255,255,0.08)] transition-colors hover:border-cyan-400/50 hover:bg-cyber-dark/60',
          className,
        )}
      >
        <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-md border border-cyan-300/30">
          <Image src={cover} alt={anime.title} fill sizes="56px" className="object-cover" unoptimized />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            {anime.rating ? (
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-black text-white"
                style={{ backgroundColor: `${ratingColor}D9` }}
              >
                {anime.rating}
              </span>
            ) : null}
            <h3 className="truncate font-orbitron text-sm font-bold text-cyber-cyan group-hover:text-white">{anime.title}</h3>
          </div>

          <p className="text-xs text-white/75">{episodeText}</p>
          <p className="mt-1 text-[11px] text-white/50">
            {anime.year ?? '----'} · {getSeasonLabel(anime.season)}
          </p>
        </div>

        <button
          className="rounded-full border border-white/10 bg-black/30 p-1.5 text-white/70 transition hover:scale-110"
          onClick={(event) => {
            event.stopPropagation();
            toggleFavorite(anime.id);
          }}
          aria-label={isFavorite ? '取消收藏' : '加入收藏'}
        >
          <Heart className={cn('h-4 w-4', isFavorite && 'fill-current text-rose-500')} />
        </button>

        {showEditButton && onEditClick ? (
          <button
            className="absolute bottom-2 right-10 rounded-md border border-cyan-300/50 bg-cyan-400/10 px-2 py-0.5 text-[10px] text-cyan-200"
            onClick={(event) => {
              event.stopPropagation();
              onEditClick(anime);
            }}
          >
            Edit
          </button>
        ) : null}
      </motion.button>
    );
  }

  return (
    <motion.div
      className={cn('group relative', className)}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        setTilt({ x: (0.5 - py) * 8, y: (px - 0.5) * 10 });
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{ perspective: '900px' }}
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onClick?.(anime)}
        className={cn(
          'relative w-full overflow-hidden rounded-xl border-2 text-left',
          'shadow-[0_0_24px_rgba(0,255,255,0.15)] transition-all duration-300',
        )}
        style={{
          borderColor: `${ratingColor}D9`,
          boxShadow: `0 0 18px ${ratingColor}66, inset 0 0 32px rgba(0,0,0,0.35)`,
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        <div className="relative aspect-[2/3]">
          <Image
            src={cover}
            alt={anime.title}
            fill
            sizes="(max-width: 640px) 48vw, (max-width: 1024px) 24vw, 16vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-2">
            <div className="mb-1 flex items-center justify-between gap-2">
              {anime.rating ? (
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-black text-white"
                  style={{ backgroundColor: `${ratingColor}E6` }}
                >
                  {anime.rating}
                </span>
              ) : <span />}

              <div className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                <Star className="mr-1 inline-block h-3 w-3 fill-current" />
                {anime.recommendation || '--'}
              </div>
            </div>

            <h3 className="truncate font-orbitron text-sm font-bold text-cyan-200">{anime.title}</h3>
            <p className="mt-1 text-[11px] text-white/80">{episodeText}</p>
          </div>

          <button
            className="absolute right-2 top-2 z-20 rounded-full border border-white/10 bg-black/40 p-1.5 text-white/80 transition hover:scale-110"
            onClick={(event) => {
              event.stopPropagation();
              toggleFavorite(anime.id);
            }}
            aria-label={isFavorite ? '取消收藏' : '加入收藏'}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current text-rose-500')} />
          </button>

          {showEditButton && onEditClick ? (
            <button
              className="absolute bottom-2 right-2 z-20 rounded-md border border-cyan-300/50 bg-cyan-400/15 px-2 py-1 text-[10px] font-semibold text-cyan-200"
              onClick={(event) => {
                event.stopPropagation();
                onEditClick(anime);
              }}
            >
              Edit
            </button>
          ) : null}
        </div>
      </motion.button>
    </motion.div>
  );
});

PosterCard.displayName = 'PosterCard';

export default PosterCard;
