export interface PromptCard {
  glyph: string;
  title: string;
  prompt: string;
  imageUrl: string;
  caption: string;
  tags: string[];
}

export interface GeneratedData {
  mainTitle: string;
  archetype: string;
  tone: string;
  use: string;
  bannerImageUrl: string;
  cards: PromptCard[];
  negativePrompts: string[];
  remixSuggestions: string[];
}
