/**
 * HTTP Utilities for API calls
 * Handles timeouts and retries
 * 
 * SECURITY NOTE: 
 * SSL verification is disabled by default for video source APIs because many
 * Chinese video hosting sites use self-signed or invalid SSL certificates.
 * 
 * To enable strict SSL verification, set environment variable:
 *   STRICT_SSL=true
 * 
 * WARNING: Enabling strict SSL may cause requests to fail for sites with invalid certs.
 */

// Rate Limiting and Caching Configuration
const REQUEST_TIMEOUT = 15000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const RATE_LIMIT_DELAY = 250;
const CACHE_TTL_DEFAULT = 1000 * 60 * 30; // 預設 30 分鐘
const CACHE_TTL_DETAIL = 1000 * 60 * 60 * 12; // 詳情資訊快取 12 小時

// Disable SSL verification by default (for Chinese video APIs with bad certs)
// Set STRICT_SSL=true environment variable to enable strict verification
const strictSSL = process.env.STRICT_SSL === 'true';

if (!strictSSL) {
    // This is needed for Chinese video APIs with invalid SSL certificates
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// User Agent Rotation Pool
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36'
];

function getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Simple In-Memory Rate Limiter
class RateLimiter {
    private lastRequestTime: Map<string, number> = new Map();

    async throttle(url: string): Promise<void> {
        try {
            const domain = new URL(url).hostname;
            const now = Date.now();
            const lastTime = this.lastRequestTime.get(domain) || 0;
            const timeSinceLast = now - lastTime;

            if (timeSinceLast < RATE_LIMIT_DELAY) {
                const delay = RATE_LIMIT_DELAY - timeSinceLast;
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            this.lastRequestTime.set(domain, Date.now());
        } catch (e) {
            // Ignore URL parsing errors
        }
    }
}

const rateLimiter = new RateLimiter();

// Simple In-Memory Cache
interface CacheEntry {
    data: any;
    timestamp: number;
    contentType: string | null;
}

class RequestCache {
    private cache: Map<string, CacheEntry> = new Map();

    get(key: string): CacheEntry | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // 根據 URL 類型判斷過期時間
        const isDetail = key.includes('ac=detail') || key.includes('ids=');
        const ttl = isDetail ? CACHE_TTL_DETAIL : CACHE_TTL_DEFAULT;

        if (Date.now() - entry.timestamp > ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry;
    }

    set(key: string, data: any, contentType: string | null) {
        // Simple garbage collection: if cache is too big, clear half
        if (this.cache.size > 1000) {
            const keysToDelete = Array.from(this.cache.keys()).slice(0, 500);
            keysToDelete.forEach(k => this.cache.delete(k));
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            contentType
        });
    }
}

const requestCache = new RequestCache();

/**
 * Fetch with timeout, retry, rate limiting, and caching support
 */
export async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
    // 1. Check Cache for GET requests
    const isGet = !options.method || options.method === 'GET';
    if (isGet) {
        const cached = requestCache.get(url);
        if (cached) {
            console.log(`[Cache Hit] ${url}`);
            // Return a new Response object with cached data
            return new Response(cached.data, {
                status: 200,
                statusText: 'OK (Cached)',
                headers: { 'Content-Type': cached.contentType || 'application/json' }
            });
        }
    }

    // 2. Throttle Request
    await rateLimiter.throttle(url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        // 3. Set standard User-Agent if not present
        const headers = new Headers(options.headers);
        if (!headers.has('User-Agent')) {
            headers.set('User-Agent', getRandomUserAgent());
        }

        // 4. Perform Request
        const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        // 5. Cache Response if successful and GET
        if (isGet && response.ok) {
            const clone = response.clone();
            const contentType = clone.headers.get('Content-Type');
            // We cache the text/json content
            const text = await clone.text();
            requestCache.set(url, text, contentType);
        }

        return response;

    } catch (error: any) {
        clearTimeout(timeoutId);
        // Enhance error message
        if (error.name === 'AbortError') {
            throw new Error(`Request timeout after ${timeout}ms: ${url}`);
        }
        throw error;
    }
}

/**
 * Retry logic wrapper
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    retries: number = MAX_RETRIES
): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            // Don't retry if it's a 404
            if (error instanceof Error && error.message.includes('404')) {
                throw error;
            }

            if (i < retries) {
                const delay = RETRY_DELAY * Math.pow(2, i); // Exponential backoff
                console.warn(`[Retry ${i + 1}/${retries}] Waiting ${delay}ms... Error: ${lastError.message}`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}
