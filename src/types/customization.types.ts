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
  biographyColor: string;
  centerAlign: boolean;
  viewColor: string;
  badgeColor: string;
  tagColor: string;
}


/**
 * Efeitos do nome
 */
export interface NameEffects {
  name: string;
  nameColor: string;
  neon: boolean;
  shiny: boolean;
  rgb: boolean;
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