// src/types/ranking.types.ts

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface UserViewsRanking {
  slug: string;
  profileImageUrl: string | null;
  views: number;
}

export interface UserCoinsRanking {
  slug: string;
  profileImageUrl: string | null;
  coins: number;
}

export interface UserVeteranRanking {
  slug: string;
  profileImageUrl: string | null;
  createdAt: string;
}

export type RankingType = 'views' | 'coins' | 'veterans';

export type RankingUser = UserViewsRanking | UserCoinsRanking | UserVeteranRanking;