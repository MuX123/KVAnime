import { NextRequest, NextResponse } from 'next/server';
import { fetchWithTimeout } from '@/lib/video-http-utils';
import { DEFAULT_SOURCES } from '@/lib/api/default-sources';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const CMS_CATEGORIES = [
  { type_id: 1, type_name: '电影片' },
  { type_id: 2, type_name: '连续剧' },
  { type_id: 3, type_name: '综艺片' },
  { type_id: 4, type_name: '动漫片' },
  { type_id: 6, type_name: '动作片' },
  { type_id: 7, type_name: '喜剧片' },
  { type_id: 8, type_name: '爱情片' },
  { type_id: 9, type_name: '科幻片' },
  { type_id: 10, type_name: '恐怖片' },
  { type_id: 11, type_name: '剧情片' },
  { type_id: 12, type_name: '战争片' },
];

const categoryMap = new Map(CMS_CATEGORIES.map(c => [c.type_id, c.type_name]));

async function searchCMS(query: string, source: any): Promise<any[]> {
  const url = new URL(`${source.baseUrl}${source.searchPath}`);
  url.searchParams.set('ac', 'detail');
  url.searchParams.set('wd', query);
  url.searchParams.set('pg', '1');

  try {
    const response = await fetchWithTimeout(url.toString(), {
      method: 'GET',
      headers: source.headers,
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (data.code !== 1 && data.code !== 0) return [];

    return (data.list || []).map((item: any) => ({
      ...item,
      source: source.id,
      type_name: categoryMap.get(item.type_id) || '',
    }));
  } catch (e) {
    console.error(`Search failed for ${source.id}:`, e);
    return [];
  }
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const safeEnqueue = (data: Uint8Array) => {
        if (closed) return;
        try { controller.enqueue(data); } catch (_) { }
      };
      const safeClose = () => {
        if (closed) return;
        closed = true;
        try { controller.close(); } catch (_) { }
      };

      try {
        const body = await request.json();
        const { query, sources: sourceConfigs } = body;

        const sources = Array.isArray(sourceConfigs) && sourceConfigs.length > 0
          ? sourceConfigs
          : DEFAULT_SOURCES.filter(s => s.enabled && s.type !== 'youtube');

        if (!query || query.trim() === '') {
          safeEnqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Query required' })}\n\n`));
          safeClose();
          return;
        }

        safeEnqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start', totalSources: sources.length })}\n\n`));

        const results = await Promise.all(
          sources.map(source => searchCMS(query, source))
        );

        const allVideos: any[] = [];
        const seenIds = new Set<string>();
        let totalVideosFound = 0;

        for (const videos of results) {
          for (const video of videos) {
            const key = `${video.source}:${video.vod_id}`;
            if (!seenIds.has(key)) {
              seenIds.add(key);
              allVideos.push(video);
              totalVideosFound++;
            }
          }
        }

        if (allVideos.length > 0) {
          safeEnqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'videos',
            videos: allVideos,
            source: sources.map((s: any) => s.id).join(','),
          })}\n\n`));
        }

        safeEnqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'complete',
          totalVideosFound,
          totalSources: sources.length,
        })}\n\n`));

        safeClose();
      } catch (error) {
        console.error('Search error:', error);
        safeEnqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Search failed' })}\n\n`));
        safeClose();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}