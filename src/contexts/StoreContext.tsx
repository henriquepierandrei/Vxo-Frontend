// contexts/StoreContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import api from '../services/api';

// ═══════════════════════════════════════════════════════════
// TIPOS DA API
// ═══════════════════════════════════════════════════════════

interface APIStoreItem {
  id: string;
  itemUrl: string;
  itemName: string;
  itemDescription: string;
  itemRarity: string | null; // ✅ Adicionado - vem da API
  itemType: 'BADGE' | 'FRAME' | 'EFFECT' | 'BUNDLE';
  itemPrice: number;
  limited: boolean;
  itemQuantityAvailable: number | null;
  discount: number;
  isPremium: boolean;
  isActive: boolean;
}

interface APIStoreResponse {
  items: APIStoreItem[];
  alreadyOwnedItemIds: string[];
  equippedItemIds?: string[];
  userCoins?: number;
}

// ═══════════════════════════════════════════════════════════
// TIPOS DE PRESENTE
// ═══════════════════════════════════════════════════════════

export interface SendGiftRequest {
  toUserUrlName: string;
  itemId?: string;
  coinsAmount?: number;
  message: string;
}

export interface SendGiftResponse {
  success: boolean;
  message: string;
  remainingCoins?: number;
}

// ═══════════════════════════════════════════════════════════
// TIPOS DO FRONTEND
// ═══════════════════════════════════════════════════════════

export type StoreItemType = 'badge' | 'frame' | 'effect' | 'bundle';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  type: StoreItemType;
  rarity: ItemRarity;
  price: number;
  svgUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  isOwned: boolean;
  isEquipped: boolean;
  isFavorite: boolean;
  isLimited: boolean;
  discount?: number;
  quantityAvailable?: number | null;
  isPremium: boolean;
}

interface StoreContextType {
  items: StoreItem[];
  userCoins: number;
  isLoadingStore: boolean;
  storeError: string | null;
  refreshStore: () => Promise<void>;
  purchaseItem: (itemId: string) => Promise<void>;
  equipItem: (itemId: string) => Promise<void>;
  unequipItem: (itemId: string) => Promise<void>;
  toggleFavorite: (itemId: string) => void;
  sendGift: (request: SendGiftRequest) => Promise<SendGiftResponse>;
  clearError: () => void;
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Normaliza a raridade vinda da API
 * Se for null/undefined, retorna 'common'
 */
const normalizeRarity = (apiRarity: string | null | undefined): ItemRarity => {
  if (!apiRarity) return 'common';
  
  const normalized = apiRarity.toLowerCase().trim();
  
  switch (normalized) {
    case 'legendary':
    case 'lendario':
    case 'lendária':
      return 'legendary';
    case 'epic':
    case 'epico':
    case 'épico':
      return 'epic';
    case 'rare':
    case 'raro':
      return 'rare';
    case 'common':
    case 'comum':
    default:
      return 'common';
  }
};

/**
 * Determina a raridade com base nos atributos do item
 * Usado como fallback se a API não enviar itemRarity
 */
const determineRarityFallback = (item: APIStoreItem): ItemRarity => {
  if (item.limited && item.isPremium) return 'legendary';
  if (item.limited) return 'epic';
  if (item.isPremium) return 'rare';
  if (item.itemPrice >= 4000) return 'epic';
  if (item.itemPrice >= 2000) return 'rare';
  return 'common';
};

/**
 * Obtém a raridade do item - prioriza API, usa fallback se necessário
 */
const getRarity = (item: APIStoreItem): ItemRarity => {
  // Se a API enviar itemRarity, usa ela
  if (item.itemRarity) {
    return normalizeRarity(item.itemRarity);
  }
  // Caso contrário, calcula baseado nos atributos
  return determineRarityFallback(item);
};

const mapItemType = (apiType: string): StoreItemType => {
  const typeMap: Record<string, StoreItemType> = {
    'BADGE': 'badge',
    'FRAME': 'frame',
    'EFFECT': 'effect',
    'BUNDLE': 'bundle',
  };
  return typeMap[apiType] || 'badge';
};

const transformAPIItem = (
  apiItem: APIStoreItem,
  ownedIds: string[],
  equippedIds: string[],
  favoriteIds: string[]
): StoreItem => {
  const type = mapItemType(apiItem.itemType);

  let svgUrl: string | undefined;
  let imageUrl: string | undefined;
  let videoUrl: string | undefined;

  // Normaliza a URL base
  const baseUrl = 'https://vxo.lat/';
  const itemUrl = apiItem.itemUrl?.startsWith('http') 
    ? apiItem.itemUrl 
    : `${baseUrl}${apiItem.itemUrl}`;

  switch (type) {
    case 'badge':
      svgUrl = itemUrl;
      break;
    case 'frame':
      imageUrl = itemUrl;
      break;
    case 'effect':
      videoUrl = itemUrl;
      break;
    case 'bundle':
      imageUrl = itemUrl;
      break;
  }

  return {
    id: apiItem.id,
    name: apiItem.itemName,
    description: apiItem.itemDescription,
    type,
    rarity: getRarity(apiItem), // ✅ Usa a nova função que considera itemRarity da API
    price: apiItem.itemPrice,
    svgUrl,
    imageUrl,
    videoUrl,
    isOwned: ownedIds.includes(apiItem.id),
    isEquipped: equippedIds.includes(apiItem.id),
    isFavorite: favoriteIds.includes(apiItem.id),
    isLimited: apiItem.limited,
    discount: apiItem.discount > 0 ? apiItem.discount : undefined,
    quantityAvailable: apiItem.itemQuantityAvailable,
    isPremium: apiItem.isPremium,
  };
};

// ═══════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

// ═══════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [isLoadingStore, setIsLoadingStore] = useState<boolean>(true);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [equippedIds, setEquippedIds] = useState<string[]>([]);
  
  // Refs para controlar requests duplicados
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);
  
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('store_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Salvar favoritos no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('store_favorites', JSON.stringify(favoriteIds));
    } catch (error) {
      console.warn('[Store] Erro ao salvar favoritos:', error);
    }
  }, [favoriteIds]);

  // ═══════════════════════════════════════════════════════════
  // FETCH STORE ITEMS
  // ═══════════════════════════════════════════════════════════

  const fetchStoreItems = useCallback(async (force = false) => {
    // Evita requests duplicados
    if (isFetchingRef.current) {
      console.log('[Store] Request já em andamento, ignorando...');
      return;
    }

    // Se já carregou e não é forçado, não refaz
    if (hasFetchedRef.current && !force) {
      console.log('[Store] Dados já carregados, usando cache...');
      return;
    }

    isFetchingRef.current = true;
    setIsLoadingStore(true);
    setStoreError(null);

    try {
      console.log('[Store] Fazendo request para /user/store...');
      
      const response = await api.get<APIStoreResponse>('/user/store');
      const { items: apiItems, alreadyOwnedItemIds, equippedItemIds, userCoins: coins } = response.data;

      const currentEquippedIds = equippedItemIds || equippedIds;
      if (equippedItemIds) {
        setEquippedIds(equippedItemIds);
      }

      // Pegar favoritos atuais do localStorage
      let currentFavorites: string[] = [];
      try {
        currentFavorites = JSON.parse(localStorage.getItem('store_favorites') || '[]');
      } catch {
        currentFavorites = [];
      }

      const transformedItems = apiItems
        .filter(item => item.isActive)
        .map(item => transformAPIItem(item, alreadyOwnedItemIds, currentEquippedIds, currentFavorites));

      setItems(transformedItems);

      if (coins !== undefined) {
        setUserCoins(coins);
      }

      // Marca como carregado
      hasFetchedRef.current = true;
      
      console.log('[Store] Dados carregados com sucesso!', {
        totalItems: transformedItems.length,
        ownedCount: alreadyOwnedItemIds.length,
      });

    } catch (err: any) {
      console.error('[Store] Erro ao carregar itens:', err);
      setStoreError(err.response?.data?.message || 'Erro ao carregar itens da loja. Tente novamente.');
    } finally {
      setIsLoadingStore(false);
      isFetchingRef.current = false;
    }
  }, [equippedIds]);

  // ═══════════════════════════════════════════════════════════
  // REFRESH STORE
  // ═══════════════════════════════════════════════════════════

  const refreshStore = useCallback(async () => {
    console.log('[Store] Refresh forçado...');
    await fetchStoreItems(true);
  }, [fetchStoreItems]);

  // ═══════════════════════════════════════════════════════════
  // PURCHASE ITEM
  // ═══════════════════════════════════════════════════════════

  const purchaseItem = useCallback(async (itemId: string) => {
    try {
      console.log('[Store] Comprando item:', itemId);
      
      const response = await api.post(`/user/store/purchase/${itemId}`);

      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, isOwned: true } : item
      ));

      // Atualiza o saldo de moedas
      if (response.data?.userCoins !== undefined) {
        setUserCoins(response.data.userCoins);
      } else if (response.data?.remainingCoins !== undefined) {
        setUserCoins(response.data.remainingCoins);
      } else {
        // Fallback: calcula localmente
        const item = items.find(i => i.id === itemId);
        if (item) {
          const finalPrice = item.discount 
            ? Math.floor(item.price * (1 - item.discount / 100)) 
            : item.price;
          setUserCoins(prev => Math.max(0, prev - finalPrice));
        }
      }

      console.log('[Store] Item comprado com sucesso!');

    } catch (err: any) {
      console.error('[Store] Erro ao comprar item:', err);
      throw err;
    }
  }, [items]);

  // ═══════════════════════════════════════════════════════════
  // SEND GIFT - ✅ NOVA FUNÇÃO
  // ═══════════════════════════════════════════════════════════

  const sendGift = useCallback(async (request: SendGiftRequest): Promise<SendGiftResponse> => {
    try {
      console.log('[Store] Enviando presente:', {
        to: request.toUserUrlName,
        itemId: request.itemId,
        coinsAmount: request.coinsAmount,
        hasMessage: !!request.message,
      });

      const response = await api.post<SendGiftResponse>('/user/gift/send', request);

      // Atualiza o saldo de moedas se retornado
      if (response.data?.remainingCoins !== undefined) {
        setUserCoins(response.data.remainingCoins);
      } else if (request.itemId) {
        // Fallback: calcula localmente para item
        const item = items.find(i => i.id === request.itemId);
        if (item) {
          const finalPrice = item.discount 
            ? Math.floor(item.price * (1 - item.discount / 100)) 
            : item.price;
          setUserCoins(prev => Math.max(0, prev - finalPrice));
        }
      } else if (request.coinsAmount) {
        // Fallback: calcula localmente para moedas
        setUserCoins(prev => Math.max(0, prev - request.coinsAmount!));
      }

      console.log('[Store] Presente enviado com sucesso!');

      return {
        success: true,
        message: response.data?.message || 'Presente enviado com sucesso!',
        remainingCoins: response.data?.remainingCoins,
      };

    } catch (err: any) {
      console.error('[Store] Erro ao enviar presente:', err);
      
      // Retorna erro formatado
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || 'Erro ao enviar presente. Verifique o nome de usuário e tente novamente.';
      
      throw new Error(errorMessage);
    }
  }, [items]);

  // ═══════════════════════════════════════════════════════════
  // EQUIP ITEM
  // ═══════════════════════════════════════════════════════════

  const equipItem = useCallback(async (itemId: string) => {
    try {
      console.log('[Store] Equipando item:', itemId);
      
      await api.post(`/user/store/equip/${itemId}`);

      const item = items.find(i => i.id === itemId);
      if (item) {
        // Desequipa outros itens do mesmo tipo e equipa o novo
        setItems(prev => prev.map(i => {
          if (i.type === item.type && i.id !== itemId) {
            return { ...i, isEquipped: false };
          }
          if (i.id === itemId) {
            return { ...i, isEquipped: true };
          }
          return i;
        }));

        setEquippedIds(prev => {
          const newIds = prev.filter(id => {
            const existingItem = items.find(i => i.id === id);
            return existingItem?.type !== item.type;
          });
          return [...newIds, itemId];
        });
      }

      console.log('[Store] Item equipado com sucesso!');

    } catch (err: any) {
      console.error('[Store] Erro ao equipar item:', err);
      throw err;
    }
  }, [items]);

  // ═══════════════════════════════════════════════════════════
  // UNEQUIP ITEM
  // ═══════════════════════════════════════════════════════════

  const unequipItem = useCallback(async (itemId: string) => {
    try {
      console.log('[Store] Desequipando item:', itemId);
      
      await api.post(`/user/store/unequip/${itemId}`);

      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, isEquipped: false } : item
      ));

      setEquippedIds(prev => prev.filter(id => id !== itemId));

      console.log('[Store] Item desequipado com sucesso!');

    } catch (err: any) {
      console.error('[Store] Erro ao desequipar item:', err);
      throw err;
    }
  }, []);

  // ═══════════════════════════════════════════════════════════
  // TOGGLE FAVORITE
  // ═══════════════════════════════════════════════════════════

  const toggleFavorite = useCallback((itemId: string) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item
    ));

    setFavoriteIds(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      }
      return [...prev, itemId];
    });
  }, []);

  // ═══════════════════════════════════════════════════════════
  // CLEAR ERROR
  // ═══════════════════════════════════════════════════════════

  const clearError = useCallback(() => {
    setStoreError(null);
  }, []);

  // ═══════════════════════════════════════════════════════════
  // INITIAL LOAD
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchStoreItems();
    }
  }, []);

  // ═══════════════════════════════════════════════════════════
  // PROVIDER VALUE
  // ═══════════════════════════════════════════════════════════

  const contextValue: StoreContextType = {
    items,
    userCoins,
    isLoadingStore,
    storeError,
    refreshStore,
    purchaseItem,
    equipItem,
    unequipItem,
    toggleFavorite,
    sendGift, // ✅ Adicionado
    clearError,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContext;