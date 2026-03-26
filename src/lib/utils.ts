type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const pushValue = (value: ClassValue): void => {
    if (!value) return;

    if (typeof value === 'string' || typeof value === 'number') {
      classes.push(String(value));
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(pushValue);
      return;
    }

    Object.entries(value).forEach(([key, enabled]) => {
      if (enabled) classes.push(key);
    });
  };

  inputs.forEach(pushValue);
  return classes.join(' ');
}

export function ensureHttps(url?: string): string {
  if (!url) return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith('http://')) {
    return `https://${trimmed.slice('http://'.length)}`;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function getProxiedImageUrl(url?: string): string {
  const normalized = ensureHttps(url);
  if (!normalized) return '';

  if (
    normalized.startsWith('data:') ||
    normalized.startsWith('blob:') ||
    normalized.includes('images.weserv.nl/?url=')
  ) {
    return normalized;
  }

  const raw = normalized.replace(/^https?:\/\//i, '');
  return `https://images.weserv.nl/?url=${encodeURIComponent(raw)}`;
}
