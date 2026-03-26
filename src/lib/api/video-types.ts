export interface VideoSource {
  id: string;
  name: string;
  type: 'cms' | 'cms-direct' | 'youtube';
  enabled?: boolean;
  priority?: number;
  group?: string;
  baseUrl: string;
  searchPath: string;
  detailPath?: string;
  headers?: Record<string, string>;
}

export interface VideoItem {
  source: string;
  vod_id: string;
  vod_name: string;
  vod_pic?: string;
  vod_remarks?: string;
  vod_year?: string;
  vod_area?: string;
  type_name?: string;
  vod_content?: string;
  vod_actor?: string;
  vod_director?: string;
  vod_lang?: string;
  vod_time?: string;
}
