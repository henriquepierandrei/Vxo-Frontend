// src/types/userLogs.types.ts

export type UserLogType = 
  | 'GIFT_SENT'
  | 'GIFT_RECEIVED'
  | 'COINS_SENT'
  | 'COINS_RECEIVED'
  | 'COINS_PURCHASED'
  | 'COINS_REFUNDED'
  | 'ITEM_PURCHASED'
  | 'ITEM_REFUNDED'
  | 'ITEM_REMOVED_FROM_STORE'

export interface UserLogResponse {
  logId: string;
  type: UserLogType;
  description: string;
  coinsAmount: number;
  referenceId: string;
  createdAt: string;
}

export interface PageableSort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface Pageable {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  sort: PageableSort;
  unpaged: boolean;
}

export interface PagedUserLogsResponse {
  content: UserLogResponse[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: Pageable;
  size: number;
  sort: PageableSort;
  totalElements: number;
  totalPages: number;
}

export interface UserLogsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
}

// Categorias do Frontend mapeadas para os tipos da API
export type LogCategory = 'all' | 'gifts' | 'coins' | 'items';

export const LOG_TYPE_CATEGORIES: Record<LogCategory, UserLogType[]> = {
  all: [],
  gifts: ['GIFT_SENT', 'GIFT_RECEIVED'],
  coins: ['COINS_SENT', 'COINS_RECEIVED', 'COINS_PURCHASED', 'COINS_REFUNDED'],
  items: ['ITEM_PURCHASED', 'ITEM_REFUNDED', 'ITEM_REMOVED_FROM_STORE'],
};