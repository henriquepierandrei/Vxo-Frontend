import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";

// Interfaces para o novo formato de resposta
interface CardSettings {
  opacity: number;
  blur: number;
  color: string;
  perspective: boolean;
  hoverGrow: boolean;
  rgbBorder: boolean;
}

interface ContentSettings {
  biography: string;
  biographyColor: string;
  centerAlign: boolean;
}

interface NameEffects {
  name: string;
  neon: boolean;
  shiny: boolean;
  rgb: boolean;
}

interface MediaUrls {
  backgroundUrl: string;
  profileImageUrl: string;
  musicUrl: string;
  cursorUrl: string;
  faviconUrl: string;
}

interface ParticlesSettings {
  enabled: boolean;
  color: string;
}

interface PageEffects {
  snow: boolean;
  confetti: boolean;
  matrixRain: boolean;
  particles: ParticlesSettings;
}

interface PageSettings {
  isPremium: boolean;
  cardSettings: CardSettings;
  contentSettings: ContentSettings;
  nameEffects: NameEffects;
  mediaUrls: MediaUrls;
  pageEffects: PageEffects;
  hasEmbed: boolean;
  embedUrl: string;
}

interface ProfileResponse {
  slug: string;
  level: string;
  name: string;
  createdAt: string;
  isPremium: boolean;
  receiveGifts: boolean;
  coins: number;
  views: number;
  pageSettings: PageSettings;
}

interface ProfileContextData {
  profileData: ProfileResponse | null;
  isLoadingProfile: boolean;
  profileImageError: boolean;
  setProfileImageError: (val: boolean) => void;
  refreshProfile: () => Promise<void>;
  // Helper para acessar a URL da imagem de perfil mais facilmente
  profileImageUrl: string | null;
}

const ProfileContext = createContext<ProfileContextData>(
  {} as ProfileContextData
);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoadingProfile(true);
      const response = await api.get<ProfileResponse>("/user/profile");
      setProfileData(response.data);
      setProfileImageError(false);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      setProfileData(null);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (!profileData) {
        fetchProfile();
      }
    } else {
      setProfileData(null);
      setProfileImageError(false);
    }
  }, [user, profileData, fetchProfile]);

  // Helper para acessar a URL da imagem de perfil
  const profileImageUrl = profileData?.pageSettings?.mediaUrls?.profileImageUrl || null;

  return (
    <ProfileContext.Provider
      value={{
        profileData,
        isLoadingProfile,
        profileImageError,
        setProfileImageError,
        refreshProfile: fetchProfile,
        profileImageUrl,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => {
  const context = useContext(ProfileContext);

  if (!context || Object.keys(context).length === 0) {
    throw new Error("useProfile deve ser usado dentro de um ProfileProvider");
  }

  return context;
};