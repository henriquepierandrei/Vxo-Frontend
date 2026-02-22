// src/hooks/useRanking.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import rankingService from '../services/rankingService';
import type {
  RankingType,
  UserViewsRanking,
  UserCoinsRanking,
  UserVeteranRanking
} from '../types/ranking.types';

type RankingData = UserViewsRanking | UserCoinsRanking | UserVeteranRanking;

interface UseRankingReturn {
  data: RankingData[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  setPage: (page: number) => void;
  refresh: () => void;
}

export function useRanking(type: RankingType, pageSize: number = 20): UseRankingReturn {
  const [data, setData] = useState<RankingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // ─── Calcular página efetiva durante o render ───
  // Quando type muda, a página efetiva é 0 ANTES do state atualizar,
  // evitando fetch com página antiga.
  const prevTypeRef = useRef(type);
  const effectivePage = prevTypeRef.current !== type ? 0 : currentPage;

  // ─── Efeito ÚNICO de fetch ───
  useEffect(() => {
    // Sincroniza o ref do type e reseta a página no state
    if (prevTypeRef.current !== type) {
      prevTypeRef.current = type;
      setCurrentPage(0);
      // Se currentPage já era 0, não haverá re-render extra.
      // Se não era, o setCurrentPage(0) causa re-render,
      // mas effectivePage já é 0, então os deps não mudam → sem re-fetch.
    }

    const controller = new AbortController();
    let active = true;

    setIsLoading(true);
    setError(null);

    rankingService
      .getRanking(type, {
        page: effectivePage,
        size: pageSize,
        signal: controller.signal,
      })
      .then((response) => {
        if (!active) return;
        setData(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!active) return;

        // Ignorar erros de cancelamento (Axios + fetch nativo)
        if (
          err?.name === 'AbortError' ||
          err?.name === 'CanceledError' ||
          err?.code === 'ERR_CANCELED'
        ) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Erro ao carregar ranking');
        setData([]);
        setIsLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [type, effectivePage, pageSize, refreshKey]);

  // ─── Setters ───
  const setPage = useCallback((page: number) => {
    setCurrentPage((prev) => {
      if (page === prev || page < 0) return prev;
      return page;
    });
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return {
    data,
    isLoading,
    error,
    currentPage: effectivePage,
    totalPages,
    totalElements,
    setPage,
    refresh,
  };
}