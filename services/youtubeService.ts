export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    publishedAt?: string;
    category: 'shorts' | 'lore' | 'tutorials' | 'soundscapes';
    thumbnailUrl: string;
    duration: string;
    tags: string[];
    viewsEstimate?: string;
    channelTitle?: string;
}

export interface YouTubeChannelInfo {
    id: string;
    title: string;
    description: string;
    customUrl: string;
    subscriberCount?: string;
    videoCount?: string;
    avatarUrl?: string;
}

export const FALLBACK_CHRONICLES: YouTubeVideo[] = [
    {
        id: 'XLSvy1jHihE',
        title: 'Hail to the Crown',
        description: 'Featured masterwork occult anthem and dark fantasy visual chronicle: Hail to the Crown. Powered by The Demon Codex audio-visual alchemy.',
        publishedAt: '2026-08-20T00:00:00Z',
        category: 'lore',
        thumbnailUrl: 'https://i.ytimg.com/vi/XLSvy1jHihE/hqdefault.jpg',
        duration: '3:45',
        tags: ['#HailToTheCrown', '#TheDemonCodex', '#DarkFantasy', '#OccultCinematics'],
        viewsEstimate: '★ Featured Anthem',
        channelTitle: '@thedemoncodex'
    },
    {
        id: 'Ng8yQOwKvxM',
        title: 'Cemetery Gates',
        description: 'Haunting dark fantasy manifestation and abyssal soundscape ritual: Cemetery Gates.',
        publishedAt: '2026-08-18T00:00:00Z',
        category: 'soundscapes',
        thumbnailUrl: 'https://i.ytimg.com/vi/Ng8yQOwKvxM/hqdefault.jpg',
        duration: '5:48',
        tags: ['#CemeteryGates', '#DarkFantasy', '#OccultMetal', '#TheDemonCodex'],
        viewsEstimate: 'Transmission',
        channelTitle: '@thedemoncodex'
    },
    {
        id: 'GJ7U_i7PLf0',
        title: 'Breaking the Chains',
        description: 'Unshackled energy, explosive dark power, and alchemical resurrection: Breaking the Chains.',
        publishedAt: '2026-08-15T00:00:00Z',
        category: 'tutorials',
        thumbnailUrl: 'https://i.ytimg.com/vi/GJ7U_i7PLf0/hqdefault.jpg',
        duration: '3:35',
        tags: ['#BreakingTheChains', '#DarkFantasy', '#Unchained', '#TheDemonCodex'],
        viewsEstimate: 'Transmission',
        channelTitle: '@thedemoncodex'
    },
    {
        id: 'dvOIHxfo42M',
        title: 'Bulls on Parade',
        description: 'Furious high-energy occult anthem and cinematic battlefield motion: Bulls on Parade.',
        publishedAt: '2026-08-12T00:00:00Z',
        category: 'shorts',
        thumbnailUrl: 'https://i.ytimg.com/vi/dvOIHxfo42M/hqdefault.jpg',
        duration: '3:51',
        tags: ['#BullsOnParade', '#DarkFantasy', '#OccultMetal', '#TheDemonCodex'],
        viewsEstimate: 'Transmission',
        channelTitle: '@thedemoncodex'
    }
];

export async function fetchLatestYouTubeVideos(handle: string = 'thedemoncodex'): Promise<{
    videos: YouTubeVideo[];
    channel: YouTubeChannelInfo | null;
    source: 'api' | 'fallback';
}> {
    try {
        const cleanHandle = handle.replace(/^@/, '');
        const res = await fetch(`/api/youtube/latest?handle=${encodeURIComponent(cleanHandle)}`);
        
        if (res.ok) {
            const data = await res.json();
            if (data.videos && Array.isArray(data.videos) && data.videos.length > 0) {
                return {
                    videos: data.videos,
                    channel: data.channel || null,
                    source: 'api'
                };
            }
        }
    } catch (err) {
        console.warn('Backend YouTube fetch failed, evaluating fallback:', err);
    }

    // Direct Client-Side YouTube Data API v3 fallback if VITE_YOUTUBE_API_KEY is defined in client
    const clientKey = (import.meta as any).env?.VITE_YOUTUBE_API_KEY;
    if (clientKey) {
        try {
            const cleanHandle = handle.replace(/^@/, '');
            const channelRes = await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&forHandle=${cleanHandle}&key=${clientKey}`
            );
            if (channelRes.ok) {
                const channelData = await channelRes.json();
                const channelItem = channelData.items?.[0];
                if (channelItem) {
                    const uploadsId = channelItem.contentDetails?.relatedPlaylists?.uploads;
                    if (uploadsId) {
                        const playlistRes = await fetch(
                            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsId}&maxResults=10&key=${clientKey}`
                        );
                        if (playlistRes.ok) {
                            const pData = await playlistRes.json();
                            const vids: YouTubeVideo[] = (pData.items || []).map((it: any) => {
                                const id = it.snippet?.resourceId?.videoId || it.id;
                                const title = it.snippet?.title || 'Codex Chronicle';
                                const isShort = title.toLowerCase().includes('short');
                                return {
                                    id,
                                    title,
                                    description: it.snippet?.description || '',
                                    publishedAt: it.snippet?.publishedAt,
                                    category: isShort ? 'shorts' : 'lore',
                                    thumbnailUrl: it.snippet?.thumbnails?.maxres?.url || it.snippet?.thumbnails?.high?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
                                    duration: isShort ? '0:59' : '5:00',
                                    tags: ['#TheDemonCodex', '#DarkFantasy'],
                                    channelTitle: it.snippet?.channelTitle || '@thedemoncodex'
                                };
                            });
                            return {
                                videos: vids,
                                channel: {
                                    id: channelItem.id,
                                    title: channelItem.snippet?.title || 'The Demon Codex',
                                    description: channelItem.snippet?.description || '',
                                    customUrl: `@${cleanHandle}`,
                                    avatarUrl: channelItem.snippet?.thumbnails?.high?.url
                                },
                                source: 'api'
                            };
                        }
                    }
                }
            }
        } catch (err) {
            console.warn('Direct client YouTube API lookup error:', err);
        }
    }

    return {
        videos: FALLBACK_CHRONICLES,
        channel: {
            id: 'channel-thedemoncodex',
            title: 'The Demon Codex',
            description: 'The Official Dark Fantasy & Occult AI Worldbuilding Channel.',
            customUrl: '@thedemoncodex',
            avatarUrl: '/demon-ai-1781131108810.jpg'
        },
        source: 'fallback'
    };
}
