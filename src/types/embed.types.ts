// src/types/embed.types.ts

export type EmbedPlatform = 'youtube' | 'spotify' | 'soundcloud';

export interface EmbedResponse {
  url: string | null;
}

export interface EmbedConfig {
  platform: EmbedPlatform;
  name: string;
  icon: string;
  color: string;
  placeholder: string;
  description: string;
  exampleUrl: string;
}

export interface EmbedValidationResult {
  isValid: boolean;
  platform?: EmbedPlatform;
  embedUrl?: string;
  error?: string;
}