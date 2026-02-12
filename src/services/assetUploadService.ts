// services/assetUploadService.ts
import api from './api'; // seu axios instance

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
  /**
   * Upload de todos os assets de uma vez
   */
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

    const response = await api.post('/user/assets/all-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};