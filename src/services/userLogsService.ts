// src/services/userLogsService.ts

import api from './api';
import type { 
  PagedUserLogsResponse, 
  UserLogType,
  UserLogsParams 
} from '../types/userLogs.types';

class UserLogsService {
  
  /**
   * Busca todos os logs do usuário com paginação
   */
  async getUserLogs(params: UserLogsParams = {}): Promise<PagedUserLogsResponse> {
    const { 
      page = 0, 
      size = 20, 
      sortBy = 'createdAt', 
      direction = 'DESC' 
    } = params;
    
    const response = await api.get<PagedUserLogsResponse>('/user/logs', {
      params: { page, size, sortBy, direction }
    });
    return response.data;
  }

  /**
   * Busca logs por tipo específico com paginação
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
    
    const response = await api.get<PagedUserLogsResponse>(`/user/logs/type/${type}`, {
      params: { page, size, sortBy, direction }
    });
    return response.data;
  }
}

export const userLogsService = new UserLogsService();
export default userLogsService;