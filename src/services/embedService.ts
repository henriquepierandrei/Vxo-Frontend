// src/services/embedService.ts

import api from './api';
import type { EmbedResponse, EmbedValidationResult } from '../types/embed.types';

class EmbedService {
  // ═══════════════════════════════════════════════════════════
  // CONTROLE DE REQUISIÇÕES DUPLICADAS
  // ═══════════════════════════════════════════════════════════

  private pendingRequests = new Map<string, Promise<EmbedResponse>>();

  private getRequestKey(endpoint: string, params: Record<string, any> = {}): string {
    return `${endpoint}:${JSON.stringify(params)}`;
  }

  private cleanupRequest(key: string): void {
    setTimeout(() => {
      this.pendingRequests.delete(key);
    }, 100);
  }

  // ═══════════════════════════════════════════════════════════
  // CONVERSÃO DE URLs PARA IFRAME
  // ═══════════════════════════════════════════════════════════

  /**
   * Converte URL do YouTube para formato embed
   * Aceita: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
   */
  private convertYouTubeUrl(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }

    return null;
  }

  /**
   * Converte URL do Spotify para formato embed
   * Aceita: open.spotify.com/track/ID, open.spotify.com/playlist/ID, open.spotify.com/album/ID
   */
  private convertSpotifyUrl(url: string): string | null {
    const pattern = /spotify\.com\/(track|playlist|album|episode|show)\/([a-zA-Z0-9]+)/;
    const match = url.match(pattern);

    if (match && match[1] && match[2]) {
      return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
    }

    return null;
  }

  /**
   * Converte URL do SoundCloud para formato embed
   */
  private convertSoundCloudUrl(url: string): string | null {
    // SoundCloud aceita a URL completa
    if (url.includes('soundcloud.com/')) {
      const encodedUrl = encodeURIComponent(url);
      return `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`;
    }

    return null;
  }

  /**
   * Detecta a plataforma e converte a URL
   */
  public validateAndConvertUrl(url: string): EmbedValidationResult {
    if (!url || url.trim() === '') {
      return {
        isValid: false,
        error: 'URL não pode estar vazia'
      };
    }

    const trimmedUrl = url.trim();

    // Detecta YouTube
    if (trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be')) {
      const embedUrl = this.convertYouTubeUrl(trimmedUrl);
      if (embedUrl) {
        return {
          isValid: true,
          platform: 'youtube',
          embedUrl
        };
      }
      return {
        isValid: false,
        error: 'URL do YouTube inválida. Use: youtube.com/watch?v=ID ou youtu.be/ID'
      };
    }

    // Detecta Spotify
    if (trimmedUrl.includes('spotify.com')) {
      const embedUrl = this.convertSpotifyUrl(trimmedUrl);
      if (embedUrl) {
        return {
          isValid: true,
          platform: 'spotify',
          embedUrl
        };
      }
      return {
        isValid: false,
        error: 'URL do Spotify inválida. Use: open.spotify.com/track/ID ou open.spotify.com/playlist/ID'
      };
    }

    // Detecta SoundCloud
    if (trimmedUrl.includes('soundcloud.com')) {
      const embedUrl = this.convertSoundCloudUrl(trimmedUrl);
      if (embedUrl) {
        return {
          isValid: true,
          platform: 'soundcloud',
          embedUrl
        };
      }
      return {
        isValid: false,
        error: 'URL do SoundCloud inválida'
      };
    }

    return {
      isValid: false,
      error: 'Plataforma não suportada. Use YouTube, Spotify ou SoundCloud.'
    };
  }

  // ═══════════════════════════════════════════════════════════
  // API METHODS
  // ═══════════════════════════════════════════════════════════

  /**
   * Busca o embed atual do usuário
   * GET /user/page/embed
   */
  async getUserEmbed(): Promise<EmbedResponse> {
    const key = this.getRequestKey('/user/page/embed');

    const existingRequest = this.pendingRequests.get(key);
    if (existingRequest) {
      console.log('[EmbedService] Requisição duplicada detectada, reutilizando...');
      return existingRequest;
    }

    console.log('[EmbedService] Buscando embed do usuário...');

    const request = api
      .get<EmbedResponse>('/user/page/embed')
      .then((response) => {
        this.cleanupRequest(key);
        return response.data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, request);
    return request;
  }

  /**
   * Cria ou atualiza o embed (UPSERT)
   * PUT /user/page/embed?url=EMBED_URL
   */
  async upsertUserEmbed(originalUrl: string): Promise<EmbedResponse> {
    console.log('[EmbedService] Validando e convertendo URL...');

    // Valida e converte a URL
    const validation = this.validateAndConvertUrl(originalUrl);

    if (!validation.isValid || !validation.embedUrl) {
      throw new Error(validation.error || 'URL inválida');
    }

    console.log('[EmbedService] URL convertida:', {
      original: originalUrl,
      embed: validation.embedUrl,
      platform: validation.platform
    });

    const key = this.getRequestKey('/user/page/embed', { url: validation.embedUrl });

    const existingRequest = this.pendingRequests.get(key);
    if (existingRequest) {
      console.log('[EmbedService] Requisição duplicada detectada, reutilizando...');
      return existingRequest;
    }

    const request = api
      .put<EmbedResponse>('/user/page/embed', null, {
        params: { url: validation.embedUrl }
      })
      .then((response) => {
        this.cleanupRequest(key);
        return response.data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        
        // Trata erros específicos
        if (error.response?.status === 403) {
          throw new Error('Você precisa ser premium para usar embeds!');
        }
        
        throw error;
      });

    this.pendingRequests.set(key, request);
    return request;
  }

  /**
   * Remove o embed do usuário
   * DELETE /user/page/embed
   */
  async deleteUserEmbed(): Promise<EmbedResponse> {
    const key = this.getRequestKey('/user/page/embed/delete');

    const existingRequest = this.pendingRequests.get(key);
    if (existingRequest) {
      console.log('[EmbedService] Requisição duplicada detectada, reutilizando...');
      return existingRequest;
    }

    console.log('[EmbedService] Removendo embed...');

    const request = api
      .delete<EmbedResponse>('/user/page/embed')
      .then((response) => {
        this.cleanupRequest(key);
        return response.data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        
        if (error.response?.status === 403) {
          throw new Error('Você precisa ser premium para gerenciar embeds!');
        }
        
        throw error;
      });

    this.pendingRequests.set(key, request);
    return request;
  }

  // ═══════════════════════════════════════════════════════════
  // UTILITÁRIOS
  // ═══════════════════════════════════════════════════════════

  clearPendingRequests(): void {
    this.pendingRequests.clear();
    console.log('[EmbedService] Cache de requisições limpo');
  }

  getPendingRequestsCount(): number {
    return this.pendingRequests.size;
  }
}

// ═══════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════

export const embedService = new EmbedService();
export default embedService;