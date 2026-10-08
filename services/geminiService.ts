import { GoogleGenAI, Type, Modality, ThinkingLevel } from "@google/genai";
import type { GeneratedData, PromptCard, ImageDiagnostic } from '../types';

export const FAILED_IMAGE_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiA5Ij48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iIzExMTMxOCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOGQxYTFhIiBmb250LXNpemU9IjEiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+TUFOSUZFU1RBVElPTiBGQUlMRUQ8L3RleHQ+PC9zdmc+';

export interface GenerateImageResult {
    imageUrl: string;
    diagnostic?: ImageDiagnostic;
}

export const formatGeminiError = (error: any): string => {
    if (!error) return "Unknown mystical interruption.";
    const raw = error?.message || String(error);
    const lower = raw.toLowerCase();

    if (
        error?.status === "RESOURCE_EXHAUSTED" ||
        error?.code === 429 ||
        lower.includes("429") ||
        lower.includes("spending cap") ||
        lower.includes("spend cap") ||
        lower.includes("resource_exhausted") ||
        lower.includes("quota")
    ) {
        return "RESOURCE_EXHAUSTED: Your project has exceeded its monthly spending cap or rate quota. Manage your project spend cap in Google AI Studio at https://ai.studio/spend.";
    }

    if (
        error?.status === "PERMISSION_DENIED" ||
        lower.includes("403") ||
        lower.includes("api_key") ||
        lower.includes("apikey") ||
        lower.includes("unauthorized")
    ) {
        return "PERMISSION_DENIED: A valid API key is required. Please check your credentials.";
    }

    if (
        error?.status === "UNAVAILABLE" ||
        error?.code === 503 ||
        lower.includes("503") ||
        lower.includes("deadline expired") ||
        lower.includes("unavailable")
    ) {
        return "The AI manifestation server experienced high latency or a temporary deadline expiration (503 Service Unavailable). Please retry the ritual in a moment.";
    }

    try {
        const parsed = JSON.parse(raw);
        if (parsed.error?.message) {
            return parsed.error.message;
        }
    } catch {
        // Not a JSON string
    }

    return raw;
};

/**
 * Executes an async AI operation with exponential backoff retry on transient 503/deadline/network issues.
 */
export async function withTransientRetry<T>(
    operationFn: () => Promise<T>,
    maxRetries = 2,
    baseDelayMs = 1500
): Promise<T> {
    let lastError: any;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operationFn();
        } catch (err: any) {
            lastError = err;
            const errMsg = (err?.message || String(err)).toLowerCase();
            const status = err?.status || err?.code;
            
            const isTransient = 
                status === 503 || 
                status === "UNAVAILABLE" || 
                errMsg.includes("503") || 
                errMsg.includes("deadline expired") || 
                errMsg.includes("unavailable") ||
                errMsg.includes("timeout") ||
                errMsg.includes("fetch failed") ||
                errMsg.includes("network");

            if (isTransient && attempt < maxRetries) {
                const delay = baseDelayMs * Math.pow(2, attempt);
                console.warn(`Transient API error encountered (${err?.message || status}). Retrying attempt ${attempt + 1}/${maxRetries} in ${delay}ms...`);
                await new Promise(res => setTimeout(res, delay));
                continue;
            }
            throw err;
        }
    }
    throw lastError;
}

export const sanitizeImagePrompt = (text: string): string => {
    if (!text) return text;
    const replacements: { [key: string]: string } = {
        'blood-stained': 'crimson-stained',
        'blood-dripping': 'liquid-crimson-dripping',
        'bloody': 'crimson-hued',
        'blood': 'crimson liquid',
        'gore': 'macabre essence',
        'gory': 'haunting',
        'slaughter': 'ritual combat',
        'slaughtered': 'defeated',
        'kill': 'vanquish',
        'killing': 'vanquishing',
        'sacrifice': 'votive offering',
        'sacrificed': 'consecrated',
        'demon': 'spectral shadow',
        'demons': 'spectral shadows',
        'demonic': 'abyssal',
        'devil': 'abyssal fiend',
        'devils': 'abyssal fiends',
        'satan': 'underworld monarch',
        'satanic': 'esoteric',
        'corpse': 'ancient remains',
        'corpses': 'ancient remains',
        'skeleton': 'ossuary relic',
        'skeletons': 'ossuary relics',
        'skull': 'bone relic',
        'skulls': 'bone relics',
        'flesh': 'organic sinew',
        'fleshy': 'sinewy',
        'mutilated': 'highly weathered',
        'mutilate': 'weather',
        'murder': 'reap',
        'murdered': 'reaped',
        'torture': 'trial',
        'tortured': 'tested',
        'dead body': 'fallen figure',
        'dead bodies': 'fallen figures',
        'hellish': 'abyssal',
        'hell': 'abyss',
        'horror': 'gothic atmosphere',
        'horrific': 'haunting'
    };

    let sanitized = text;
    for (const [key, replacement] of Object.entries(replacements)) {
        const regex = new RegExp(`\\b${key}\\b`, 'gi');
        sanitized = sanitized.replace(regex, replacement);
    }
    return sanitized;
};

// In-memory and local storage caching for prompt and image results
const PROMPT_CACHE_KEY_PREFIX = 'demon_codex_prompt_cache_';
const IMAGE_CACHE_KEY_PREFIX = 'demon_codex_img_cache_';
const promptMemoryCache = new Map<string, any>();
const imageMemoryCache = new Map<string, string>();

const getCachedPrompt = (key: string): any | null => {
    const cleanKey = key.trim().toLowerCase();
    if (promptMemoryCache.has(cleanKey)) {
        return promptMemoryCache.get(cleanKey);
    }
    try {
        if (typeof window !== 'undefined') {
            const raw = localStorage.getItem(PROMPT_CACHE_KEY_PREFIX + cleanKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                promptMemoryCache.set(cleanKey, parsed);
                return parsed;
            }
        }
    } catch {}
    return null;
};

const setCachedPrompt = (key: string, data: any): void => {
    const cleanKey = key.trim().toLowerCase();
    promptMemoryCache.set(cleanKey, data);
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(PROMPT_CACHE_KEY_PREFIX + cleanKey, JSON.stringify(data));
        }
    } catch {}
};

const getCachedImage = (key: string): string | null => {
    const cleanKey = key.trim();
    if (imageMemoryCache.has(cleanKey)) {
        return imageMemoryCache.get(cleanKey)!;
    }
    try {
        if (typeof window !== 'undefined') {
            const raw = localStorage.getItem(IMAGE_CACHE_KEY_PREFIX + cleanKey.substring(0, 40));
            if (raw) {
                imageMemoryCache.set(cleanKey, raw);
                return raw;
            }
        }
    } catch {}
    return null;
};

const setCachedImage = (key: string, url: string): void => {
    const cleanKey = key.trim();
    imageMemoryCache.set(cleanKey, url);
    try {
        if (typeof window !== 'undefined' && url.length < 500000) {
            localStorage.setItem(IMAGE_CACHE_KEY_PREFIX + cleanKey.substring(0, 40), url);
        }
    } catch {}
};


export const USER_API_KEY_STORAGE_KEY = 'demon_codex_gemini_api_key';

export const getUserApiKey = (): string => {
    try {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(USER_API_KEY_STORAGE_KEY) || '';
        }
    } catch {}
    return '';
};

export const setUserApiKey = (key: string): void => {
    try {
        if (typeof window !== 'undefined') {
            if (key && key.trim()) {
                localStorage.setItem(USER_API_KEY_STORAGE_KEY, key.trim());
            } else {
                localStorage.removeItem(USER_API_KEY_STORAGE_KEY);
            }
        }
    } catch {}
};

export const clearUserApiKey = (): void => {
    setUserApiKey('');
};

export const isCustomUserKeyActive = (): boolean => {
    return !!getUserApiKey();
};

export const validateApiKey = async (testKey: string): Promise<{ valid: boolean; error?: string }> => {
    if (!testKey || !testKey.trim()) {
        return { valid: false, error: 'API key cannot be empty.' };
    }
    try {
        const testAi = new GoogleGenAI({
            apiKey: testKey.trim(),
            httpOptions: {
                headers: { 'User-Agent': 'aistudio-build' }
            }
        });
        const res = await testAi.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: 'Test connection. Respond with OK.'
        });
        if (res.text) return { valid: true };
        return { valid: true };
    } catch (err: any) {
        try {
            const testAi = new GoogleGenAI({ apiKey: testKey.trim() });
            const res = await testAi.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: 'Test'
            });
            if (res.text) return { valid: true };
        } catch (fbErr: any) {
            try {
                const testAi = new GoogleGenAI({ apiKey: testKey.trim() });
                const res = await testAi.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: 'Test'
                });
                if (res.text) return { valid: true };
            } catch (fbErr2: any) {
                return { valid: false, error: formatGeminiError(fbErr2 || fbErr || err) };
            }
        }
        return { valid: false, error: formatGeminiError(err) };
    }
};

let serverKeyAvailable: boolean | null = null;
let serverKeySource: string = 'none';

export const checkServerKeyStatus = async (): Promise<{ hasKey: boolean; keySource?: string }> => {
    try {
        const res = await fetch('/api/dark-fantasy/status');
        if (res.ok) {
            const data = await res.json();
            serverKeyAvailable = Boolean(data.hasKey);
            serverKeySource = data.keySource || 'server';
            return { hasKey: serverKeyAvailable, keySource: serverKeySource };
        }
    } catch {
        // network or dev server warming up
    }
    const localHasKey = serverKeyAvailable ?? !!getApiKey();
    return { hasKey: localHasKey, keySource: localHasKey ? 'client' : 'none' };
};

export const getApiKey = (): string => {
    if (typeof window !== 'undefined') {
        const customKey = getUserApiKey();
        if (customKey && customKey !== 'undefined' && customKey !== '""') {
            return customKey;
        }
        if ((window as any).aistudio?.hasSelectedApiKey?.()) {
            const key = (window as any).aistudio.getApiKey?.() || (window as any).aistudio.getSelectedApiKey?.();
            if (key && key !== 'undefined' && key !== '""') return key;
        }
        // Support Dark Fantasy API key from Vite client environment
        const viteDarkFantasyKey = 
            (import.meta as any).env?.VITE_DARK_FANTASY_API_KEY || 
            (import.meta as any).env?.VITE_DARK_FANTASY_KEY || 
            (import.meta as any).env?.VITE_FANTASY_API_KEY;
        if (viteDarkFantasyKey && viteDarkFantasyKey !== 'undefined' && viteDarkFantasyKey !== '""') {
            return viteDarkFantasyKey;
        }
        // Support VITE_GEMINI_API_KEY from Vite client environment
        const viteKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
        if (viteKey && viteKey !== 'undefined' && viteKey !== '""') {
            return viteKey;
        }
    }
    const envKey = 
        process.env.DARK_FANTASY_API_KEY ||
        process.env.DARK_FANTASY_KEY ||
        process.env.FREE_DARK_FANTASY_API_KEY ||
        process.env.FANTASY_API_KEY ||
        process.env.GEMINI_API_KEY || 
        process.env.API_KEY || 
        (process.env as any)?.VITE_DARK_FANTASY_API_KEY ||
        (process.env as any)?.VITE_GEMINI_API_KEY;
    if (envKey && envKey !== 'undefined' && envKey !== '""') {
        return envKey;
    }
    return '';
};

export const hasApiKeySelected = (): boolean => {
    if (serverKeyAvailable === true) return true;
    if (typeof window !== 'undefined' && getUserApiKey()) return true;
    return !!getApiKey();
};

const getAiClient = () => {
    return new GoogleGenAI({
        apiKey: getApiKey(),
        httpOptions: {
            headers: {
                'User-Agent': 'aistudio-build'
            }
        }
    });
};

const mapAspectRatio = (aspectRatio: string): '1:1' | '3:4' | '4:3' | '9:16' | '16:9' => {
    if (aspectRatio === '1:1' || aspectRatio === '3:4' || aspectRatio === '4:3' || aspectRatio === '9:16' || aspectRatio === '16:9') {
        return aspectRatio;
    }
    if (aspectRatio === '2:3') return '3:4';
    if (aspectRatio === '3:2') return '4:3';
    if (aspectRatio === '21:9') return '16:9';
    return '16:9';
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    archetype: { type: Type.STRING, description: "A single, powerful archetype (e.g., Void-Stalker, Blood-Paladin)." },
    tone: { type: Type.STRING, description: "Descriptive words for the atmosphere (e.g., Abyssal, Melancholic)." },
    use: { type: Type.STRING, description: "Intended cinematic use case." },
    cards: {
      type: Type.ARRAY,
      description: "Exactly 5 unique Relic cards.",
      items: {
        type: Type.OBJECT,
        properties: {
          glyph: { type: Type.STRING, description: "A thematic emoji." },
          title: { type: Type.STRING, description: "Evocative relic name." },
          prompt: { type: Type.STRING, description: "Multi-line technical prompt for Subject, Lighting, Style, etc." },
          caption: { type: Type.STRING, description: "Brief visual description." },
          tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-4 category tags." },
        },
        required: ["glyph", "title", "prompt", "caption", "tags"],
      },
    },
    negativePrompts: { type: Type.ARRAY, items: { type: Type.STRING } },
    remixSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["archetype", "tone", "use", "cards", "negativePrompts", "remixSuggestions"],
};

export const generatePromptSet = async (idea: string, useThinking = false, negativePrompt = ''): Promise<Omit<GeneratedData, 'mainTitle' | 'bannerImageUrl' | 'cards'> & { cards: Omit<PromptCard, 'imageUrl'>[] }> => {
    // Check cache first
    const cacheKey = negativePrompt ? `${idea}__neg_${negativePrompt}` : idea;
    const cached = getCachedPrompt(cacheKey);
    if (cached) {
        console.log("Serving cached prompt set for:", idea);
        return cached;
    }

    // 1. Try server-side generation first (utilizes GEMINI_API_KEY from environment)
    try {
        const serverRes = await fetch('/api/gemini/generate-prompts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idea, useThinking, negativePrompt })
        });
        if (serverRes.ok) {
            const resJson = await serverRes.json();
            if (resJson.data && Array.isArray(resJson.data.cards) && resJson.data.cards.length > 0) {
                setCachedPrompt(cacheKey, resJson.data);
                return resJson.data;
            }
        }
    } catch (serverErr) {
        console.warn("Server prompt synthesis unavailable, testing direct SDK:", serverErr);
    }

    const ai = getAiClient();
    const banishInstruction = negativePrompt.trim() 
        ? `\nANATHEMA (BANISHED SEAL) DIRECTIVE:\nThe user has strictly banished the following elements: "${negativePrompt.trim()}". You MUST strictly ensure every card prompt explicitly avoids these elements, and you must include them in the returned negativePrompts array.\n` 
        : '';

    const prompt = `Create a dark fantasy Relic Series based on: "${idea}". Output valid JSON matching the required schema.
${banishInstruction}
CRITICAL DIRECTIVE FOR THE CARD 'prompt' FIELDS:
These prompts will be fed into a highly sensitive image generation model (Imagen 3 / gemini-3.1-flash-image).
To prevent safety filter blocks, you MUST NOT use violent, gory, or explicit horror keywords (such as: blood, bloody, gory, gore, slaughter, kill, demon, demonic, devil, corpse, skull, flesh, sacrifice).
Instead, capture the premium, haunting dark fantasy aesthetic using atmospheric and poetic descriptors:
- Use 'crimson mist', 'scarlet velvet', or 'dark liquid' instead of 'blood' or 'bloody'
- Use 'ossuary ruins', 'bone structures', or 'relic chambers' instead of 'skulls' or 'corpses'
- Use 'abyssal creature', 'spectral shadow', or 'ancient entity' instead of 'demon' or 'devil'
- Use 'ritual votive offering', 'ceremony', or 'consecrated relic' instead of 'sacrifice' or 'sacrificed'
- Use terms like 'gothic architecture', 'chiaroscuro shadows', 'amber embers', 'obsidian steel', 'smoke and fog'.
Ensure the visual prompts are detailed, rich, and breathtaking, yet completely compliant with safety filters.`;

    const modelName = useThinking ? 'gemini-3.1-pro-preview' : 'gemini-3.5-flash';
    const config: any = {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
    };

    if (useThinking) {
        config.thinkingConfig = {
            thinkingLevel: ThinkingLevel.HIGH
        };
    }

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: config
        });
        
        const parsed = JSON.parse(response.text?.trim() || "{}");
        if (parsed && Array.isArray(parsed.cards) && parsed.cards.length > 0) {
            setCachedPrompt(idea, parsed);
        }
        return parsed;
    } catch (err: any) {
        console.warn("generatePromptSet execution notice:", err);
        throw err;
    }
};

export const generateImageWithDiagnostics = async (
    prompt: string, 
    aspectRatio: '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9' = '16:9',
    imageSize: '1K' | '2K' | '4K' = '1K',
    isStudioQuality: boolean = false
): Promise<GenerateImageResult> => {
    const primaryModel = isStudioQuality ? 'gemini-3-pro-image' : 'gemini-3.1-flash-image';
    const cleanPrompt = sanitizeImagePrompt(prompt);

    // Check image cache first
    const cacheKey = `${cleanPrompt}_${aspectRatio}_${imageSize}_${isStudioQuality}`;
    const cached = getCachedImage(cacheKey);
    if (cached) {
        console.log("Serving cached image manifestation for:", cleanPrompt.substring(0, 30));
        return {
            imageUrl: cached,
            diagnostic: { hasError: false }
        };
    }

    // 1. Try server-side hardened endpoint first (accesses GEMINI_API_KEY from environment)
    try {
        const serverRes = await fetch('/api/gemini/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: cleanPrompt,
                aspectRatio,
                imageSize,
                isStudioQuality
            })
        });

        if (serverRes.ok) {
            const data = await serverRes.json();
            if (data.imageUrl) {
                setCachedImage(cacheKey, data.imageUrl);
                return {
                    imageUrl: data.imageUrl,
                    diagnostic: { hasError: false, modelName: data.modelUsed }
                };
            }
        } else {
            const errData = await serverRes.json().catch(() => ({}));
            if (serverRes.status === 402 || errData.code === '402_PREPAYMENT_DEPLETED' || String(errData.error).includes('prepayment')) {
                return {
                    imageUrl: FAILED_IMAGE_PLACEHOLDER,
                    diagnostic: {
                        hasError: true,
                        rawError: errData.error || "402: Your prepayment credits are depleted. Image generation requires billing credits at https://ai.studio/projects.",
                        statusCode: "402_PREPAYMENT_DEPLETED",
                        modelName: primaryModel,
                        promptAttempted: cleanPrompt,
                        timestamp: new Date().toLocaleTimeString()
                    }
                };
            }
            if (serverRes.status === 429 || errData.code === '429_RESOURCE_EXHAUSTED') {
                return {
                    imageUrl: FAILED_IMAGE_PLACEHOLDER,
                    diagnostic: {
                        hasError: true,
                        rawError: errData.error || "429 RESOURCE_EXHAUSTED: Monthly spending cap or rate quota reached on Gemini API.",
                        statusCode: "429_RESOURCE_EXHAUSTED",
                        modelName: primaryModel,
                        promptAttempted: cleanPrompt,
                        timestamp: new Date().toLocaleTimeString()
                    }
                };
            }
        }
    } catch (serverErr) {
        console.warn("Server image proxy route notice, checking client fallback:", serverErr);
    }

    const key = getApiKey();
    if (!key) {
        return {
            imageUrl: FAILED_IMAGE_PLACEHOLDER,
            diagnostic: {
                hasError: true,
                rawError: "API key is missing or unselected. Gemini image generation requires a valid Gemini API key.",
                statusCode: "403_KEY_REQUIRED",
                modelName: primaryModel,
                promptAttempted: cleanPrompt,
                timestamp: new Date().toLocaleTimeString()
            }
        };
    }

    const ai = getAiClient();
    const mappedAspect = mapAspectRatio(aspectRatio);
    let lastErrorTrace = "";
    let lastStatusCode: string | number = "UNKNOWN_ERROR";

    // 1. Try primary image generation model
    try {
        console.log(`Attempting image generation with model: ${primaryModel}`);

        const response = await withTransientRetry(async () => {
            return await ai.models.generateContent({
                model: primaryModel,
                contents: { parts: [{ text: `Atmospheric dark fantasy masterpiece: ${cleanPrompt}` }] },
                config: {
                    imageConfig: { aspectRatio: mappedAspect, imageSize }
                },
            });
        }, 2, 1500);
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData?.data) {
                console.log(`Successfully generated image using: ${primaryModel}`);
                const imgUrl = `data:image/png;base64,${part.inlineData.data}`;
                setCachedImage(cacheKey, imgUrl);
                return {
                    imageUrl: imgUrl,
                    diagnostic: { hasError: false }
                };
            }
        }
        
        const finishReason = response.candidates?.[0]?.finishReason;
        lastErrorTrace = `Primary model (${primaryModel}) completed without image payload. Finish reason: ${finishReason || 'NO_PARTS'}`;
        lastStatusCode = finishReason || "NO_IMAGE_PARTS";
    } catch (error: any) {
        console.warn("Primary image generation failed, checking fallback...", error);
        lastErrorTrace = formatGeminiError(error);
        lastStatusCode = error?.status || error?.code || "PRIMARY_ERROR";
        
        const errMessage = (error?.message || "").toLowerCase();
        if (
            error?.code === 402 ||
            error?.status === 402 ||
            errMessage.includes("prepayment") ||
            errMessage.includes("prepay") ||
            errMessage.includes("credits are depleted")
        ) {
            return {
                imageUrl: FAILED_IMAGE_PLACEHOLDER,
                diagnostic: {
                    hasError: true,
                    rawError: "402: Your prepayment credits are depleted. Gemini image generation models require billing credits enabled on your project at https://ai.studio/projects.",
                    statusCode: "402_PREPAYMENT_DEPLETED",
                    modelName: primaryModel,
                    promptAttempted: cleanPrompt,
                    timestamp: new Date().toLocaleTimeString()
                }
            };
        }

        if (
            error?.status === "RESOURCE_EXHAUSTED" ||
            error?.code === 429 ||
            errMessage.includes("429") ||
            errMessage.includes("spending cap") ||
            errMessage.includes("resource_exhausted")
        ) {
            return {
                imageUrl: FAILED_IMAGE_PLACEHOLDER,
                diagnostic: {
                    hasError: true,
                    rawError: lastErrorTrace,
                    statusCode: "429_RESOURCE_EXHAUSTED",
                    modelName: primaryModel,
                    promptAttempted: cleanPrompt,
                    timestamp: new Date().toLocaleTimeString()
                }
            };
        }

        if (
            error?.status === "PERMISSION_DENIED" || 
            errMessage.includes("403") || 
            errMessage.includes("api_key") || 
            errMessage.includes("apikey") || 
            errMessage.includes("unauthorized") ||
            errMessage.includes("credentials")
        ) {
            return {
                imageUrl: FAILED_IMAGE_PLACEHOLDER,
                diagnostic: {
                    hasError: true,
                    rawError: `PERMISSION_DENIED: ${lastErrorTrace}`,
                    statusCode: "403_PERMISSION_DENIED",
                    modelName: primaryModel,
                    promptAttempted: cleanPrompt,
                    timestamp: new Date().toLocaleTimeString()
                }
            };
        }
    }

    // 2. Fallback to gemini-3.1-flash-lite-image
    const fallbackModel = 'gemini-3.1-flash-lite-image';
    try {
        console.log(`Attempting fallback image generation with: ${fallbackModel}`);

        const response = await withTransientRetry(async () => {
            return await ai.models.generateContent({
                model: fallbackModel,
                contents: { parts: [{ text: `Atmospheric dark fantasy masterpiece: ${cleanPrompt}` }] },
                config: {
                    imageConfig: { aspectRatio: mappedAspect }
                },
            });
        }, 2, 2000);
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData?.data) {
                console.log(`Successfully generated image using fallback: ${fallbackModel}`);
                const imgUrl = `data:image/png;base64,${part.inlineData.data}`;
                setCachedImage(cacheKey, imgUrl);
                return {
                    imageUrl: imgUrl,
                    diagnostic: { hasError: false }
                };
            }
        }

        const finishReason = response.candidates?.[0]?.finishReason;
        const fallbackMsg = `Fallback (${fallbackModel}) completed without image payload. Finish reason: ${finishReason || 'NO_PARTS'}`;
        lastErrorTrace = `[Primary ${primaryModel}]: ${lastErrorTrace}\n[Fallback ${fallbackModel}]: ${fallbackMsg}`;
        lastStatusCode = finishReason || lastStatusCode;
    } catch (fallbackError: any) {
        console.error("Fallback image generation also failed:", fallbackError);
        const fallbackMsg = formatGeminiError(fallbackError);
        lastErrorTrace = `[Primary ${primaryModel} Error]: ${lastErrorTrace}\n[Fallback ${fallbackModel} Error]: ${fallbackMsg}`;
        lastStatusCode = fallbackError?.status || fallbackError?.code || lastStatusCode;

        const errMessage = (fallbackError?.message || "").toLowerCase();
        if (
            fallbackError?.status === "RESOURCE_EXHAUSTED" ||
            fallbackError?.code === 429 ||
            errMessage.includes("429") ||
            errMessage.includes("spending cap") ||
            errMessage.includes("resource_exhausted")
        ) {
            return {
                imageUrl: FAILED_IMAGE_PLACEHOLDER,
                diagnostic: {
                    hasError: true,
                    rawError: fallbackMsg,
                    statusCode: "429_RESOURCE_EXHAUSTED",
                    modelName: fallbackModel,
                    promptAttempted: cleanPrompt,
                    timestamp: new Date().toLocaleTimeString()
                }
            };
        }

        if (
            fallbackError?.status === "PERMISSION_DENIED" || 
            errMessage.includes("403") || 
            errMessage.includes("api_key") || 
            errMessage.includes("apikey") || 
            errMessage.includes("unauthorized") ||
            errMessage.includes("credentials")
        ) {
            return {
                imageUrl: FAILED_IMAGE_PLACEHOLDER,
                diagnostic: {
                    hasError: true,
                    rawError: `PERMISSION_DENIED: ${lastErrorTrace}`,
                    statusCode: "403_PERMISSION_DENIED",
                    modelName: `${primaryModel} / ${fallbackModel}`,
                    promptAttempted: cleanPrompt,
                    timestamp: new Date().toLocaleTimeString()
                }
            };
        }
    }

    return {
        imageUrl: FAILED_IMAGE_PLACEHOLDER,
        diagnostic: {
            hasError: true,
            rawError: lastErrorTrace || "Image failed to manifest due to filter suppression or network disconnect.",
            statusCode: lastStatusCode,
            modelName: `${primaryModel} -> ${fallbackModel}`,
            promptAttempted: cleanPrompt,
            timestamp: new Date().toLocaleTimeString()
        }
    };
};

export const generateImage = async (
    prompt: string, 
    aspectRatio: '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9' = '16:9',
    imageSize: '1K' | '2K' | '4K' = '1K',
    isStudioQuality: boolean = false
): Promise<string> => {
    const res = await generateImageWithDiagnostics(prompt, aspectRatio, imageSize, isStudioQuality);
    if (res.diagnostic?.hasError && res.diagnostic.statusCode === '403_KEY_REQUIRED') {
        throw new Error("API_KEY_RESET_REQUIRED");
    }
    return res.imageUrl;
};

export const editImage = async (
    base64Image: string,
    prompt: string,
    aspectRatio: '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9' = '1:1',
    imageSize: '1K' | '2K' | '4K' = '1K'
): Promise<string> => {
    const cleanPrompt = sanitizeImagePrompt(prompt);

    // 1. Try server-side edit route first
    try {
        const serverRes = await fetch('/api/gemini/edit-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                base64Image,
                prompt: cleanPrompt,
                aspectRatio
            })
        });
        if (serverRes.ok) {
            const data = await serverRes.json();
            if (data.imageUrl) {
                return data.imageUrl;
            }
        }
    } catch (serverErr) {
        console.warn("Server-side image edit route notice, testing client fallback:", serverErr);
    }

    const key = getApiKey();
    if (!key) {
        throw new Error("API_KEY_RESET_REQUIRED");
    }

    const ai = getAiClient();
    const base64Data = base64Image.split(',')[1] || base64Image;
    const mappedAspect = mapAspectRatio(aspectRatio);
    let primaryFailedDueToQuota = false;
    let primaryErrorMsg = "";

    // 1. Try primary image edit model with automatic retry on transient deadline timeouts (503)
    try {
        const response = await withTransientRetry(async () => {
            return await ai.models.generateContent({
                model: 'gemini-3.1-flash-image',
                contents: {
                    parts: [
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType: "image/png"
                            }
                        },
                        {
                            text: `Perform this precise atmospheric dark fantasy edit: ${cleanPrompt}`
                        }
                    ]
                },
                config: {
                    imageConfig: { aspectRatio: mappedAspect, imageSize }
                }
            });
        }, 2, 1500);

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData?.data) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    } catch (error: any) {
        console.warn("Primary image edit failed, attempting fallback to flash-lite-image...", error);
        primaryErrorMsg = formatGeminiError(error);
        const errMessage = (error?.message || "").toLowerCase();
        
        if (
            error?.status === "RESOURCE_EXHAUSTED" ||
            error?.code === 429 ||
            errMessage.includes("429") ||
            errMessage.includes("spending cap") ||
            errMessage.includes("resource_exhausted")
        ) {
            primaryFailedDueToQuota = true;
            throw new Error(primaryErrorMsg);
        }

        if (
            error?.status === "PERMISSION_DENIED" || 
            errMessage.includes("403") || 
            errMessage.includes("api_key") || 
            errMessage.includes("apikey") || 
            errMessage.includes("unauthorized") ||
            errMessage.includes("credentials")
        ) {
            throw new Error("API_KEY_RESET_REQUIRED");
        }
    }

    // 2. Fallback to gemini-3.1-flash-lite-image if primary did not hit quota cap
    if (!primaryFailedDueToQuota) {
        try {
            const response = await withTransientRetry(async () => {
                return await ai.models.generateContent({
                    model: 'gemini-3.1-flash-lite-image',
                    contents: {
                        parts: [
                            {
                                inlineData: {
                                    data: base64Data,
                                    mimeType: "image/png"
                                }
                            },
                            {
                                text: `Perform this precise atmospheric dark fantasy edit: ${cleanPrompt}`
                            }
                        ]
                    },
                    config: {
                        imageConfig: { aspectRatio: mappedAspect }
                    }
                });
            }, 2, 2000);

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData?.data) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        } catch (fallbackError: any) {
            console.error("Fallback image edit also failed:", fallbackError);
            const fallbackMsg = formatGeminiError(fallbackError);
            const errMessage = (fallbackError?.message || "").toLowerCase();

            if (
                fallbackError?.status === "RESOURCE_EXHAUSTED" ||
                fallbackError?.code === 429 ||
                errMessage.includes("429") ||
                errMessage.includes("spending cap") ||
                errMessage.includes("resource_exhausted")
            ) {
                throw new Error(fallbackMsg);
            }
            if (
                fallbackError?.status === "PERMISSION_DENIED" || 
                errMessage.includes("403") || 
                errMessage.includes("api_key") || 
                errMessage.includes("apikey") || 
                errMessage.includes("unauthorized") ||
                errMessage.includes("credentials")
            ) {
                throw new Error("API_KEY_RESET_REQUIRED");
            }
            throw new Error(fallbackMsg || primaryErrorMsg || "Image transmutation ritual could not complete.");
        }
    }

    return FAILED_IMAGE_PLACEHOLDER;
};

export const ensurePngBase64 = async (imageSrc: string): Promise<string> => {
    if (!imageSrc) throw new Error("No image data provided for ritual.");

    // If it is already a pure PNG data URL
    if (imageSrc.startsWith('data:image/png;base64,')) {
        return imageSrc.replace('data:image/png;base64,', '');
    }

    // In a browser environment, safely render any SVG/JPEG/WebP to a clean PNG canvas
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth || 512;
                    canvas.height = img.naturalHeight || 512;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.fillStyle = '#090a0f';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0);
                        const pngDataUrl = canvas.toDataURL('image/png');
                        return resolve(pngDataUrl.replace(/^data:image\/png;base64,/, ''));
                    }
                } catch (e) {
                    console.warn("Canvas rasterization fallback:", e);
                }
                const parts = imageSrc.split(',');
                resolve(parts[1] || imageSrc);
            };
            img.onerror = () => {
                const parts = imageSrc.split(',');
                resolve(parts[1] || imageSrc);
            };
            img.src = imageSrc;
        });
    }

    const parts = imageSrc.split(',');
    return parts[1] || imageSrc;
};

export const generateRelicVideo = async (
    base64Image: string, 
    title: string, 
    duration: 5 | 10 = 5,
    aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string> => {
    const key = getApiKey();
    if (!key) {
        throw new Error("API_KEY_RESET_REQUIRED");
    }

    const ai = getAiClient();
    const cleanPngBase64 = await ensurePngBase64(base64Image);
    const sanitizedTitle = sanitizeImagePrompt(title || 'ancient relic');
    const cleanPrompt = `Atmospheric cinematic subtle movement, dark fantasy style, soft flickering embers, ethereal drifting smoke, matching the relic: ${sanitizedTitle}. ${duration} seconds of slow continuous ambient motion.`;

    let operation: any;
    try {
        operation = await withTransientRetry(async () => {
            return await ai.models.generateVideos({
                model: 'veo-3.1-lite-generate-preview',
                prompt: cleanPrompt,
                image: {
                    imageBytes: cleanPngBase64,
                    mimeType: 'image/png',
                },
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatio
                }
            });
        }, 2, 2000);
    } catch (startErr: any) {
        console.error("Veo start operation error:", startErr);
        const errMsg = (startErr?.message || String(startErr)).toLowerCase();
        if (
            startErr?.status === "PERMISSION_DENIED" ||
            errMsg.includes("403") ||
            errMsg.includes("api_key") ||
            errMsg.includes("unauthorized") ||
            errMsg.includes("credentials")
        ) {
            throw new Error("API_KEY_RESET_REQUIRED");
        }
        throw new Error(`Video initialization failed: ${formatGeminiError(startErr)}`);
    }

    const startTime = Date.now();
    const maxPollTimeMs = 300000; // 5 minutes max polling time for video generation

    while (!operation.done) {
        if (Date.now() - startTime > maxPollTimeMs) {
            throw new Error("Video generation ritual timed out after 5 minutes. Please retry.");
        }
        await new Promise(resolve => setTimeout(resolve, 6000));
        try {
            operation = await ai.operations.getVideosOperation({ operation });
        } catch (pollErr: any) {
            console.warn("Veo status check interval warning (will keep polling):", pollErr);
        }
    }

    if (operation.error) {
        console.error("Veo operation finished with error:", operation.error);
        const errObj = operation.error as any;
        const formatted = formatGeminiError(errObj);
        const errMsgLower = (errObj?.message || JSON.stringify(errObj)).toLowerCase();
        if (errMsgLower.includes("permission") || errMsgLower.includes("403") || errMsgLower.includes("api_key")) {
            throw new Error("API_KEY_RESET_REQUIRED");
        }
        throw new Error(`Video manifestation failed: ${formatted}`);
    }

    // Inspect all potential output shapes from the Veo API
    const responsePayload = operation.response || (operation as any)?.result || operation;
    const generatedVideos = 
        responsePayload?.generatedVideos || 
        responsePayload?.videos || 
        (responsePayload?.response?.generatedVideos) || 
        (operation as any)?.generatedVideos || 
        (responsePayload?.generatedSamples);

    const firstItem = Array.isArray(generatedVideos) ? generatedVideos[0] : generatedVideos;
    const videoData = firstItem?.video?.videoBytes || firstItem?.videoBytes || firstItem?.bytes;
    const videoUri = firstItem?.video?.uri || firstItem?.uri || firstItem?.video?.downloadUrl || firstItem?.downloadUrl;

    if (videoData) {
        try {
            const byteCharacters = atob(videoData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'video/mp4' });
            return URL.createObjectURL(blob);
        } catch {
            return `data:video/mp4;base64,${videoData}`;
        }
    } else if (videoUri) {
        const apiKey = getApiKey();
        let videoRes: Response | null = null;

        try {
            videoRes = await fetch(videoUri, {
                headers: apiKey ? { 'x-goog-api-key': apiKey } : {},
            });
        } catch (fetchErr) {
            console.warn("Direct fetch with header failed, attempting query param fetch...", fetchErr);
        }

        if (!videoRes || !videoRes.ok) {
            const separator = videoUri.includes('?') ? '&' : '?';
            const fetchUrl = apiKey ? `${videoUri}${separator}key=${apiKey}` : videoUri;
            try {
                videoRes = await fetch(fetchUrl);
            } catch (queryFetchErr) {
                console.warn("Query param fetch attempt failed:", queryFetchErr);
            }
        }

        if (videoRes && videoRes.ok) {
            const blob = await videoRes.blob();
            return URL.createObjectURL(blob);
        }
        
        // If browser fetch cannot download directly due to CORS, return the authenticated URI as usable player source
        if (videoUri.startsWith('http://') || videoUri.startsWith('https://')) {
            const separator = videoUri.includes('?') ? '&' : '?';
            return apiKey ? `${videoUri}${separator}key=${apiKey}` : videoUri;
        }
    }
    
    console.error("Veo operation completed but could not extract video data:", operation);
    throw new Error("Video manifestation completed, but the arcane stream could not be converted to a video file. Please retry the ritual.");
};

export const generateSoundscape = async (description: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `Manifest a haunting ambient soundscape. Describe the following with a deep, eerie, whispering voice: ${description}. Include subtle wind and metallic echoes.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' },
          },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Soundscape failed to manifest.");
  
  return `data:audio/pcm;base64,${base64Audio}`;
};

export const analyzeLore = async (title: string, caption: string): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Analyze this relic: "${title}". Description: "${caption}". Write a 2-sentence mysterious lore snippet.`,
    });
    return response.text || "Lore lost to time.";
};
