// src/services/linkService.ts
import api from './api';
import type { UserLinksResponse } from '../types/links.types';
import type { DefaultResponse } from '../types/authtypes/auth.types';

class LinkService {
  
  // ✅ Buscar todos os links do usuário
  async getUserLinks(): Promise<UserLinksResponse> {
    const response = await api.get<UserLinksResponse>('/user/links');
    return response.data;
  }

  // ✅ Adicionar novo link
  async addLink(url: string, typeId?: number): Promise<DefaultResponse> {
    const params = new URLSearchParams();
    params.append('url', url);
    if (typeId !== undefined) {
      params.append('typeId', typeId.toString());
    }
    
    const response = await api.post<DefaultResponse>(`/user/links?${params.toString()}`);
    return response.data;
  }

  // ✅ Atualizar link existente
  async updateLink(linkId: string, url?: string, typeId?: number): Promise<DefaultResponse> {
    const params = new URLSearchParams();
    if (url) {
      params.append('url', url);
    }
    if (typeId !== undefined) {
      params.append('typeId', typeId.toString());
    }
    
    const response = await api.put<DefaultResponse>(`/user/links/${linkId}?${params.toString()}`);
    return response.data;
  }

  // ✅ Deletar link
  async deleteLink(linkId: string): Promise<DefaultResponse> {
    const response = await api.delete<DefaultResponse>(`/user/links/${linkId}`);
    return response.data;
  }

  // ✅ Buscar link específico
  async getLink(linkId: string): Promise<DefaultResponse> {
    const response = await api.get<DefaultResponse>(`/user/links/${linkId}`);
    return response.data;
  }
}

export const linkService = new LinkService();
export default linkService;