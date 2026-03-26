import type { VideoSource } from './video-types';

/**
 * Default Headers - Required for proxy access
 */
const DEFAULT_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
};

/**
 * CMS Video Sources (same as ACGOS)
 * Using Cloudflare Workers proxy: https://anime2-proxy.3378930.workers.dev/proxy/{sourceId}
 */
export const DEFAULT_SOURCES: VideoSource[] = [
    {
        id: 'lzm3u8',
        name: '量子資源',
        baseUrl: 'https://anime2-proxy.3378930.workers.dev/proxy/lzm3u8',
        searchPath: '/api.php/provide/vod/from/lzm3u8/',
        detailPath: '/api.php/provide/vod/from/lzm3u8/',
        enabled: true,
        priority: 10,
        group: 'normal',
        type: 'cms',
        headers: DEFAULT_HEADERS
    },
    {
        id: 'ffm3u8',
        name: '非凡資源',
        baseUrl: 'https://anime2-proxy.3378930.workers.dev/proxy/ffm3u8',
        searchPath: '/api.php/provide/vod/from/ffm3u8/',
        detailPath: '/api.php/provide/vod/from/ffm3u8/',
        enabled: true,
        priority: 8,
        group: 'normal',
        type: 'cms',
        headers: DEFAULT_HEADERS
    },
    {
        id: 'sdm3u8',
        name: '閃電資源',
        baseUrl: 'https://anime2-proxy.3378930.workers.dev/proxy/sdm3u8',
        searchPath: '/api.php/provide/vod/from/sdm3u8/',
        detailPath: '/api.php/provide/vod/from/sdm3u8/',
        enabled: true,
        priority: 6,
        group: 'normal',
        type: 'cms',
        headers: DEFAULT_HEADERS
    },
    {
        id: 'jinying',
        name: '金鷹資源',
        baseUrl: 'https://anime2-proxy.3378930.workers.dev/proxy/jinying',
        searchPath: '/api.php/provide/vod/from/jinying/',
        detailPath: '/api.php/provide/vod/from/jinying/',
        enabled: true,
        priority: 5,
        group: 'normal',
        type: 'cms',
        headers: DEFAULT_HEADERS
    },
    {
        id: 'ikun',
        name: 'iKUN資源',
        baseUrl: 'https://anime2-proxy.3378930.workers.dev/proxy/ikun',
        searchPath: '/api.php/provide/vod/from/ikun/',
        detailPath: '/api.php/provide/vod/from/ikun/',
        enabled: true,
        priority: 4,
        group: 'normal',
        type: 'cms',
        headers: DEFAULT_HEADERS
    },
    {
        id: 'bfzy',
        name: '暴風資源',
        baseUrl: 'https://bfzyapi.com',
        searchPath: '/api.php/provide/vod/',
        detailPath: '/api.php/provide/vod/',
        enabled: true,
        priority: 11,
        group: 'new',
        type: 'cms-direct',
        headers: DEFAULT_HEADERS
    },
    {
        id: 'hongniuzy',
        name: '紅牛資源',
        baseUrl: 'https://www.hongniuzy2.com',
        searchPath: '/api.php/provide/vod/',
        detailPath: '/api.php/provide/vod/',
        enabled: true,
        priority: 12,
        group: 'new',
        type: 'cms-direct',
        headers: DEFAULT_HEADERS
    },
    {
        id: 'yinghua',
        name: '櫻花資源',
        baseUrl: 'https://m3u8.apiyhzy.com',
        searchPath: '/api.php/provide/vod/',
        detailPath: '/api.php/provide/vod/',
        enabled: true,
        priority: 13,
        group: 'new',
        type: 'cms-direct',
        headers: DEFAULT_HEADERS
    },
    {
        id: 'wolong',
        name: '臥龍資源',
        baseUrl: 'https://collect.wolongzyw.com',
        searchPath: '/api.php/provide/vod/',
        detailPath: '/api.php/provide/vod/',
        enabled: true,
        priority: 14,
        group: 'new',
        type: 'cms-direct',
        headers: DEFAULT_HEADERS
    },
];
