'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';

import type { AnimeWork, GridLayout } from '@/types';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

import { PosterCard } from './PosterCard';

interface PosterWallProps {
  animeList: AnimeWork[];
  onAnimeClick: (anime: AnimeWork) => void;
  onEditClick?: (anime: AnimeWork) => void;
  showEditButton?: boolean;
  gridLayout: GridLayout;
}

const SEASON_LABEL_MAP: Record<string, '春季' | '夏季' | '秋季' | '冬季'> = {
  spring: '春季',
  summer: '夏季',
  autumn: '秋季',
  winter: '冬季',
};

const SEASON_ORDER: Array<'春季' | '夏季' | '秋季' | '冬季'> = ['春季', '夏季', '秋季', '冬季'];

const RATING_COLOR_MAP: Record<string, string> = {
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

function resolveSeason(item: AnimeWork): '春季' | '夏季' | '秋季' | '冬季' {
  if (item.season && SEASON_LABEL_MAP[item.season]) {
    return SEASON_LABEL_MAP[item.season];
  }

  const month = Number(item.month);
  if ([3, 4, 5].includes(month)) return '春季';
  if ([6, 7, 8].includes(month)) return '夏季';
  if ([9, 10, 11].includes(month)) return '秋季';
  return '冬季';
}

function getGridClass(layout: GridLayout): string {
  if (layout === 'list') {
    return 'grid grid-cols-1 gap-3';
  }

  if (layout === 'compact') {
    return 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
  }

  return 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
}

function getPageSize(layout: GridLayout): number {
  if (layout === 'list') return 8;
  if (layout === 'compact') return 18;
  return 12;
}

export function PosterWall({
  animeList,
  onAnimeClick,
  onEditClick,
  showEditButton = false,
  gridLayout,
}: PosterWallProps) {
  const { optionsData } = useAppStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [pages, setPages] = useState<Record<string, number>>({});

  const ratingColorMap = useMemo(() => {
    const map: Record<string, string> = { ...RATING_COLOR_MAP };
    optionsData.rating?.forEach((item) => {
      if (item.value && item.color) map[item.value] = item.color;
    });
    return map;
  }, [optionsData.rating]);

  const sections = useMemo(() => {
    const grouped = new Map<number, Map<'春季' | '夏季' | '秋季' | '冬季', AnimeWork[]>>();

    animeList.forEach((anime) => {
      const year = typeof anime.year === 'number' ? anime.year : 0;
      const season = resolveSeason(anime);

      if (!grouped.has(year)) {
        grouped.set(
          year,
          new Map([
            ['春季', []],
            ['夏季', []],
            ['秋季', []],
            ['冬季', []],
          ]),
        );
      }

      grouped.get(year)?.get(season)?.push(anime);
    });

    const years = Array.from(grouped.keys()).sort((a, b) => b - a);
    return years.map((year) => {
      const seasonMap = grouped.get(year)!;
      const seasonGroups = SEASON_ORDER.map((season) => ({
        season,
        items: (seasonMap.get(season) ?? []).sort((a, b) => {
          const ma = Number(a.month) || 0;
          const mb = Number(b.month) || 0;
          return mb - ma;
        }),
      })).filter((group) => group.items.length > 0);

      return { year, seasonGroups };
    });
  }, [animeList]);

  if (animeList.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-white/10 bg-cyber-dark/20">
        <p className="font-orbitron text-cyber-cyan/70">沒有可顯示的作品</p>
      </div>
    );
  }

  const gridClass = getGridClass(gridLayout);
  const pageSize = getPageSize(gridLayout);

  return (
    <div className="space-y-4">
      {sections.map(({ year, seasonGroups }) => (
        <section key={year} className="rounded-xl border border-cyan-500/20 bg-cyber-dark/20">
          <div className="border-b border-cyan-500/20 px-4 py-3">
            <h2 className="font-orbitron text-xl font-black text-cyan-300">{year} 年</h2>
          </div>

          <div className="space-y-3 p-3 sm:p-4">
            {seasonGroups.map(({ season, items }) => {
              const key = `${year}-${season}`;
              const isExpanded = expanded[key] ?? true;
              const page = pages[key] ?? 1;
              const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
              const pageItems = items.slice((page - 1) * pageSize, page * pageSize);

              return (
                <div key={key} className="overflow-hidden rounded-lg border border-white/10 bg-black/20">
                  <button
                    className={cn(
                      'flex w-full items-center justify-between px-3 py-2 text-left transition-colors',
                      'hover:bg-cyan-500/10',
                    )}
                    onClick={() => {
                      setExpanded((prev) => ({ ...prev, [key]: !isExpanded }));
                      setPages((prev) => ({ ...prev, [key]: 1 }));
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded border border-cyan-400/40 bg-cyan-400/10 text-cyan-300">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </span>
                      <span className="font-orbitron text-sm font-bold text-cyan-200">{season}</span>
                    </div>

                    <span className="rounded border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-white/75">
                      {items.length} 部
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-white/10 p-3"
                      >
                        <div className={gridClass}>
                          {pageItems.map((anime) => (
                            <PosterCard
                              key={anime.id}
                              anime={anime}
                              onClick={onAnimeClick}
                              onEditClick={onEditClick}
                              showEditButton={showEditButton}
                              ratingColorOverride={anime.rating ? ratingColorMap[anime.rating] : undefined}
                              layout={gridLayout === 'list' ? 'list' : 'grid'}
                            />
                          ))}
                        </div>

                        {totalPages > 1 ? (
                          <div className="mt-4 flex items-center justify-center gap-3 border-t border-white/10 pt-3">
                            <button
                              className="rounded border border-white/15 bg-cyber-dark/40 px-3 py-1 text-xs text-white/80 transition hover:border-cyan-300/50 disabled:cursor-not-allowed disabled:opacity-40"
                              disabled={page <= 1}
                              onClick={() => setPages((prev) => ({ ...prev, [key]: Math.max(1, page - 1) }))}
                            >
                              上一頁
                            </button>
                            <span className="font-orbitron text-xs text-cyan-200">
                              {page} / {totalPages}
                            </span>
                            <button
                              className="rounded border border-white/15 bg-cyber-dark/40 px-3 py-1 text-xs text-white/80 transition hover:border-cyan-300/50 disabled:cursor-not-allowed disabled:opacity-40"
                              disabled={page >= totalPages}
                              onClick={() => setPages((prev) => ({ ...prev, [key]: Math.min(totalPages, page + 1) }))}
                            >
                              下一頁
                            </button>
                          </div>
                        ) : null}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export default PosterWall;
