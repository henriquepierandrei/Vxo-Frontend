import { useLocation } from "react-router-dom";
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
  fromSlug: string;
  fromUserProfilePicture: string;
  itemId?: string;
  itemName?: string;
  itemDescription?: string;
  itemUrl?: string;
  itemType?: "frame" | "badge" | "effect" | "gift";
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
  // ✅ ALTERADO: Agora recebe userIsPremium como parâmetro
  toggleEquipItem: (itemId: string, userIsPremium?: boolean) => Promise<void>;
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function mapItemType(backendType: ItemType): "frame" | "badge" | "effect" | "gift" {
  const mapping: Record<ItemType, "frame" | "badge" | "effect" | "gift"> = {
    [ItemType.FRAME]: "frame",
    [ItemType.BADGE]: "badge",
    [ItemType.EFFECT]: "effect",
    [ItemType.GIFT]: "gift",
  };
  return mapping[backendType];
}

function normalizeRarity(backendRarity?: string): Rarity {
  if (!backendRarity) return "common";
  
  const normalized = backendRarity.toLowerCase().trim();
  const validRarities: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary"];
  
  if (validRarities.includes(normalized as Rarity)) {
    return normalized as Rarity;
  }
  
  console.warn(`[InventoryContext] Raridade inválida: "${backendRarity}". Usando "common".`);
  return "common";
}

function deriveRarityFromFlags(isPremium: boolean, isLimited: boolean): Rarity {
  if (isPremium && isLimited) return "legendary";
  if (isPremium) return "epic";
  if (isLimited) return "rare";
  return "common";
}

function mapToInventoryItem(
  raw: InventoryItemResponse,
  equippedItemIds: Set<string> = new Set()
): InventoryItem {
  const obtainedAt = new Date(raw.acquiredAt);
  const isNew = Date.now() - obtainedAt.getTime() < 7 * 24 * 60 * 60 * 1000;

  const rarity = raw.itemRarity 
    ? normalizeRarity(raw.itemRarity)
    : deriveRarityFromFlags(raw.isPremium, raw.isLimited);

  return {
    id: raw.itemId,
    name: raw.itemName,
    description: raw.itemDescription,
    imageUrl: raw.itemUrl,
    type: mapItemType(raw.itemType),
    rarity,
    status: "active",
    isLimited: raw.isLimited,
    isPremium: raw.isPremium,
    obtainedAt,
    isNew,
    isEquipped: equippedItemIds.has(raw.itemId),
  };
}

function mapToPendingGift(raw: GiftResponse): PendingGift {
  const rarity = deriveRarityFromFlags(
    raw.isPremium || false, 
    raw.isLimited || false
  );

  return {
    id: raw.giftId,
    fromUserId: raw.fromUserId,
    fromSlug: raw.fromSlug,
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
    rarity,
    sentAt: new Date(raw.createdAt),
    message: undefined,
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
  const location = useLocation();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [pendingGifts, setPendingGifts] = useState<PendingGift[]>([]);
  const [unviewedGiftsCount, setUnviewedGiftsCount] = useState(0);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [equippedItemIds, setEquippedItemIds] = useState<Set<string>>(new Set());

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
      
      const [inventoryData, equippedData] = await Promise.all([
        inventoryService.getUserInventory(),
        inventoryService.getEquippedItems(),
      ]);

      const equipped = new Set(equippedData.equipped.map(item => item.id));
      setEquippedItemIds(equipped);

      const mappedItems = inventoryData.items.map(item => 
        mapToInventoryItem(item, equipped)
      );
      const mappedGifts = inventoryData.unviewedGifts.map(mapToPendingGift);

      setItems(mappedItems);
      setPendingGifts(mappedGifts);
      setUnviewedGiftsCount(inventoryData.unviewedGiftsCount);
      hasFetchedRef.current = true;

      console.log("[InventoryContext] Inventário carregado:", {
        items: mappedItems.length,
        gifts: mappedGifts.length,
        equipped: equipped.size,
      });
    } catch (error) {
      console.error("[InventoryContext] Erro ao carregar inventário:", error);
      setItems([]);
      setPendingGifts([]);
      setUnviewedGiftsCount(0);
      setEquippedItemIds(new Set());
    } finally {
      setIsLoadingInventory(false);
      isFetchingRef.current = false;
    }
  }, []);

  // ✅ CORRIGIDO: Toggle equipar/desequipar item
  const toggleEquipItem = useCallback(async (itemId: string, userIsPremium?: boolean) => {
    const currentItem = items.find(i => i.id === itemId);
    
    if (!currentItem) {
      console.error("[InventoryContext] Item não encontrado:", itemId);
      throw new Error("Item não encontrado");
    }

    // ✅ CORRIGIDO: Verifica se o usuário tem permissão
    // Bloqueia apenas se:
    // 1. Item é premium
    // 2. Item NÃO está equipado (permite desequipar)
    // 3. Usuário NÃO é premium
    if (currentItem.isPremium && !currentItem.isEquipped && userIsPremium !== true) {
      console.warn("[InventoryContext] Bloqueado: Usuário não é premium");
      throw new Error("Requer assinatura Premium para equipar este item");
    }
    
    try {
      console.log("[InventoryContext] Equipando/Desequipando item:", itemId, {
        isPremium: currentItem.isPremium,
        isEquipped: currentItem.isEquipped,
        userIsPremium,
      });
      
      const response = await inventoryService.equipItem(itemId);

      const newEquippedIds = new Set(response.equipped.map(item => item.id));
      setEquippedItemIds(newEquippedIds);

      setItems(prevItems =>
        prevItems.map(item => ({
          ...item,
          isEquipped: newEquippedIds.has(item.id),
        }))
      );

      console.log("[InventoryContext] Item atualizado. Equipados:", newEquippedIds.size);
    } catch (error) {
      console.error("[InventoryContext] Erro ao equipar item:", error);
      throw error;
    }
  }, [items]);

  const refreshInventory = useCallback(async () => {
    await fetchInventory(true);
  }, [fetchInventory]);

  const markGiftAsViewed = useCallback(async (giftId: string) => {
    try {
      await inventoryService.markGiftAsViewed(giftId);
      setPendingGifts((prev) => prev.filter((g) => g.id !== giftId));
      setUnviewedGiftsCount((prev) => Math.max(0, prev - 1));
      await fetchInventory(true);
    } catch (error) {
      console.error("[InventoryContext] Erro ao marcar presente:", error);
      throw error;
    }
  }, [fetchInventory]);

  const markAllGiftsAsViewed = useCallback(async () => {
    try {
      await inventoryService.markAllGiftsAsViewed();
      setPendingGifts([]);
      setUnviewedGiftsCount(0);
      await fetchInventory(true);
    } catch (error) {
      console.error("[InventoryContext] Erro ao marcar todos:", error);
      throw error;
    }
  }, [fetchInventory]);

  useEffect(() => {
    const currentUserId = user?.id || null;
    const isInventoryPage = location.pathname === "/dashboard/inventory" 
      || location.pathname.startsWith("/dashboard/inventory/");

    if (!isInventoryPage) {
      return;
    }

    if (currentUserId !== lastUserIdRef.current) {
      lastUserIdRef.current = currentUserId;
      hasFetchedRef.current = false;
    }

    if (currentUserId && !hasFetchedRef.current) {
      fetchInventory();
    }
  }, [user?.id, location.pathname, fetchInventory]);

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
        toggleEquipItem,
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