// services/assetUploadService.ts
import api from './api';

export interface AssetUploadResponse {
  success: boolean;
  message: string;
  urls?: {
    avatarUrl?: string;
    cursorUrl?: string;
    backgroundUrl?: string;
    musicUrl?: string;
    faviconUrl?: string;
  };
}

export const assetUploadService = {
  uploadAssets: async (files: {
    avatar?: File | null;
    cursor?: File | null;
    background?: File | null;
    music?: File | null;
    favicon?: File | null;
  }): Promise<AssetUploadResponse> => {
    const formData = new FormData();

    if (files.avatar) {
      formData.append('avatar', files.avatar);
    }
    if (files.cursor) {
      formData.append('cursor', files.cursor);
    }
    if (files.background) {
      formData.append('background', files.background);
    }
    if (files.music) {
      formData.append('music', files.music);
    }
    if (files.favicon) {
      formData.append('favicon', files.favicon);
    }

    try {
      const response = await api.post('/user/assets/all-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // ✅ Mapeia a resposta do backend para o formato esperado
      const data = response.data;
      
      return {
        success: data.success ?? true,
        message: data.message ?? 'Upload realizado',
        urls: data.urls ?? undefined,
      };
    } catch (error: unknown) {
      const axiosError = error as { 
        response?: { data?: { message?: string } } 
      };
      
      return {
        success: false,
        message: axiosError.response?.data?.message || 'Erro no upload',
        urls: undefined,
      };
    }
  },
};