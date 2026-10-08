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

export interface DarkSeals {
  blood: number; // 🩸 Blood Offering
  void: number;  // 👁️ Void Gaze
  spark: number; // ⚡ Arcane Spark
  soul: number;  // 💀 Soul Bound
}

export type DarkSealType = 'blood' | 'void' | 'spark' | 'soul';

export interface DailyRitual {
  id: string; // e.g. 'ritual-2026-10-08'
  title: string;
  theme: string;
  directive: string;
  lore: string;
  tag: string;
  recommendedArchetype: string;
  suggestedPrompt: string;
  altarBoon: string;
  dateKey: string;
  resetTimeEpochMs: number;
}

export interface GeneratedData {
  id?: string;
  mainTitle: string;
  archetype: string;
  tone: string;
  use: string;
  bannerImageUrl: string;
  bannerDiagnostic?: ImageDiagnostic;
  cards: PromptCard[];
  negativePrompts: string[];
  remixSuggestions: string[];
  darkSeals?: DarkSeals;
  ritualTheme?: string;
  ritualDate?: string;
}
