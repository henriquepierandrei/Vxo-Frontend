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
  clearError: () => void;
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

const determineRarity = (item: APIStoreItem): ItemRarity => {
  if (item.limited && item.isPremium) return 'legendary';
  if (item.limited) return 'epic';
  if (item.isPremium) return 'rare';
  if (item.itemPrice >= 4000) return 'epic';
  if (item.itemPrice >= 2000) return 'rare';
  return 'common';
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

  switch (type) {
    case 'badge':
      svgUrl = apiItem.itemUrl.startsWith('http') 
        ? apiItem.itemUrl 
        : `https://vxo.lat/${apiItem.itemUrl}`;
      break;
    case 'frame':
      imageUrl = apiItem.itemUrl;
      break;
    case 'effect':
      videoUrl = apiItem.itemUrl;
      break;
    case 'bundle':
      imageUrl = apiItem.itemUrl;
      break;
  }

  return {
    id: apiItem.id,
    name: apiItem.itemName,
    description: apiItem.itemDescription,
    type,
    rarity: determineRarity(apiItem),
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
  
  // ✅ Refs para controlar requests duplicados
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);
  
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('store_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Salvar favoritos no localStorage
  useEffect(() => {
    localStorage.setItem('store_favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  // ═══════════════════════════════════════════════════════════
  // FETCH STORE ITEMS (com proteção contra duplicados)
  // ═══════════════════════════════════════════════════════════

  const fetchStoreItems = useCallback(async (force = false) => {
    // ✅ Evita requests duplicados
    if (isFetchingRef.current) {
      console.log('[Store] Request já em andamento, ignorando...');
      return;
    }

    // ✅ Se já carregou e não é forçado, não refaz
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
      const currentFavorites = JSON.parse(localStorage.getItem('store_favorites') || '[]');

      const transformedItems = apiItems
        .filter(item => item.isActive)
        .map(item => transformAPIItem(item, alreadyOwnedItemIds, currentEquippedIds, currentFavorites));

      setItems(transformedItems);

      if (coins !== undefined) {
        setUserCoins(coins);
      }

      // ✅ Marca como carregado
      hasFetchedRef.current = true;
      
      console.log('[Store] Dados carregados com sucesso!');

    } catch (err: any) {
      console.error('[Store] Erro ao carregar itens:', err);
      setStoreError(err.response?.data?.message || 'Erro ao carregar itens da loja. Tente novamente.');
    } finally {
      setIsLoadingStore(false);
      isFetchingRef.current = false;
    }
  }, [equippedIds]);

  // ═══════════════════════════════════════════════════════════
  // REFRESH STORE (força novo request)
  // ═══════════════════════════════════════════════════════════

  const refreshStore = useCallback(async () => {
    console.log('[Store] Refresh forçado...');
    await fetchStoreItems(true); // ✅ força = true
  }, [fetchStoreItems]);

  // ═══════════════════════════════════════════════════════════
  // PURCHASE ITEM
  // ═══════════════════════════════════════════════════════════

  const purchaseItem = useCallback(async (itemId: string) => {
    try {
      const response = await api.post(`/user/store/purchase/${itemId}`);

      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, isOwned: true } : item
      ));

      if (response.data?.userCoins !== undefined) {
        setUserCoins(response.data.userCoins);
      } else if (response.data?.remainingCoins !== undefined) {
        setUserCoins(response.data.remainingCoins);
      } else {
        const item = items.find(i => i.id === itemId);
        if (item) {
          const finalPrice = item.discount 
            ? Math.floor(item.price * (1 - item.discount / 100)) 
            : item.price;
          setUserCoins(prev => prev - finalPrice);
        }
      }

    } catch (err: any) {
      console.error('Erro ao comprar item:', err);
      throw err;
    }
  }, [items]);

  // ═══════════════════════════════════════════════════════════
  // EQUIP ITEM
  // ═══════════════════════════════════════════════════════════

  const equipItem = useCallback(async (itemId: string) => {
    try {
      await api.post(`/user/store/equip/${itemId}`);

      const item = items.find(i => i.id === itemId);
      if (item) {
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

    } catch (err: any) {
      console.error('Erro ao equipar item:', err);
      throw err;
    }
  }, [items]);

  // ═══════════════════════════════════════════════════════════
  // UNEQUIP ITEM
  // ═══════════════════════════════════════════════════════════

  const unequipItem = useCallback(async (itemId: string) => {
    try {
      await api.post(`/user/store/unequip/${itemId}`);

      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, isEquipped: false } : item
      ));

      setEquippedIds(prev => prev.filter(id => id !== itemId));

    } catch (err: any) {
      console.error('Erro ao desequipar item:', err);
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
  // INITIAL LOAD - ✅ CORRIGIDO
  // ═══════════════════════════════════════════════════════════

  useEffect(() => {
    // ✅ Só faz o request se ainda não fez
    if (!hasFetchedRef.current) {
      fetchStoreItems();
    }
  }, []); // ✅ Array vazio - roda só 1x

  return (
    <StoreContext.Provider
      value={{
        items,
        userCoins,
        isLoadingStore,
        storeError,
        refreshStore,
        purchaseItem,
        equipItem,
        unequipItem,
        toggleFavorite,
        clearError,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContext;