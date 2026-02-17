// src/hooks/useCheckout.ts

import { useState } from 'react';
import { api } from '../services/api';

interface CheckoutResponse {
  success: boolean;
  checkoutUrl: string;
}

interface CheckoutData {
  planId: string;
  // adicione outros campos necessários
}

export const useCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckout = async (data: CheckoutData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<CheckoutResponse>('/checkouts', data);

      if (response.data.success && response.data.checkoutUrl) {
        // ✅ Redireciona para o Mercado Pago
        window.location.href = response.data.checkoutUrl;
        return response.data;
      } else {
        throw new Error('Falha ao criar checkout');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao processar pagamento';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCheckout,
    isLoading,
    error,
  };
};

export default useCheckout;