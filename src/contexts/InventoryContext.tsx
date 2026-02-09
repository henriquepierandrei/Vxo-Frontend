// src/contexts/InventoryContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useAuth } from "../hooks/useAuth";
import inventoryService, {
  type InventoryItemResponse,
  type GiftResponse,
  type UserInventoryResponse,
  ItemType,
} from "../services/inventoryService";

// ═══════════════════════════════════════════════════════════
// MAPPED TYPES (Frontend com campos extras)
// ═══════════════════════════════════════════════════════════

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type ItemStatus = "active" | "inactive" | "expired";

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  type: "frame" | "badge" | "effect" | "gift";
  
  // Agora vem do backend
  rarity: Rarity;
  status: ItemStatus;
  isLimited: boolean;
  isPremium: boolean;
  obtainedAt: Date;
  expiresAt?: Date;
  isNew?: boolean;
  isEquipped?: boolean;
}

export interface PendingGift {
  id: string;
  fromUserId: string;
  fromUsername: string;
  fromUserProfilePicture: string;
  
  // Item
  itemId?: string;
  itemName?: string;
  itemDescription?: string;
  itemUrl?: string;
  itemType?: "frame" | "badge" | "effect" | "gift";
  
  // Coins
  hasCoinOffered: boolean;
  amountCoinsOffered?: number;
  
  isLimited?: boolean;
  isPremium?: boolean;
  rarity: Rarity;
  sentAt: Date;
  message?: string;
}

// ═══════════════════════════════════════════════════════════
// CONTEXT DATA
// ═══════════════════════════════════════════════════════════

interface InventoryContextData {
  items: InventoryItem[];
  pendingGifts: PendingGift[];
  unviewedGiftsCount: number;
  isLoadingInventory: boolean;
  
  refreshInventory: () => Promise<void>;
  markGiftAsViewed: (giftId: string) => Promise<void>;
  markAllGiftsAsViewed: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Mapeia o tipo de item do backend para o frontend
 */
function mapItemType(backendType: ItemType): "frame" | "badge" | "effect" | "gift" {
  const mapping: Record<ItemType, "frame" | "badge" | "effect" | "gift"> = {
    [ItemType.FRAME]: "frame",
    [ItemType.BADGE]: "badge",
    [ItemType.EFFECT]: "effect",
    [ItemType.GIFT]: "gift",
  };
  return mapping[backendType];
}

/**
 * ✅ NOVO: Normaliza a raridade que vem do backend
 * Garante que sempre retorna um valor válido do tipo Rarity
 */
function normalizeRarity(backendRarity?: string): Rarity {
  if (!backendRarity) return "common";
  
  const normalized = backendRarity.toLowerCase().trim();
  
  // Valida se é uma raridade válida
  const validRarities: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary"];
  
  if (validRarities.includes(normalized as Rarity)) {
    return normalized as Rarity;
  }
  
  // Fallback para common se o valor for inválido
  console.warn(`[InventoryContext] Raridade inválida recebida: "${backendRarity}". Usando "common" como fallback.`);
  return "common";
}

/**
 * ✅ ATUALIZADO: Derivar raridade baseado em flags (fallback)
 * Usado apenas quando itemRarity não vem do backend
 */
function deriveRarityFromFlags(isPremium: boolean, isLimited: boolean): Rarity {
  if (isPremium && isLimited) return "legendary";
  if (isPremium) return "epic";
  if (isLimited) return "rare";
  return "common";
}

/**
 * ✅ ATUALIZADO: Mapeia item do backend para o frontend
 */
function mapToInventoryItem(raw: InventoryItemResponse): InventoryItem {
  const obtainedAt = new Date(raw.acquiredAt);
  const isNew = Date.now() - obtainedAt.getTime() < 7 * 24 * 60 * 60 * 1000; // 7 dias

  // ✅ Prioriza itemRarity do backend, mas tem fallback
  const rarity = raw.itemRarity 
    ? normalizeRarity(raw.itemRarity)
    : deriveRarityFromFlags(raw.isPremium, raw.isLimited);

  return {
    id: raw.itemId,
    name: raw.itemName,
    description: raw.itemDescription,
    imageUrl: raw.itemUrl,
    type: mapItemType(raw.itemType),
    rarity, // ✅ Agora vem do backend
    status: "active", // TODO: Adicionar lógica de expiração se necessário
    isLimited: raw.isLimited,
    isPremium: raw.isPremium,
    obtainedAt,
    isNew,
    isEquipped: false, // TODO: Adicionar endpoint para isso ou derivar
  };
}

/**
 * ✅ ATUALIZADO: Mapeia presente do backend para o frontend
 */
function mapToPendingGift(raw: GiftResponse): PendingGift {
  // ✅ Para presentes, usa fallback de raridade baseado em flags
  // porque nem sempre terá itemRarity (pode ser só moedas)
  const rarity = deriveRarityFromFlags(
    raw.isPremium || false, 
    raw.isLimited || false
  );

  return {
    id: raw.giftId,
    fromUserId: raw.fromUserId,
    fromUsername: raw.fromUsername,
    fromUserProfilePicture: raw.fromUserProfilePicture,
    
    itemId: raw.itemId,
    itemName: raw.itemName,
    itemDescription: raw.itemDescription,
    itemUrl: raw.itemUrl,
    itemType: raw.itemType ? mapItemType(raw.itemType) : undefined,
    
    hasCoinOffered: raw.hasCoinOffered,
    amountCoinsOffered: raw.amountCoinsOffered,
    
    isLimited: raw.isLimited,
    isPremium: raw.isPremium,
    rarity, // ✅ Derivado das flags
    sentAt: new Date(raw.createdAt),
    message: undefined, // Backend não tem esse campo ainda
  };
}

// ═══════════════════════════════════════════════════════════
// CONTEXT PROVIDER
// ═══════════════════════════════════════════════════════════

const InventoryContext = createContext<InventoryContextData>(
  {} as InventoryContextData
);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [pendingGifts, setPendingGifts] = useState<PendingGift[]>([]);
  const [unviewedGiftsCount, setUnviewedGiftsCount] = useState(0);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  // ✅ Controle de fetch
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  // ── Fetch inventário completo ────────────────────────────
  const fetchInventory = useCallback(async (force = false) => {
    if (isFetchingRef.current) {
      console.log("[InventoryContext] Fetch já em andamento");
      return;
    }

    if (hasFetchedRef.current && !force) {
      console.log("[InventoryContext] Já carregado");
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoadingInventory(true);

      console.log("[InventoryContext] Buscando inventário...");
      const data = await inventoryService.getUserInventory();

      // ✅ Mapeia os items com a nova lógica de raridade
      const mappedItems = data.items.map(mapToInventoryItem);
      const mappedGifts = data.unviewedGifts.map(mapToPendingGift);

      setItems(mappedItems);
      setPendingGifts(mappedGifts);
      setUnviewedGiftsCount(data.unviewedGiftsCount);
      hasFetchedRef.current = true;

      console.log("[InventoryContext] Inventário carregado:", {
        items: mappedItems.length,
        gifts: mappedGifts.length,
        itemsWithRarity: mappedItems.map(i => ({ name: i.name, rarity: i.rarity })),
      });
    } catch (error) {
      console.error("[InventoryContext] Erro ao carregar inventário:", error);
      setItems([]);
      setPendingGifts([]);
      setUnviewedGiftsCount(0);
    } finally {
      setIsLoadingInventory(false);
      isFetchingRef.current = false;
    }
  }, []);

  // ── Refresh forçado ──────────────────────────────────────
  const refreshInventory = useCallback(async () => {
    await fetchInventory(true);
  }, [fetchInventory]);

  // ── Marcar presente como visto ───────────────────────────
  const markGiftAsViewed = useCallback(async (giftId: string) => {
    try {
      await inventoryService.markGiftAsViewed(giftId);

      // Remove da lista local
      setPendingGifts((prev) => prev.filter((g) => g.id !== giftId));
      setUnviewedGiftsCount((prev) => Math.max(0, prev - 1));
      
      // Recarrega items para incluir o novo item
      await fetchInventory(true);
    } catch (error) {
      console.error("[InventoryContext] Erro ao marcar presente:", error);
      throw error;
    }
  }, [fetchInventory]);

  // ── Marcar todos como vistos ─────────────────────────────
  const markAllGiftsAsViewed = useCallback(async () => {
    try {
      await inventoryService.markAllGiftsAsViewed();

      setPendingGifts([]);
      setUnviewedGiftsCount(0);
      
      // Recarrega items
      await fetchInventory(true);
    } catch (error) {
      console.error("[InventoryContext] Erro ao marcar todos:", error);
      throw error;
    }
  }, [fetchInventory]);

  // ── Carregar quando user mudar ──────────────────────────
  useEffect(() => {
    const currentUserId = user?.id || null;

    if (currentUserId !== lastUserIdRef.current) {
      lastUserIdRef.current = currentUserId;
      hasFetchedRef.current = false;

      if (currentUserId) {
        fetchInventory();
      } else {
        // Logout - limpar
        setItems([]);
        setPendingGifts([]);
        setUnviewedGiftsCount(0);
      }
    }
  }, [user?.id, fetchInventory]);

  return (
    <InventoryContext.Provider
      value={{
        items,
        pendingGifts,
        unviewedGiftsCount,
        isLoadingInventory,
        refreshInventory,
        markGiftAsViewed,
        markAllGiftsAsViewed,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => {
  const context = useContext(InventoryContext);

  if (!context || Object.keys(context).length === 0) {
    throw new Error("useInventory deve ser usado dentro de um InventoryProvider");
  }

  return context;
};