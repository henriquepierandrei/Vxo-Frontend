// src/services/inventoryService.ts
import api from './api';
import type { DefaultResponse } from '../types/authtypes/auth.types';

// ═══════════════════════════════════════════════════════════
// TYPES - Matching Backend DTOs
// ═══════════════════════════════════════════════════════════

export const ItemType = {
  FRAME: 'FRAME',
  BADGE: 'BADGE',
  EFFECT: 'EFFECT',
  GIFT: 'GIFT',
} as const;

// Create a type from the object values
export type ItemType = typeof ItemType[keyof typeof ItemType];

// inventoryService.ts
export interface InventoryItemResponse {
  itemId: string;
  itemName: string;
  itemRarity: string;
  itemDescription: string;
  itemUrl: string;
  itemType: ItemType;
  isLimited: boolean;
  isPremium: boolean;
  acquiredAt: string;
}

export interface GiftResponse {
  giftId: string;
  fromUserId: string;
  fromUrlName: string;
  fromUserProfilePicture: string;
  
  // Item details (if present)
  itemId?: string;
  itemName?: string;
  itemDescription?: string;
  itemUrl?: string;
  itemType?: ItemType;
  isLimited?: boolean;
  isPremium?: boolean;
  
  // Coin details (if present)
  hasCoinOffered: boolean;
  amountCoinsOffered?: number;
  
  firstViewed: boolean;
  createdAt: string; // ISO date string
}

export interface UserInventoryResponse {
  items: InventoryItemResponse[];
  unviewedGifts: GiftResponse[];
  unviewedGiftsCount: number;
}

// ═══════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════

class InventoryService {
  
  // ✅ Buscar inventário completo (itens + presentes não visualizados)
  async getUserInventory(): Promise<UserInventoryResponse> {
    const response = await api.get<UserInventoryResponse>('/user/inventory');
    return response.data;
  }

  // ✅ Buscar apenas itens (sem presentes)
  async getUserItems(): Promise<InventoryItemResponse[]> {
    const response = await api.get<InventoryItemResponse[]>('/user/inventory/items');
    return response.data;
  }

  // ✅ Marcar presente como visualizado
  async markGiftAsViewed(giftId: string): Promise<DefaultResponse> {
    const response = await api.put<DefaultResponse>(
      `/user/inventory/gifts/${giftId}/mark-viewed`
    );
    return response.data;
  }

  // ✅ Marcar todos os presentes como visualizados
  async markAllGiftsAsViewed(): Promise<DefaultResponse> {
    const response = await api.put<DefaultResponse>(
      '/user/inventory/gifts/mark-all-viewed'
    );
    return response.data;
  }
}

export const inventoryService = new InventoryService();
export default inventoryService;