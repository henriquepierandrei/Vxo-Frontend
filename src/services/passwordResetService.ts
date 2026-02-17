// src/services/passwordResetService.ts
import api from './api';

export interface ResetPasswordConfirmRequest {
  token: string;
  newPassword: string;
}

export const passwordResetService = {
  /**
   * Solicita envio de email de recuperação de senha
   * POST /public/reset-password?email=xxx
   */
  requestReset: async (email: string): Promise<string> => {
    const response = await api.post<string>('/public/reset-password', null, {
      params: { email },
    });
    return response.data;
  },

  /**
   * Confirma reset de senha com token e nova senha
   * POST /public/reset-password/confirm
   */
  confirmReset: async (data: ResetPasswordConfirmRequest): Promise<string> => {
    const response = await api.post<string>('/public/reset-password/confirm', data);
    return response.data;
  },
};