// src/services/checkoutService.ts

import api from './api';
import type { CheckoutResponse, PlanType, CoinAmount } from '../types/checkout.type';

// ═══════════════════════════════════════════════════════════
// TIPOS ADICIONAIS
// ═══════════════════════════════════════════════════════════

export interface ChangeSlugResponse {
  status: string;
  message: string;
}

export interface ChangeSlugRequest {
  slug: string;
}

class CheckoutService {
  // ═══════════════════════════════════════════════════════════
  // CONTROLE DE REQUISIÇÕES DUPLICADAS
  // ═══════════════════════════════════════════════════════════

  private pendingRequests = new Map<string, Promise<any>>();

  private getRequestKey(endpoint: string): string {
    return `checkout:${endpoint}`;
  }

  private cleanupRequest(key: string): void {
    setTimeout(() => {
      this.pendingRequests.delete(key);
    }, 100);
  }

  // ═══════════════════════════════════════════════════════════
  // CHECKOUT DE PLANOS
  // ═══════════════════════════════════════════════════════════

  async checkoutPlanMonthly(): Promise<CheckoutResponse> {
    const key = this.getRequestKey('plan-monthly');

    const existingRequest = this.pendingRequests.get(key);
    if (existingRequest) {
      console.log('[CheckoutService] Requisição duplicada detectada, reutilizando...');
      return existingRequest;
    }

    console.log('[CheckoutService] Criando checkout do plano mensal...');

    const request = api
      .post<CheckoutResponse>('/checkout/plan-monthly')
      .then((response) => {
        this.cleanupRequest(key);
        console.log('[CheckoutService] Checkout mensal criado:', response.data);
        return response.data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        console.error('[CheckoutService] Erro no checkout mensal:', error);
        throw this.handleError(error);
      });

    this.pendingRequests.set(key, request);
    return request;
  }

  async checkoutPlanAnnual(): Promise<CheckoutResponse> {
    const key = this.getRequestKey('plan-annual');

    const existingRequest = this.pendingRequests.get(key);
    if (existingRequest) {
      console.log('[CheckoutService] Requisição duplicada detectada, reutilizando...');
      return existingRequest;
    }

    console.log('[CheckoutService] Criando checkout do plano anual...');

    const request = api
      .post<CheckoutResponse>('/checkout/plan-annual')
      .then((response) => {
        this.cleanupRequest(key);
        console.log('[CheckoutService] Checkout anual criado:', response.data);
        return response.data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        console.error('[CheckoutService] Erro no checkout anual:', error);
        throw this.handleError(error);
      });

    this.pendingRequests.set(key, request);
    return request;
  }

  async checkoutPlan(planType: PlanType): Promise<CheckoutResponse> {
    switch (planType) {
      case 'plan-monthly':
        return this.checkoutPlanMonthly();
      case 'plan-annual':
        return this.checkoutPlanAnnual();
      default:
        throw new Error('Tipo de plano inválido');
    }
  }

  // ═══════════════════════════════════════════════════════════
  // CHECKOUT DE MOEDAS
  // ═══════════════════════════════════════════════════════════

  async checkoutCoins(amount: CoinAmount): Promise<CheckoutResponse> {
    const validAmounts: CoinAmount[] = ['300', '900', '1800', '3600'];
    
    if (!validAmounts.includes(amount)) {
      throw new Error('Quantidade de moedas inválida. Valores aceitos: 300, 900, 1800, 3600');
    }

    const key = this.getRequestKey(`coins-${amount}`);

    const existingRequest = this.pendingRequests.get(key);
    if (existingRequest) {
      console.log('[CheckoutService] Requisição duplicada detectada, reutilizando...');
      return existingRequest;
    }

    console.log(`[CheckoutService] Criando checkout de ${amount} moedas...`);

    const request = api
      .post<CheckoutResponse>(`/checkout/coins/${amount}`)
      .then((response) => {
        this.cleanupRequest(key);
        console.log('[CheckoutService] Checkout de moedas criado:', response.data);
        return response.data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        console.error('[CheckoutService] Erro no checkout de moedas:', error);
        throw this.handleError(error);
      });

    this.pendingRequests.set(key, request);
    return request;
  }

  // ═══════════════════════════════════════════════════════════
  // TROCA DE SLUG
  // ═══════════════════════════════════════════════════════════

  /**
   * Altera o slug (URL) do perfil do usuário
   * PUT /user/store/slug
   */
  async changeSlug(newSlug: string): Promise<ChangeSlugResponse> {
    const key = this.getRequestKey('change-slug');

    const existingRequest = this.pendingRequests.get(key);
    if (existingRequest) {
      console.log('[CheckoutService] Requisição duplicada detectada, reutilizando...');
      return existingRequest;
    }

    console.log('[CheckoutService] Alterando slug para:', newSlug);

    const request = api
      .put<ChangeSlugResponse>('/user/store/slug', { slug: newSlug })
      .then((response) => {
        this.cleanupRequest(key);
        console.log('[CheckoutService] Slug alterado:', response.data);
        return response.data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        console.error('[CheckoutService] Erro ao alterar slug:', error);
        throw this.handleSlugError(error);
      });

    this.pendingRequests.set(key, request);
    return request;
  }

  // ═══════════════════════════════════════════════════════════
  // UTILITÁRIOS
  // ═══════════════════════════════════════════════════════════

  redirectToCheckout(checkoutUrl: string): void {
    console.log('[CheckoutService] Redirecionando para:', checkoutUrl);
    window.location.href = checkoutUrl;
  }

  async processCheckoutAndRedirect(
    type: 'plan' | 'coins',
    identifier: PlanType | CoinAmount
  ): Promise<void> {
    let response: CheckoutResponse;

    if (type === 'plan') {
      response = await this.checkoutPlan(identifier as PlanType);
    } else {
      response = await this.checkoutCoins(identifier as CoinAmount);
    }

    if (response.success && response.checkoutUrl) {
      this.redirectToCheckout(response.checkoutUrl);
    } else {
      throw new Error(response.error || 'Erro ao criar checkout');
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          return new Error('Você precisa estar logado para fazer uma compra');
        case 403:
          return new Error('Você não tem permissão para realizar esta ação');
        case 400:
          return new Error(data?.error || 'Dados inválidos');
        case 500:
          return new Error('Erro interno do servidor. Tente novamente mais tarde.');
        default:
          return new Error(data?.error || 'Erro ao processar checkout');
      }
    }

    if (error.request) {
      return new Error('Sem resposta do servidor. Verifique sua conexão.');
    }

    return new Error(error.message || 'Erro desconhecido');
  }

  private handleSlugError(error: any): Error {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          return new Error('Você precisa estar logado para alterar sua URL');
        case 403:
          return new Error('Você não tem permissão para alterar a URL. Verifique se possui moedas suficientes.');
        case 400:
          return new Error(data?.message || data?.error || 'URL inválida ou já está em uso');
        case 409:
          return new Error('Esta URL já está sendo usada por outro usuário');
        case 500:
          return new Error('Erro interno do servidor. Tente novamente mais tarde.');
        default:
          return new Error(data?.message || data?.error || 'Erro ao alterar URL');
      }
    }

    if (error.request) {
      return new Error('Sem resposta do servidor. Verifique sua conexão.');
    }

    return new Error(error.message || 'Erro desconhecido');
  }

  clearPendingRequests(): void {
    this.pendingRequests.clear();
    console.log('[CheckoutService] Cache de requisições limpo');
  }
}

export const checkoutService = new CheckoutService();
export default checkoutService;