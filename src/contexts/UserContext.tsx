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
import { useLocation } from "react-router-dom";

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

export interface PageEffects {
  snow: boolean;
  rain: boolean;
  cash: boolean;
  thunder: boolean;
  smoke: boolean;
  stars: boolean;
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
  premiumExpireAt: string;
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
  profileImageUrl: string | null;
}

const PUBLIC_ONLY_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/plans",
  "/ranking",
  "/unauthorized",
];

const isPublicProfilePage = (pathname: string): boolean => {
  const isKnown = PUBLIC_ONLY_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
  const isDashboard = pathname.startsWith("/dashboard");
  return !isKnown && !isDashboard;
};

const ProfileContext = createContext<ProfileContextData>(
  {} as ProfileContextData
);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
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
    if (user && !isPublicProfilePage(location.pathname)) {
      if (!profileData) {
        fetchProfile();
      }
    } else if (!user) {
      setProfileData(null);
      setProfileImageError(false);
    }
  }, [user, location.pathname, fetchProfile]);

  const profileImageUrl =
    profileData?.pageSettings?.mediaUrls?.profileImageUrl || null;

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