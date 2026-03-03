// LinksContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface UserLinkResponse {
  linkId: string;
  url: string;
  hasLinkTyped: boolean;
  linkTypeId: number | null;
  linkText: string; // Texto extraído do link
}

interface UserLinksResponse {
  links: UserLinkResponse[];
}

export interface UserLink {
  id: string;
  url: string;
  domain: string;
  favicon: string;
  hasLinkTyped: boolean;
  linkTypeId: number | null;
  linkText: string; // Texto extraído do link
}

interface LinksContextData {
  links: UserLink[];
  rawLinks: UserLinkResponse[];
  isLoadingLinks: boolean;
  refreshLinks: () => Promise<void>;
  addLink: (url: string, typeId?: number, linkText?: string) => Promise<void>;
  updateLink: (linkId: string, url?: string, typeId?: number, linkText?: string ) => Promise<void>;
  deleteLink: (linkId: string) => Promise<void>;
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function getFavicon(url: string): string {
  const domain = extractDomain(url);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

function mapToUserLink(raw: UserLinkResponse): UserLink {
  return {
    id: raw.linkId,
    url: raw.url,
    domain: extractDomain(raw.url),
    favicon: getFavicon(raw.url),
    hasLinkTyped: raw.hasLinkTyped,
    linkTypeId: raw.linkTypeId,
    linkText: raw.linkText, // ← estava faltando isso
  };
}

// ═══════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════

const LinksContext = createContext<LinksContextData>({} as LinksContextData);

export function LinksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [rawLinks, setRawLinks] = useState<UserLinkResponse[]>([]);
  const [links, setLinks] = useState<UserLink[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);

  // ✅ Refs para controlar o fetch
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  // ── Fetch todos os links ─────────────────────────────────
  const fetchLinks = useCallback(async (force = false) => {
    // ✅ Evitar múltiplas requisições simultâneas
    if (isFetchingRef.current) {
      console.log("[LinksContext] Fetch já em andamento, ignorando...");
      return;
    }

    // ✅ Se já carregou e não é forçado, não buscar novamente
    if (hasFetchedRef.current && !force) {
      console.log("[LinksContext] Já carregou, ignorando...");
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoadingLinks(true);

      console.log("[LinksContext] Buscando links...");
      const response = await api.get<UserLinksResponse>("/user/links");
      const data = response.data.links ?? [];

      setRawLinks(data);
      setLinks(data.map(mapToUserLink));
      hasFetchedRef.current = true;

      console.log("[LinksContext] Links carregados:", data.length);
    } catch (error) {
      console.error("Erro ao carregar links:", error);
      setRawLinks([]);
      setLinks([]);
    } finally {
      setIsLoadingLinks(false);
      isFetchingRef.current = false;
    }
  }, []);

  // ── Refresh forçado (para o botão de refresh) ───────────
  const refreshLinks = useCallback(async () => {
    await fetchLinks(true); // força o refresh
  }, [fetchLinks]);

  // ── Carregar quando user mudar ──────────────────────────
  useEffect(() => {
    const currentUserId = user?.id || null;

    // Se o usuário mudou (login/logout diferente)
    if (currentUserId !== lastUserIdRef.current) {
      lastUserIdRef.current = currentUserId;
      hasFetchedRef.current = false; // Reset para novo usuário

      if (currentUserId) {
        // Novo usuário logado - buscar links
        fetchLinks();
      } else {
        // Logout - limpar dados
        setRawLinks([]);
        setLinks([]);
      }
    }
  }, [user?.id, fetchLinks]);

  // ── Adicionar link ─────────────────────────────────────
  const addLink = useCallback(
    async (url: string, typeId?: number, linkText?: string) => { // ← adicionar linkText
      const params = new URLSearchParams();
      params.append("url", url);
      if (typeId !== undefined) {
        params.append("typeId", typeId.toString());
      }
      if (linkText !== undefined) {
        params.append("linkText", linkText);
      }

      await api.post(`/user/links?${params.toString()}`);
      await fetchLinks(true);
    },
    [fetchLinks]
  );

  // ── Atualizar link ─────────────────────────────────────
  const updateLink = useCallback(
    async (linkId: string, url?: string, typeId?: number, linkText?: string) => { // ← adicionar linkText
      const params = new URLSearchParams();
      if (url) params.append("url", url);
      if (typeId !== undefined) params.append("typeId", typeId.toString());
      if (linkText !== undefined) params.append("linkText", linkText); // ← adicionar

      await api.put(`/user/links/${linkId}?${params.toString()}`);

      setRawLinks((prev) =>
        prev.map((link) =>
          link.linkId === linkId
            ? {
              ...link,
              ...(url && { url }),
              ...(linkText !== undefined && { linkText }), // ← adicionar
              ...(typeId !== undefined && {
                linkTypeId: typeId,
                hasLinkTyped: true,
              }),
            }
            : link
        )
      );

      setLinks((prev) =>
        prev.map((link) =>
          link.id === linkId
            ? {
              ...link,
              ...(url && {
                url,
                domain: extractDomain(url),
                favicon: getFavicon(url),
              }),
              ...(linkText !== undefined && { linkText }), // ← adicionar
              ...(typeId !== undefined && {
                linkTypeId: typeId,
                hasLinkTyped: true,
              }),
            }
            : link
        )
      );
    },
    []
  );
  // ── Deletar link ───────────────────────────────────────
  const deleteLink = useCallback(async (linkId: string) => {
    await api.delete(`/user/links/${linkId}`);

    // Remove localmente
    setRawLinks((prev) => prev.filter((link) => link.linkId !== linkId));
    setLinks((prev) => prev.filter((link) => link.id !== linkId));
  }, []);

  return (
    <LinksContext.Provider
      value={{
        links,
        rawLinks,
        isLoadingLinks,
        refreshLinks,
        addLink,
        updateLink,
        deleteLink,
      }}
    >
      {children}
    </LinksContext.Provider>
  );
}

export const useLinks = () => {
  const context = useContext(LinksContext);

  if (!context || Object.keys(context).length === 0) {
    throw new Error("useLinks deve ser usado dentro de um LinksProvider");
  }

  return context;
};