import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedData, PromptCard } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// A placeholder image to use when generation fails
const FAILED_IMAGE_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiA5Ij48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iOSIgZmlsbD0iIzExMTMxOCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOGQxYTFhIiBmb250LXNpemU9IjEuMiIgZm9udC1mYW1pbHk9ImludGVyLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+RkFJTEVEPC90ZXh0Pjwvc3ZnPg==';


const responseSchema = {
  type: Type.OBJECT,
  properties: {
    archetype: { type: Type.STRING, description: "A single, powerful archetype that captures the theme (e.g., Warlord, Scholar, Rogue)." },
    tone: { type: Type.STRING, description: "Two or three descriptive words for the tone (e.g., Gothic, Dramatic)." },
    use: { type: Type.STRING, description: "The intended use case for these images (e.g., Cinematic Image Generation)." },
    cards: {
      type: Type.ARRAY,
      description: "An array of exactly 5 unique 'Prompt Card' objects.",
      items: {
        type: Type.OBJECT,
        properties: {
          glyph: { type: Type.STRING, description: "A single, relevant emoji." },
          title: { type: Type.STRING, description: "A short, evocative title for the card." },
          prompt: { type: Type.STRING, description: "A multi-line string with 7 lines detailing Subject, Lens, Lighting, Style, Color, Composition, and Constraints." },
          caption: { type: Type.STRING, description: "A brief, descriptive caption for the image generated from the prompt." },
          tags: { 
            type: Type.ARRAY, 
            description: "An array of 2-4 single-word lowercase tags for filtering (e.g., character, creature, cathedral, symbol).",
            items: { type: Type.STRING }
          },
        },
        required: ["glyph", "title", "prompt", "caption", "tags"],
      },
    },
    negativePrompts: {
      type: Type.ARRAY,
      description: "An array of 5 short strings for a 'Negative Prompt Overlay' to avoid clichés.",
      items: { type: Type.STRING },
    },
    remixSuggestions: {
      type: Type.ARRAY,
      description: "An array of 3 creative suggestions for 'Remix Rituals'.",
      items: { type: Type.STRING },
    },
  },
  required: ["archetype", "tone", "use", "cards", "negativePrompts", "remixSuggestions"],
};


export const generatePromptSet = async (idea: string): Promise<Omit<GeneratedData, 'mainTitle' | 'logoImageUrl' | 'bannerImageUrl' | 'cards'> & { cards: Omit<PromptCard, 'imageUrl'>[] }> => {
    const prompt = `
You are a creative director specializing in dark fantasy world-building for visual media. Your task is to generate a "Relic Series" prompt card set based on a user-provided theme, designed for a "Demon Codex" style thumbnail vault. The output must be a well-structured JSON object adhering to the provided schema.

The theme is: "${idea}"

Generate content for the following structure:

1.  **archetype**: A single, powerful archetype.
2.  **tone**: Two or three descriptive words for the tone.
3.  **use**: The intended use case.
4.  **cards**: An array of exactly 5 unique "Prompt Card" objects. Each card must explore a different facet of the theme. Each must have:
    *   **glyph**: A single, relevant emoji.
    *   **title**: An evocative title.
    *   **prompt**: A multi-line string with exactly seven lines: "Subject:", "Lens:", "Lighting:", "Style:", "Color:", "Composition:", "Constraints:". Avoid overly graphic or violent descriptions to comply with safety policies.
    *   **caption**: A brief, descriptive caption for the image.
    *   **tags**: An array of 2-4 single-word, lowercase tags for filtering (e.g., character, creature, environment, symmetry).
5.  **negativePrompts**: An array of 5 strings for a "Negative Prompt Overlay" to avoid visual clichés. Examples: "no glowing eyes", "no floating rocks", "no generic cloaks or hoods", "no perfect symmetry", "no purple fog".
6.  **remixSuggestions**: An array of 3 "Remix Rituals" suggestions.

Ensure the entire output is a single, valid JSON object and nothing else.
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        }
    });
    
    const text = response.text.trim();
    return JSON.parse(text);
};


export const generateImage = async (prompt: string, aspectRatio: '1:1' | '16:9' | '4:3' = '16:9'): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: `cinematic dark fantasy art, ${prompt}`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
            },
        });

        if (!response.generatedImages?.length || !response.generatedImages[0].image?.imageBytes) {
            console.warn("Image generation blocked, likely by safety filters for prompt:", prompt);
            return FAILED_IMAGE_PLACEHOLDER;
        }

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error during image generation for prompt:", prompt, error);
        return FAILED_IMAGE_PLACEHOLDER;
    }
}