// src/types/customization.types.ts

/**
 * Configurações do card
 */
export interface CardSettings {
  opacity: number;      // 0-100
  blur: number;         // 0-20
  color: string;        // hex color
  perspective: boolean; // PREMIUM
  hoverGrow: boolean;   // PREMIUM
  rgbBorder: boolean;   // PREMIUM
}

/**
 * Configurações de conteúdo (biografia)
 */
export interface ContentSettings {
  biography: string;
  biographyColor: string;  // hex color
  centerAlign: boolean;
}

/**
 * Efeitos do nome
 */
export interface NameEffects {
  name: string;
  neon: boolean;     // PREMIUM
  shiny: boolean;    // PREMIUM
  rgb: boolean;      // PREMIUM
}

/**
 * URLs de mídia e recursos
 */
export interface MediaUrls {
  backgroundUrl: string;
  profileImageUrl: string;
  musicUrl: string;      
  faviconUrl: string;
}


/**
 * Efeitos de página
 */
export interface PageEffects {
  snow: boolean;        
  rain: boolean;     
  cash: boolean; 
  thunder: boolean; 
  smoke: boolean; 
  stars: boolean;
}

/**
 * Request completo para atualização
 */
export interface UserPageFrontendRequest {
  cardSettings?: CardSettings;
  contentSettings?: ContentSettings;
  nameEffects?: NameEffects;
  mediaUrls?: MediaUrls;
  pageEffects?: PageEffects;
  staticBackgroundColor: string;
}

/**
 * Response com dados completos
 */
export interface UserPageFrontendResponse {
  userPageFrontendId: string;
  userId: string;
  isPremium: boolean;
  cardSettings: CardSettings;
  contentSettings: ContentSettings;
  nameEffects: NameEffects;
  mediaUrls: MediaUrls;
  pageEffects: PageEffects;
  staticBackgroundColor: string;
}