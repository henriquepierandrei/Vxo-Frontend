// src/utils/socialUtils.ts
import { isValidUrl, normalizeUrl, getKnownDomainInfo } from './linkUtils';

/**
 * Informações completas de cada rede social incluindo typeId
 */
export interface SocialNetworkConfig {
  id: string;
  typeId: number;
  name: string;
  domains: string[];
  color: string;
}

/**
 * Mapeamento de redes sociais com seus typeIds únicos
 */
export const SOCIAL_NETWORKS_CONFIG: Record<string, SocialNetworkConfig> = {
  instagram: {
    id: 'instagram',
    typeId: 1,
    name: 'Instagram',
    domains: ['instagram.com', 'www.instagram.com'],
    color: '#E4405F',
  },
  snapchat: {
    id: 'snapchat',
    typeId: 2,
    name: 'Snapchat',
    domains: ['snapchat.com', 'www.snapchat.com'],
    color: '#FFFC00',
  },
  youtube: {
    id: 'youtube',
    typeId: 3,
    name: 'YouTube',
    domains: ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com'],
    color: '#FF0000',
  },
  discord: {
    id: 'discord',
    typeId: 4,
    name: 'Discord',
    domains: ['discord.com', 'discord.gg', 'discordapp.com'],
    color: '#5865F2',
  },
  facebook: {
    id: 'facebook',
    typeId: 5,
    name: 'Facebook',
    domains: ['facebook.com', 'www.facebook.com', 'fb.com', 'm.facebook.com'],
    color: '#1877F2',
  },
  twitter: {
    id: 'twitter',
    typeId: 6,
    name: 'Twitter',
    domains: ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com'],
    color: '#000000',
  },
  tiktok: {
    id: 'tiktok',
    typeId: 7,
    name: 'TikTok',
    domains: ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com'],
    color: '#000000',
  },
  lastfm: {
    id: 'lastfm',
    typeId: 8,
    name: 'Last.fm',
    domains: ['last.fm', 'www.last.fm', 'lastfm.com'],
    color: '#D51007',
  },
  steam: {
    id: 'steam',
    typeId: 9,
    name: 'Steam',
    domains: ['steamcommunity.com', 'store.steampowered.com', 'steampowered.com'],
    color: '#000000',
  },
  github: {
    id: 'github',
    typeId: 10,
    name: 'GitHub',
    domains: ['github.com', 'www.github.com'],
    color: '#181717',
  },
  spotify: {
    id: 'spotify',
    typeId: 11,
    name: 'Spotify',
    domains: ['spotify.com', 'open.spotify.com'],
    color: '#1DB954',
  },
  twitch: {
    id: 'twitch',
    typeId: 12,
    name: 'Twitch',
    domains: ['twitch.tv', 'www.twitch.tv'],
    color: '#9146FF',
  },
  soundcloud: {
    id: 'soundcloud',
    typeId: 13,
    name: 'Soundcloud',
    domains: ['soundcloud.com', 'www.soundcloud.com'],
    color: '#FF5500',
  },
  whatsapp: {
    id: 'whatsapp',
    typeId: 14,
    name: 'WhatsApp',
    domains: ['whatsapp.com', 'wa.me', 'api.whatsapp.com'],
    color: '#25D366',
  },
  telegram: {
    id: 'telegram',
    typeId: 15,
    name: 'Telegram',
    domains: ['telegram.org', 't.me', 'telegram.me'],
    color: '#0088CC',
  },
  battlenet: {
    id: 'battlenet',
    typeId: 16,
    name: 'BattleNet',
    domains: ['battle.net', 'blizzard.com'],
    color: '#00AEFF',
  },
  linkedin: {
    id: 'linkedin',
    typeId: 17,
    name: 'LinkedIn',
    domains: ['linkedin.com', 'www.linkedin.com'],
    color: '#0A66C2',
  },
  paypal: {
    id: 'paypal',
    typeId: 18,
    name: 'PayPal',
    domains: ['paypal.com', 'paypal.me', 'www.paypal.com'],
    color: '#003087',
  },
  xbox: {
    id: 'xbox',
    typeId: 19,
    name: 'Xbox',
    domains: ['xbox.com', 'www.xbox.com'],
    color: '#107C10',
  },
  pinterest: {
    id: 'pinterest',
    typeId: 20,
    name: 'Pinterest',
    domains: ['pinterest.com', 'www.pinterest.com', 'br.pinterest.com'],
    color: '#BD081C',
  },
  letterboxd: {
    id: 'letterboxd',
    typeId: 21,
    name: 'Letterboxd',
    domains: ['letterboxd.com', 'www.letterboxd.com'],
    color: '#00D735',
  },
  tumblr: {
    id: 'tumblr',
    typeId: 22,
    name: 'Tumblr',
    domains: ['tumblr.com', 'www.tumblr.com'],
    color: '#36465D',
  },
  vsco: {
    id: 'vsco',
    typeId: 23,
    name: 'VSCO',
    domains: ['vsco.co', 'www.vsco.co'],
    color: '#000000',
  },
  onlyfans: {
    id: 'onlyfans',
    typeId: 24,
    name: 'OnlyFans',
    domains: ['onlyfans.com', 'www.onlyfans.com'],
    color: '#00AFF0',
  },
  bluesky: {
    id: 'bluesky',
    typeId: 25,
    name: 'Bluesky',
    domains: ['bsky.app', 'bsky.social'],
    color: '#0085FF',
  },
  threads: {
    id: 'threads',
    typeId: 26,
    name: 'Threads',
    domains: ['threads.net', 'www.threads.net'],
    color: '#000000',
  },
  roblox: {
    id: 'roblox',
    typeId: 27,
    name: 'Roblox',
    domains: ['roblox.com', 'www.roblox.com', 'web.roblox.com'],
    color: '#000000',
  },
  patreon: {
    id: 'patreon',
    typeId: 28,
    name: 'Patreon',
    domains: ['patreon.com', 'www.patreon.com'],
    color: '#FF424D',
  },
  privacy: {
    id: 'privacy',
    typeId: 29,
    name: 'Privacy',
    domains: ['privacy.com.br', 'www.privacy.com.br'],
    color: '#00FF00',
  },
  fivem: {
    id: 'fivem',
    typeId: 30,
    name: 'FiveM',
    domains: ['cfx.re', 'fivem.net'],
    color: '#F40552',
  },
  ifood: {
    id: 'ifood',
    typeId: 31,
    name: 'iFood',
    domains: ['ifood.com.br', 'www.ifood.com.br'],
    color: '#EA1D2C',
  },
  gmail: {
    id: 'gmail',
    typeId: 32,
    name: 'Gmail',
    domains: ['gmail.com', 'mail.google.com'],
    color: '#EA4335',
  },
  namemc: {
    id: 'namemc',
    typeId: 33,
    name: 'NameMC',
    domains: ['namemc.com', 'www.namemc.com'],
    color: '#3C8527',
  },
};

/**
 * Detecta qual rede social a URL pertence
 * Retorna a configuração completa da rede social ou null
 */
export const detectSocialNetwork = (url: string): SocialNetworkConfig | null => {
  if (!isValidUrl(url)) {
    return null;
  }

  try {
    const normalized = normalizeUrl(url);
    const urlObj = new URL(normalized);
    const hostname = urlObj.hostname.toLowerCase();

    // Verificar cada rede social
    for (const config of Object.values(SOCIAL_NETWORKS_CONFIG)) {
      for (const domain of config.domains) {
        const cleanDomain = domain.toLowerCase();
        
        // Comparação direta
        if (hostname === cleanDomain) {
          return config;
        }
        
        // Comparação com subdomínio
        if (hostname.endsWith(`.${cleanDomain}`)) {
          return config;
        }
      }
    }

    // Verificação especial para Gmail (emails)
    if (url.includes('@gmail.com') || hostname.includes('gmail.com') || hostname.includes('mail.google.com')) {
      return SOCIAL_NETWORKS_CONFIG.gmail;
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Verifica se a URL pertence a uma rede social predefinida
 */
export const isSocialNetworkUrl = (url: string): boolean => {
  return detectSocialNetwork(url) !== null;
};

/**
 * Obtém o typeId da rede social pela URL
 */
export const getSocialNetworkTypeId = (url: string): number | null => {
  const config = detectSocialNetwork(url);
  return config?.typeId ?? null;
};

/**
 * Obtém configuração da rede social pelo ID
 */
export const getSocialNetworkById = (networkId: string): SocialNetworkConfig | null => {
  return SOCIAL_NETWORKS_CONFIG[networkId] ?? null;
};

/**
 * Obtém o nome da rede social pela URL
 */
export const getSocialNetworkName = (url: string): string | null => {
  const config = detectSocialNetwork(url);
  if (config) {
    return config.name;
  }

  // Fallback usando linkUtils
  if (!isValidUrl(url)) {
    return null;
  }

  try {
    const normalized = normalizeUrl(url);
    const urlObj = new URL(normalized);
    const hostname = urlObj.hostname.toLowerCase().replace(/^www\./, '');

    const knownInfo = getKnownDomainInfo(hostname);
    if (knownInfo) {
      return knownInfo.name;
    }

    const parts = hostname.split('.');
    const mainPart = parts[0];
    return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
  } catch {
    return null;
  }
};

/**
 * Mapeamento inverso rápido: domínio -> configuração
 */
const domainToConfig: Map<string, SocialNetworkConfig> = new Map();

// Preencher o mapa uma vez
for (const config of Object.values(SOCIAL_NETWORKS_CONFIG)) {
  for (const domain of config.domains) {
    domainToConfig.set(domain.toLowerCase(), config);
  }
}

/**
 * Busca rápida de rede social por domínio
 */
export const getConfigByDomain = (domain: string): SocialNetworkConfig | null => {
  const lowerDomain = domain.toLowerCase();
  
  // Busca direta
  if (domainToConfig.has(lowerDomain)) {
    return domainToConfig.get(lowerDomain)!;
  }
  
  // Busca por subdomínio
  for (const [mappedDomain, config] of domainToConfig.entries()) {
    if (lowerDomain.endsWith(`.${mappedDomain}`) || lowerDomain === mappedDomain) {
      return config;
    }
  }
  
  return null;
};