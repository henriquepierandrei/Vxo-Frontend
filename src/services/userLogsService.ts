// src/services/userLogsService.ts

import api from './api';
import type { 
  PagedUserLogsResponse, 
  UserLogType,
  UserLogsParams 
} from '../types/userLogs.types';

class UserLogsService {
  // ═══════════════════════════════════════════════════════════
  // CONTROLE DE REQUISIÇÕES DUPLICADAS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Map que armazena requisições em andamento
   * Key: string única baseada no endpoint + params
   * Value: Promise da requisição
   */
  private pendingRequests = new Map<string, Promise<PagedUserLogsResponse>>();

  /**
   * Gera uma chave única para identificar requisições iguais
   */
  private getRequestKey(endpoint: string, params: Record<string, any>): string {
    return `${endpoint}:${JSON.stringify(params)}`;
  }

  /**
   * Limpa requisições antigas do cache (segurança extra)
   * Chamado automaticamente após cada requisição
   */
  private cleanupRequest(key: string): void {
    // Pequeno delay para garantir que requisições simultâneas usem o cache
    setTimeout(() => {
      this.pendingRequests.delete(key);
    }, 100);
  }

  // ═══════════════════════════════════════════════════════════
  // MÉTODOS PÚBLICOS
  // ═══════════════════════════════════════════════════════════

  /**
   * Busca todos os logs do usuário com paginação
   * ✅ Previne requisições duplicadas automaticamente
   */
  async getUserLogs(params: UserLogsParams = {}): Promise<PagedUserLogsResponse> {
    const { 
      page = 0, 
      size = 20, 
      sortBy = 'createdAt', 
      direction = 'DESC' 
    } = params;
    
    const normalizedParams = { page, size, sortBy, direction };
    const key = this.getRequestKey('/user/logs', normalizedParams);
    
    // ✅ Se já existe requisição idêntica em andamento, reutiliza
    const existingRequest = this.pendingRequests.get(key);
    if (existingRequest) {
      console.log('[UserLogsService] Requisição duplicada detectada, reutilizando...', { 
        endpoint: '/user/logs', 
        params: normalizedParams 
      });
      return existingRequest;
    }

    // ✅ Cria nova requisição
    console.log('[UserLogsService] Nova requisição:', { 
      endpoint: '/user/logs', 
      params: normalizedParams 
    });

    const request = api
      .get<PagedUserLogsResponse>('/user/logs', {
        params: normalizedParams
      })
      .then((response) => {
        this.cleanupRequest(key);
        return response.data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key); // Remove imediatamente em caso de erro
        throw error;
      });

    // ✅ Armazena no cache
    this.pendingRequests.set(key, request);
    
    return request;
  }

  /**
   * Busca logs por tipo específico com paginação
   * ✅ Previne requisições duplicadas automaticamente
   */
  async getUserLogsByType(
    type: UserLogType, 
    params: UserLogsParams = {}
  ): Promise<PagedUserLogsResponse> {
    const { 
      page = 0, 
      size = 20, 
      sortBy = 'createdAt', 
      direction = 'DESC' 
    } = params;
    
    const normalizedParams = { page, size, sortBy, direction, type };
    const endpoint = `/user/logs/type/${type}`;
    const key = this.getRequestKey(endpoint, normalizedParams);
    
    // ✅ Se já existe requisição idêntica em andamento, reutiliza
    const existingRequest = this.pendingRequests.get(key);
    if (existingRequest) {
      console.log('[UserLogsService] Requisição duplicada detectada, reutilizando...', { 
        endpoint, 
        params: normalizedParams 
      });
      return existingRequest;
    }

    // ✅ Cria nova requisição
    console.log('[UserLogsService] Nova requisição:', { 
      endpoint, 
      params: normalizedParams 
    });

    const request = api
      .get<PagedUserLogsResponse>(endpoint, {
        params: { page, size, sortBy, direction }
      })
      .then((response) => {
        this.cleanupRequest(key);
        return response.data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    // ✅ Armazena no cache
    this.pendingRequests.set(key, request);
    
    return request;
  }

  // ═══════════════════════════════════════════════════════════
  // UTILITÁRIOS
  // ═══════════════════════════════════════════════════════════

  /**
   * Limpa todas as requisições pendentes
   * Útil para logout ou reset de estado
   */
  clearPendingRequests(): void {
    this.pendingRequests.clear();
    console.log('[UserLogsService] Cache de requisições limpo');
  }

  /**
   * Retorna quantidade de requisições pendentes
   * Útil para debug
   */
  getPendingRequestsCount(): number {
    return this.pendingRequests.size;
  }
}

// ═══════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════

export const userLogsService = new UserLogsService();
export default userLogsService;