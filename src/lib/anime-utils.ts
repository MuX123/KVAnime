import type { VideoItem } from './api/video-types';
import type { AnimeWork } from '@/types';

function mapTypeNameToCategory(typeName: string | undefined): 'anime' | 'manga' | 'movie' {
  if (!typeName) return 'anime';
  const t = typeName.toLowerCase();
  if (t.includes('漫畫') || t.includes('卡通') || t.includes('漫') || t.includes('comic') || t.includes('cartoon')) return 'manga';
  if (t.includes('動畫') || t.includes('anime') || t.includes('番')) return 'anime';
  return 'anime';
}

export function mapVideoItemToAnimeWork(video: VideoItem): AnimeWork {
  const sourceId = video.source || 'unknown';
  const vodId = String(video.vod_id);

  let year: number | undefined;
  if (video.vod_year) {
    const parsed = parseInt(String(video.vod_year), 10);
    if (!isNaN(parsed)) year = parsed;
  }

  return {
    id: `${sourceId}:${vodId}`,
    title: video.vod_name || '未知標題',
    coverImage: video.vod_pic || '',
    poster_url: video.vod_pic || '',
    year,
    season: '春季',
    month: undefined,
    episodes: '',
    rating: '普遍',
    recommendation: '★3',
    category: mapTypeNameToCategory(video.type_name),
    genres: [],
    extra_data: {
      vod_id: vodId,
      vod_year: video.vod_year,
      vod_area: video.vod_area,
      vod_actor: video.vod_actor,
      vod_director: video.vod_director,
      vod_lang: video.vod_lang,
      vod_remarks: video.vod_remarks,
      vod_time: video.vod_time,
      type_name: video.type_name,
      source: sourceId,
      vod_content: video.vod_content,
    },
    current_episode: video.vod_remarks,
  };
}
