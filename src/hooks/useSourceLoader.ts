import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { mapVideoItemToAnimeWork } from '@/lib/anime-utils';
import type { VideoItem } from '@/lib/api/video-types';

interface SourceLoaderResult {
  isLoading: boolean;
  progress: number;
  totalFound: number;
  completedSources: number;
  totalSources: number;
  error: string | null;
  reload: () => void;
}

type StreamEvent =
  | { type: 'start'; totalSources?: number }
  | { type: 'videos'; videos?: VideoItem[] }
  | { type: 'progress'; completedSources?: number; totalSources?: number; progress?: number }
  | { type: 'complete' }
  | { type: 'error'; message?: string };

export function useSourceLoader(): SourceLoaderResult {
  const setAnimeData = useAppStore((s) => s.setAnimeData);
  const setAnimeDataRef = useRef(setAnimeData);
  setAnimeDataRef.current = setAnimeData;

  const abortRef = useRef<AbortController | null>(null);
  const accumulatedRef = useRef<Map<string, ReturnType<typeof mapVideoItemToAnimeWork>>>(new Map());
  const rafIdRef = useRef<number | null>(null);

  const [state, setState] = useState<Omit<SourceLoaderResult, 'reload'>>({
    isLoading: true,
    progress: 0,
    totalFound: 0,
    completedSources: 0,
    totalSources: 0,
    error: null,
  });

  const flushData = useCallback(() => {
    const items = Array.from(accumulatedRef.current.values());
    setAnimeDataRef.current(items);
    setState(s => ({ ...s, totalFound: items.length }));
  }, []);

  const scheduleFlush = useCallback(() => {
    if (rafIdRef.current !== null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      flushData();
    });
  }, [flushData]);

  const fetchFromCMS = useCallback(async (signal: AbortSignal) => {
    const response = await fetch('/api/search-parallel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '日' }),
      signal,
    });

    if (!response.ok) throw new Error('Stream failed');

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No stream');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done || signal.aborted) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const data: StreamEvent = JSON.parse(line.slice(6));

          if (data.type === 'start') {
            setState(s => ({ ...s, totalSources: data.totalSources || 0 }));
          } else if (data.type === 'videos') {
            for (const v of (data.videos || [])) {
              const mapped = mapVideoItemToAnimeWork(v);
              if (!accumulatedRef.current.has(mapped.id)) {
                accumulatedRef.current.set(mapped.id, mapped);
              }
            }
            scheduleFlush();
          } else if (data.type === 'progress') {
            setState(s => ({
              ...s,
              completedSources: data.completedSources || s.completedSources,
              progress: data.progress || Math.round(((data.completedSources || 0) / (data.totalSources || 1)) * 100)
            }));
          } else if (data.type === 'complete') {
            if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
            flushData();
            setState(s => ({ ...s, isLoading: false, progress: 100 }));
          } else if (data.type === 'error') {
            throw new Error(data.message);
          }
        } catch {}
      }
    }
  }, [flushData, scheduleFlush]);

  const start = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    accumulatedRef.current.clear();

    abortRef.current = new AbortController();
    setState({ isLoading: true, progress: 0, totalFound: 0, completedSources: 0, totalSources: 0, error: null });

    fetchFromCMS(abortRef.current.signal).catch(err => {
      if (err.name === 'AbortError') return;
      setState(s => ({ ...s, isLoading: false, error: err.message }));
    });
  }, [fetchFromCMS]);

  useEffect(() => {
    start();
    return () => {
      abortRef.current?.abort();
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [start]);

  return { ...state, reload: start };
}
