export interface ImageDiagnostic {
  hasError: boolean;
  rawError?: string;
  statusCode?: string | number;
  modelName?: string;
  promptAttempted?: string;
  timestamp?: string;
  isRetrying?: boolean;
}

export interface PromptCard {
  glyph: string;
  title: string;
  prompt: string;
  imageUrl: string;
  caption: string;
  description?: string;
  tags: string[];
  diagnostic?: ImageDiagnostic;
}

export interface GeneratedData {
  mainTitle: string;
  archetype: string;
  tone: string;
  use: string;
  bannerImageUrl: string;
  bannerDiagnostic?: ImageDiagnostic;
  cards: PromptCard[];
  negativePrompts: string[];
  remixSuggestions: string[];
}
