// src/services/customizationService.ts
import api from './api';
import type { 
  UserPageFrontendRequest, 
  UserPageFrontendResponse 
} from '../types/customization.types';
import type { DefaultResponse } from '../types/authtypes/auth.types';

class CustomizationService {
  
  /**
   * Busca as configurações da página do usuário autenticado
   */
  async getUserPageSettings(): Promise<UserPageFrontendResponse> {
    const response = await api.get<UserPageFrontendResponse>('/user/page');
    return response.data;
  }

  /**
   * Busca as configurações públicas de um usuário por slug
   */
  async getPublicPageSettings(slug: string): Promise<UserPageFrontendResponse> {
    const response = await api.get<UserPageFrontendResponse>(`/public/page/${slug}`);
    return response.data;
  }

  /**
   * Atualiza as configurações da página (PUT - substitui tudo)
   */
  async updatePageSettings(settings: UserPageFrontendRequest): Promise<UserPageFrontendResponse> {
    const response = await api.put<UserPageFrontendResponse>('/user/page', settings);
    return response.data;
  }

  /**
   * Atualiza parcialmente as configurações (PATCH - atualiza apenas campos enviados)
   */
  async patchPageSettings(settings: UserPageFrontendRequest): Promise<UserPageFrontendResponse> {
    const response = await api.patch<UserPageFrontendResponse>('/user/page', settings);
    return response.data;
  }

  /**
   * Reseta todas as configurações para o padrão
   */
  async resetPageSettings(): Promise<DefaultResponse> {
    const response = await api.delete<DefaultResponse>('/user/page');
    return response.data;
  }
}

export const customizationService = new CustomizationService();
export default customizationService;