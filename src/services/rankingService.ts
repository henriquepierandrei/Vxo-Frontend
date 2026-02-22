// src/services/rankingService.ts

import api from './api';
import type {
  PageResponse,
  UserViewsRanking,
  UserCoinsRanking,
  UserVeteranRanking,
  RankingType
} from '../types/ranking.types';

interface PaginationParams {
  page?: number;
  size?: number;
  signal?: AbortSignal;
}

export const rankingService = {
  async getViewsRanking(params: PaginationParams = {}): Promise<PageResponse<UserViewsRanking>> {
    const { page = 0, size = 20, signal } = params;
    const response = await api.get<PageResponse<UserViewsRanking>>('/public/ranking/views', {
      params: { page, size },
      signal,
    });
    return response.data;
  },

  async getCoinsRanking(params: PaginationParams = {}): Promise<PageResponse<UserCoinsRanking>> {
    const { page = 0, size = 20, signal } = params;
    const response = await api.get<PageResponse<UserCoinsRanking>>('/public/ranking/coins', {
      params: { page, size },
      signal,
    });
    return response.data;
  },

  async getVeteranRanking(params: PaginationParams = {}): Promise<PageResponse<UserVeteranRanking>> {
    const { page = 0, size = 20, signal } = params;
    const response = await api.get<PageResponse<UserVeteranRanking>>('/public/ranking/veterans', {
      params: { page, size },
      signal,
    });
    return response.data;
  },

  async getRanking(
    type: RankingType,
    params: PaginationParams = {}
  ): Promise<PageResponse<UserViewsRanking | UserCoinsRanking | UserVeteranRanking>> {
    switch (type) {
      case 'views':
        return this.getViewsRanking(params);
      case 'coins':
        return this.getCoinsRanking(params);
      case 'veterans':
        return this.getVeteranRanking(params);
    }
  },
};

export default rankingService;