import { DEFAULT_SOURCES } from './default-sources';
import type { VideoSource } from './video-types';

export function getSourceById(id: string): VideoSource | undefined {
  return DEFAULT_SOURCES.find((source) => source.id === id);
}

export function getEnabledSources(): VideoSource[] {
  return DEFAULT_SOURCES.filter((source) => source.enabled !== false);
}

export function getAllSources(): VideoSource[] {
  return DEFAULT_SOURCES;
}
