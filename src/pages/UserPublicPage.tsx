// src/pages/UserPage.tsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════════════ */

interface PageEffects {
    snow: boolean;
    rain: boolean;
    cash: boolean;
    thunder: boolean;
    smoke: boolean;
    stars: boolean;
}

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
    backgroundUrl: string | null;
    profileImageUrl: string | null;
    musicUrl: string | null;
    faviconUrl: string | null;
}

interface InventoryItem {
    id: string;
    url: string;
    type: 'FRAME' | 'BADGE';
    isPremium: boolean;
    equipped: boolean;
    name?: string;
}

interface UserLink {
    id: string;
    linkId: string;
    title: string;
    url: string;
    typeId: number | null;
    linkTypeId: number | null;
    order: number;
    hasLinkTyped: boolean;
}

interface TagResponse {
    tagId: number;
    tagName: string;
}

interface UserPageResponse {
    pageEffects: PageEffects;
    cardSettings: CardSettings;
    contentSettings: ContentSettings;
    nameEffects: NameEffects;
    mediaUrls: MediaUrls;
    staticBackgroundColor?: string | null;
    inventoryResponse: { equipped: InventoryItem[] };
    userLinksResponse: { links: UserLink[] };
    userTagsResponse: { tags: TagResponse[] };
    embedUrl: string | null;
    views: number;
    slug: string;
    isPremium: boolean;
    viewCounted: boolean;
}

interface RegisterViewRequest {
    referrer?: string;
    screenWidth?: number;
    screenHeight?: number;
    timezone?: string;
    language?: string;
}

interface IconProps {
    color?: string;
}

const RESERVED = [
    "dashboard",
    "login",
    "register",
    "ranking",
    "unauthorized",
    "forgot-password",
    "reset-password"
];


/* ═══════════════════════════════════════════════════════════════════════════
   SOCIAL ICONS (VAZIOS)
═══════════════════════════════════════════════════════════════════════════ */


const InstagramIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20">
        <defs>
            <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFDC80" />
                <stop offset="25%" stopColor="#F77737" />
                <stop offset="50%" stopColor="#E1306C" />
                <stop offset="75%" stopColor="#C13584" />
                <stop offset="100%" stopColor="#833AB4" />
            </linearGradient>
        </defs>
        <path fill={color ? color : "url(#instagram-gradient)"} d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
);

const SnapchatIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#FFFC00"}>
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
    </svg>
);

const YouTubeIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#FF0000"}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);

const DiscordIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#5865F2"}>
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
);

const FacebookIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#1877F2"}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const TwitterIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#000000"}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const TikTokIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#000000"}>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
);

const LastFmIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#D51007"}>
        <path d="M10.584 17.21l-.88-2.392s-1.43 1.594-3.573 1.594c-1.897 0-3.244-1.649-3.244-4.288 0-3.381 1.704-4.591 3.381-4.591 2.42 0 3.189 1.567 3.849 3.574l.88 2.749c.88 2.666 2.529 4.81 7.285 4.81 3.409 0 5.718-1.044 5.718-3.793 0-2.227-1.265-3.381-3.63-3.931l-1.758-.385c-1.21-.275-1.567-.77-1.567-1.594 0-.935.742-1.484 1.952-1.484 1.32 0 2.034.495 2.144 1.677l2.749-.33c-.22-2.474-1.924-3.492-4.729-3.492-2.474 0-4.893.935-4.893 3.932 0 1.87.907 3.051 3.189 3.601l1.87.44c1.402.33 1.869.825 1.869 1.677 0 1.044-1.016 1.456-2.914 1.456-2.831 0-4.014-1.484-4.674-3.52l-.907-2.749c-1.155-3.574-2.997-4.894-6.653-4.894C2.144 5.333 0 7.89 0 12.233c0 4.18 2.144 6.434 5.993 6.434 3.106 0 4.591-1.457 4.591-1.457z" />
    </svg>
);

const SteamIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#000000"}>
        <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0z" />
    </svg>
);

const GitHubIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#181717"}>
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
);

const SpotifyIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#1DB954"}>
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
);

const TwitchIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#9146FF"}>
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
    </svg>
);

const SoundcloudIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#FF5500"}>
        <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.052-.1-.101-.1m-.899.828c-.06 0-.091.037-.104.094L0 14.479l.165 1.308c.014.057.045.094.09.094s.089-.037.099-.094l.195-1.308-.195-1.332c.01-.057-.04-.094-.09-.094m1.83-1.229c-.061 0-.12.045-.12.104l-.21 2.563.225 2.458c0 .06.045.104.106.104.061 0 .12-.044.12-.104l.24-2.458-.24-2.563c0-.06-.059-.104-.12-.104m.945-.089c-.075 0-.135.06-.15.135l-.193 2.64.21 2.544c.016.077.075.138.149.138.075 0 .135-.061.15-.138l.24-2.544-.24-2.64c-.015-.075-.075-.135-.15-.135m1.065.202c-.09 0-.166.075-.18.165l-.18 2.46.195 2.48c.015.09.091.164.18.164.091 0 .166-.074.181-.164l.21-2.48-.21-2.46c-.016-.09-.091-.165-.181-.165m.96-.285c-.105 0-.195.09-.195.195l-.165 2.535.18 2.46c0 .104.09.194.195.194s.195-.089.195-.194l.195-2.46-.195-2.535c0-.104-.09-.195-.195-.195m1.035-.105c-.12 0-.225.104-.225.225l-.15 2.415.165 2.43c0 .12.104.224.225.224.12 0 .224-.104.224-.224l.18-2.43-.18-2.415c0-.12-.104-.225-.225-.225m1.095-.195c-.135 0-.255.12-.27.255L6.9 14.145l.15 2.4c.016.135.136.255.271.255s.255-.12.27-.255l.166-2.4-.165-2.64c-.015-.135-.135-.255-.27-.255" />
    </svg>
);

const WhatsappIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#25D366"}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
);

const TelegramIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#26A5E4"}>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

const BattleNetIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#00AEFF"}>
        <path d="M10.457 0c-.37.018-.734.14-1.062.377C8.19 1.26 7.91 3.153 8.16 5.63a21.09 21.09 0 00-3.907 2.321c-.192-.403-.503-.896-.926-1.238-.91-.736-1.992-.645-2.853.083-.795.672-1.089 1.715-.803 2.853.265 1.057.918 2.195 1.848 3.283-1.11 2.025-1.616 3.874-1.449 5.33.148 1.291.808 2.34 1.89 2.975 1.505.883 3.467.646 5.634-.54.28.257.567.51.864.758.263 1.1.582 1.88 1.059 2.35a2.147 2.147 0 001.571.643c.67-.014 1.26-.322 1.69-.781.67-.716.894-1.782.689-2.96a21.063 21.063 0 003.063-2.037c.314.522.782 1.065 1.327 1.417.935.605 2.01.574 2.903-.108.825-.63 1.196-1.65.996-2.8-.186-1.066-.76-2.223-1.627-3.346 1.025-1.903 1.494-3.639 1.382-5.012-.096-1.18-.608-2.162-1.49-2.807-.864-.632-1.974-.847-3.157-.66-1.02.161-2.104.578-3.218 1.206a21.197 21.197 0 00-3.243-2.208c-.148-1.105-.418-1.93-.872-2.454A2.147 2.147 0 0010.457 0z" />
    </svg>
);

const LinkedinIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#0A66C2"}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const PayPalIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#003087"}>
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" />
    </svg>
);

const XboxIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#107C10"}>
        <path d="M4.102 21.033C6.211 22.881 8.977 24 12 24c3.026 0 5.789-1.119 7.902-2.967 1.877-1.912-4.316-8.709-7.902-11.417-3.582 2.708-9.779 9.505-7.898 11.417z" />
    </svg>
);

const PinterestIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#BD081C"}>
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
    </svg>
);

const LetterboxdIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#00D735"}>
        <path d="M8.224 14.352a4.447 4.447 0 0 1-3.775 2.092C1.992 16.444 0 14.454 0 12s1.992-4.444 4.45-4.444c1.592 0 2.988.836 3.774 2.092-.483.74-.764 1.622-.764 2.572s.281 1.834.764 2.572z" />
    </svg>
);

const TumblrIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#36465D"}>
        <path d="M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.156 1.404h-.167z" />
    </svg>
);

const VSCOIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#000000"}>
        <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 2.592a9.408 9.408 0 110 18.816 9.408 9.408 0 010-18.816zm0 1.56a7.848 7.848 0 100 15.696 7.848 7.848 0 000-15.696zm0 1.896a5.952 5.952 0 110 11.904 5.952 5.952 0 010-11.904zm0 1.776a4.176 4.176 0 100 8.352 4.176 4.176 0 000-8.352z" />
    </svg>
);

const OnlyfansIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#00AFF0"}>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.627-5.373-12-12-12zm0 3.6a8.4 8.4 0 110 16.8 8.4 8.4 0 010-16.8zm0 2.133a6.267 6.267 0 100 12.534 6.267 6.267 0 000-12.534zm0 2.4a3.867 3.867 0 110 7.734 3.867 3.867 0 010-7.734z" />
    </svg>
);

const BlueskyIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#0085FF"}>
        <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 01-.415-.056c.14.017.279.036.415.056 2.67.296 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" />
    </svg>
);

const ThreadsIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#000000"}>
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.69-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.33-3.022.88-.73 2.082-1.146 3.48-1.206l.005-.001c1.077-.042 2.088.042 3.046.254l.022.006c-.02-.986-.262-1.236-.29-1.264a.89.89 0 00-.025-.023c-.233-.19-.727-.396-1.57-.396h-.004c-1.174.003-2.08.473-2.54.828l-1.378-1.652c.757-.587 2.158-1.292 3.918-1.295h.008c1.238 0 2.2.331 2.861.984.648.64 1.017 1.548 1.096 2.702.577.237 1.086.524 1.525.857.67.51 1.18 1.134 1.513 1.857.677 1.467.808 4.023-1.248 6.037-1.782 1.746-4.013 2.593-7.024 2.62zm-.535-8.185c-1.637.083-2.378.738-2.423 1.538-.034.6.253 1.063.788 1.412.56.364 1.28.527 2.006.488 1.065-.058 1.86-.46 2.365-1.2.343-.503.58-1.168.696-1.956a8.717 8.717 0 00-1.325-.233 10.022 10.022 0 00-2.107-.049z" />
    </svg>
);

const RobloxIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#000000"}>
        <path d="M5.164 0L0 18.627 18.836 24 24 5.373 5.164 0zM14.6 15.549l-5.61-1.377 1.377-5.61 5.61 1.377-1.377 5.61z" />
    </svg>
);

const PatreonIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#FF424D"}>
        <path d="M0 .48v23.04h4.22V.48zm15.385 0c-4.764 0-8.641 3.88-8.641 8.65 0 4.755 3.877 8.623 8.641 8.623 4.75 0 8.615-3.868 8.615-8.623C24 4.36 20.136.48 15.385.48z" />
    </svg>
);

const PrivacyIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#00FF00"}>
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
    </svg>
);

const FivemIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#F40552"}>
        <path d="M4.717 0h8.565A4.716 4.716 0 0118 4.717v8.565A4.717 4.717 0 0113.283 18H4.717A4.717 4.717 0 010 13.282V4.717A4.717 4.717 0 014.717 0z" />
    </svg>
);

const IFoodIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#EA1D2C"}>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.6 18.893c-3.445 0-6.24-2.795-6.24-6.24s2.795-6.24 6.24-6.24c2.107 0 3.969 1.047 5.096 2.648l-2.247 1.297a3.449 3.449 0 00-2.849-1.497c-1.913 0-3.465 1.552-3.465 3.465s1.552 3.465 3.465 3.465c1.465 0 2.715-.91 3.22-2.195h-3.22v-2.595h6.12c.06.33.092.671.092 1.021 0 3.445-2.795 6.871-6.212 6.871z" />
    </svg>
);

const GmailIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill={color || "#EA4335"} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    </svg>
);

const NameMCIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={color || "#3C8527"}>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.8c1.327 0 2.4 1.073 2.4 2.4v2.4H9.6V7.2c0-1.327 1.073-2.4 2.4-2.4zm4.8 7.2v7.2H7.2V12h9.6z" />
    </svg>
);

/* ═══════════════════════════════════════════════════════════════════════════
   ICON MAP
═══════════════════════════════════════════════════════════════════════════ */

const ICON_MAP: Record<number, React.FC<IconProps>> = {
    1: InstagramIcon, 2: SnapchatIcon, 3: YouTubeIcon, 4: DiscordIcon,
    5: FacebookIcon, 6: TwitterIcon, 7: TikTokIcon, 8: LastFmIcon,
    9: SteamIcon, 10: GitHubIcon, 11: SpotifyIcon, 12: TwitchIcon,
    13: SoundcloudIcon, 14: WhatsappIcon, 15: TelegramIcon, 16: BattleNetIcon,
    17: LinkedinIcon, 18: PayPalIcon, 19: XboxIcon, 20: PinterestIcon,
    21: LetterboxdIcon, 22: TumblrIcon, 23: VSCOIcon, 24: OnlyfansIcon,
    25: BlueskyIcon, 26: ThreadsIcon, 27: RobloxIcon, 28: PatreonIcon,
    29: PrivacyIcon, 30: FivemIcon, 31: IFoodIcon, 32: GmailIcon, 33: NameMCIcon,
};

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════════════════════ */

const globalStylesCSS = `
  @keyframes float-up {
    0%   { opacity: 1; transform: translateY(0) scale(1); }
    50%  { opacity: 1; transform: translateY(-20px) scale(1.3); }
    100% { opacity: 0; transform: translateY(-40px) scale(0.8); }
  }
  .animate-float-up {
    animation: float-up 2s ease-out forwards;
  }

  @keyframes neon-flicker {
    0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
      text-shadow:
        0 0 5px #fff, 0 0 10px #fff,
        0 0 20px #ff00de, 0 0 30px #ff00de,
        0 0 40px #ff00de, 0 0 55px #ff00de, 0 0 75px #ff00de;
    }
    20%, 24%, 55% { text-shadow: none; }
  }
  .name-neon {
    color: #fff;
    text-shadow:
      0 0 5px #fff, 0 0 10px #fff,
      0 0 20px #ff00de, 0 0 30px #ff00de, 0 0 40px #ff00de;
    animation: neon-flicker 1.5s infinite alternate;
  }

  @keyframes shiny-move {
    0%   { background-position: 200% center; }
    100% { background-position: -200% center; }
  }
  .name-shiny {
    background: linear-gradient(90deg, #fff 0%, #fff 40%, #ffd700 50%, #fff 60%, #fff 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shiny-move 3s linear infinite;
  }

  @keyframes rgb-cycle {
    0%      { color: #ff0000; }
    16.67%  { color: #ff8000; }
    33.33%  { color: #ffff00; }
    50%     { color: #00ff00; }
    66.67%  { color: #0080ff; }
    83.33%  { color: #8000ff; }
    100%    { color: #ff0000; }
  }
  .name-rgb {
    animation: rgb-cycle 3s linear infinite;
  }

  @keyframes rgb-border-animation {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .rgb-border-wrapper {
    position: relative;
    padding: 3px;
    border-radius: 20px;
    background: linear-gradient(45deg,
      #ff0000, #ff8000, #ffff00, #00ff00,
      #0080ff, #8000ff, #ff0080, #ff0000);
    background-size: 400% 400%;
    animation: rgb-border-animation 3s linear infinite;
  }

  @keyframes money-fall {
    0%   { transform: translateY(-100px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
  }

  @keyframes thunder-flash {
    0%, 100% { opacity: 0; }
    10%, 30% { opacity: 0.3; }
    20%      { opacity: 0.8; }
  }
  .thunder-overlay {
    animation: thunder-flash 4s infinite;
  }

  @keyframes smoke-rise {
    0%   { transform: translateY(100%) scale(1); opacity: 0.6; }
    100% { transform: translateY(-100vh) scale(2); opacity: 0; }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.5; }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   EFFECTS COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

const SnowEffect: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const flakes = Array.from({ length: 150 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 3 + 1,
            speed: Math.random() * 2 + 0.5,
            wind: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.5 + 0.5,
        }));

        let animId: number;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            flakes.forEach((f) => {
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${f.opacity})`;
                ctx.fill();
                f.y += f.speed;
                f.x += f.wind;
                if (f.y > canvas.height) { f.y = -5; f.x = Math.random() * canvas.width; }
                if (f.x > canvas.width) f.x = 0;
                if (f.x < 0) f.x = canvas.width;
            });
            animId = requestAnimationFrame(draw);
        };
        draw();

        const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', onResize);
        return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
    }, []);

    return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }} />;
};

const RainEffect: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const drops = Array.from({ length: 200 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            len: Math.random() * 20 + 10,
            speed: Math.random() * 15 + 10,
            opacity: Math.random() * 0.3 + 0.2,
        }));

        let animId: number;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drops.forEach((d) => {
                ctx.beginPath();
                ctx.moveTo(d.x, d.y);
                ctx.lineTo(d.x + 1, d.y + d.len);
                ctx.strokeStyle = `rgba(174,194,224,${d.opacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();
                d.y += d.speed;
                if (d.y > canvas.height) { d.y = -d.len; d.x = Math.random() * canvas.width; }
            });
            animId = requestAnimationFrame(draw);
        };
        draw();

        const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', onResize);
        return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
    }, []);

    return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }} />;
};

const MoneyRainEffect: React.FC = () => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        const emojis = ['💵', '💰', '💸', '🤑', '💲', '💎'];
        const els: HTMLSpanElement[] = [];

        const create = () => {
            const el = document.createElement('span');
            el.innerText = emojis[Math.floor(Math.random() * emojis.length)];
            el.style.cssText = [
                'position:fixed',
                `left:${Math.random() * 100}vw`,
                'top:-50px',
                `font-size:${Math.random() * 20 + 20}px`,
                'pointer-events:none',
                'z-index:9999',
                `animation:money-fall ${Math.random() * 3 + 3}s linear forwards`,
                `transform:rotate(${Math.random() * 360}deg)`,
            ].join(';');
            container.appendChild(el);
            els.push(el);
            setTimeout(() => { el.remove(); const i = els.indexOf(el); if (i > -1) els.splice(i, 1); }, 6000);
        };

        const interval = setInterval(create, 150);
        return () => { clearInterval(interval); els.forEach((e) => e.remove()); };
    }, []);

    return <div ref={ref} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 9999 }} />;
};

const ThunderEffect: React.FC = () => {
    const [flash, setFlash] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                setFlash(true);
                setTimeout(() => setFlash(false), 200);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'white', opacity: flash ? 0.8 : 0, pointerEvents: 'none', zIndex: 9999, transition: 'opacity 0.1s' }} />
            <div className="thunder-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(100,100,150,0.3)', pointerEvents: 'none', zIndex: 9998 }} />
        </>
    );
};

const SmokeEffect: React.FC = () => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = ref.current;
        if (!container) return;
        const els: HTMLDivElement[] = [];

        const create = () => {
            const el = document.createElement('div');
            const size = Math.random() * 100 + 50;
            el.style.cssText = [
                'position:fixed',
                `left:${Math.random() * 100}vw`,
                'bottom:-100px',
                `width:${size}px`,
                `height:${size}px`,
                'background:radial-gradient(circle,rgba(255,255,255,0.3) 0%,transparent 70%)',
                'border-radius:50%',
                'pointer-events:none',
                'z-index:9999',
                `animation:smoke-rise ${Math.random() * 5 + 5}s linear forwards`,
            ].join(';');
            container.appendChild(el);
            els.push(el);
            setTimeout(() => { el.remove(); const i = els.indexOf(el); if (i > -1) els.splice(i, 1); }, 10000);
        };

        const interval = setInterval(create, 500);
        return () => { clearInterval(interval); els.forEach((e) => e.remove()); };
    }, []);

    return <div ref={ref} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 9999 }} />;
};

const StarsEffect: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const stars = Array.from({ length: 100 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2 + 0.5,
            opacity: Math.random(),
            speed: Math.random() * 0.02 + 0.005,
            inc: Math.random() > 0.5,
        }));

        let animId: number;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach((s) => {
                if (s.inc) { s.opacity += s.speed; if (s.opacity >= 1) s.inc = false; }
                else { s.opacity -= s.speed; if (s.opacity <= 0.2) s.inc = true; }
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r * 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${s.opacity * 0.3})`;
                ctx.fill();
            });
            animId = requestAnimationFrame(draw);
        };
        draw();

        const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', onResize);
        return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
    }, []);

    return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }} />;
};

const PageEffectsManager: React.FC<{ effects: PageEffects }> = ({ effects }) => (
    <>
        {effects.snow && <SnowEffect />}
        {effects.rain && <RainEffect />}
        {effects.cash && <MoneyRainEffect />}
        {effects.thunder && <ThunderEffect />}
        {effects.smoke && <SmokeEffect />}
        {effects.stars && <StarsEffect />}
    </>
);

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */

const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha / 100})`;
};

const getFaviconUrl = (url: string): string => {
    try {
        const domain = new URL(url).origin;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
        return '';
    }
};

function rgbToFilter(c: string): string {
    let r: number, g: number, b: number;

    if (c.startsWith('#')) {
        const hex = c.replace('#', '');
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else {
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
        }
    } else {
        const result = c.match(/\d+/g);
        if (!result || result.length < 3) return '';
        [r, g, b] = result.map(Number);
    }

    class Color {
        r: number; g: number; b: number;
        constructor(r: number, g: number, b: number) {
            this.r = this.clamp(r);
            this.g = this.clamp(g);
            this.b = this.clamp(b);
        }
        clamp(v: number) { return Math.max(0, Math.min(255, v)); }

        hsl() {
            const r = this.r / 255, g = this.g / 255, b = this.b / 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h = 0, s = 0;
            const l = (max + min) / 2;
            if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                    case g: h = ((b - r) / d + 2) / 6; break;
                    case b: h = ((r - g) / d + 4) / 6; break;
                }
            }
            return [h * 360, s * 100, l * 100];
        }
    }

    class Solver {
        target: Color;
        targetHSL: number[];
        reusedColor: Color;

        constructor(target: Color) {
            this.target = target;
            this.targetHSL = target.hsl();
            this.reusedColor = new Color(0, 0, 0);
        }

        solve() {
            const result = this.solveNarrow(this.solveWide());
            return this.css(result.values);
        }

        solveWide() {
            const A = 5, c = 15;
            const a = [60, 180, 18000, 600, 1.2, 1.2];
            let best = { loss: Infinity, values: [] as number[] };
            for (let i = 0; i < 3; i++) {
                const initial = [50, 20, 3750, 50, 100, 100];
                const result = this.spsa(A, a, c, initial, 1000);
                if (result.loss < best.loss) best = result;
            }
            return best;
        }

        solveNarrow(wide: { loss: number; values: number[] }) {
            const A = wide.loss, c = 2;
            const A5 = A + 1;
            const a = [0.25 * A5, 0.25 * A5, A5, 0.25 * A5, 0.2 * A5, 0.2 * A5];
            return this.spsa(A, a, c, wide.values, 500);
        }

        spsa(A: number, a: number[], c: number, values: number[], iters: number) {
            const alpha = 1, gamma = 0.16667;
            let best = { loss: Infinity, values: values.slice() };
            const deltas = new Array(6), highArgs = new Array(6), lowArgs = new Array(6);

            for (let k = 0; k < iters; k++) {
                const ck = c / Math.pow(k + 1, gamma);
                for (let i = 0; i < 6; i++) {
                    deltas[i] = Math.random() > 0.5 ? 1 : -1;
                    highArgs[i] = values[i] + ck * deltas[i];
                    lowArgs[i] = values[i] - ck * deltas[i];
                }
                const lossDiff = this.loss(highArgs) - this.loss(lowArgs);
                for (let i = 0; i < 6; i++) {
                    const g = lossDiff / (2 * ck) * deltas[i];
                    const ak = a[i] / Math.pow(A + k + 1, alpha);
                    values[i] = this.fix(values[i] - ak * g, i);
                }
                const loss = this.loss(values);
                if (loss < best.loss) best = { loss, values: values.slice() };
            }
            return best;
        }

        fix(value: number, idx: number) {
            const max = [100, 100, 7500, 350, 100, 100][idx];
            if (idx === 2) value = value % 7500;
            else if (idx === 4) value = value % 360;
            return Math.max(0, Math.min(value, max));
        }

        loss(filters: number[]) {
            const c = this.reusedColor;
            c.r = 0; c.g = 0; c.b = 0;
            this.applyFilters(c, filters);
            const hsl = c.hsl();
            return (
                Math.abs(c.r - this.target.r) +
                Math.abs(c.g - this.target.g) +
                Math.abs(c.b - this.target.b) +
                Math.abs(hsl[0] - this.targetHSL[0]) +
                Math.abs(hsl[1] - this.targetHSL[1]) +
                Math.abs(hsl[2] - this.targetHSL[2])
            );
        }

        applyFilters(c: Color, filters: number[]) {
            this.invert(c, filters[0] / 100);
            this.sepia(c, filters[1] / 100);
            this.saturate(c, filters[2] / 100);
            this.hueRotate(c, filters[3] * 3.6);
            this.brightness(c, filters[4] / 100);
            this.contrast(c, filters[5] / 100);
        }

        linear(c: Color, slope: number, intercept: number) {
            c.r = c.clamp(c.r * slope + intercept * 255);
            c.g = c.clamp(c.g * slope + intercept * 255);
            c.b = c.clamp(c.b * slope + intercept * 255);
        }

        invert(c: Color, v: number) {
            c.r = c.clamp((v + c.r / 255 * (1 - 2 * v)) * 255);
            c.g = c.clamp((v + c.g / 255 * (1 - 2 * v)) * 255);
            c.b = c.clamp((v + c.b / 255 * (1 - 2 * v)) * 255);
        }

        sepia(c: Color, v: number) {
            const r = c.r, g = c.g, b = c.b;
            c.r = c.clamp((r * (1 - 0.607 * v) + g * 0.769 * v + b * 0.189 * v));
            c.g = c.clamp((r * 0.349 * v + g * (1 - 0.314 * v) + b * 0.168 * v));
            c.b = c.clamp((r * 0.272 * v + g * 0.534 * v + b * (1 - 0.869 * v)));
        }

        saturate(c: Color, v: number) {
            const r = c.r, g = c.g, b = c.b;
            c.r = c.clamp(r * (0.213 + 0.787 * v) + g * (0.715 - 0.715 * v) + b * (0.072 - 0.072 * v));
            c.g = c.clamp(r * (0.213 - 0.213 * v) + g * (0.715 + 0.285 * v) + b * (0.072 - 0.072 * v));
            c.b = c.clamp(r * (0.213 - 0.213 * v) + g * (0.715 - 0.715 * v) + b * (0.072 + 0.928 * v));
        }

        hueRotate(c: Color, angle: number) {
            const rad = angle / 180 * Math.PI;
            const cos = Math.cos(rad), sin = Math.sin(rad);
            const r = c.r, g = c.g, b = c.b;
            c.r = c.clamp(r * (0.213 + cos * 0.787 - sin * 0.213) + g * (0.715 - cos * 0.715 - sin * 0.715) + b * (0.072 - cos * 0.072 + sin * 0.928));
            c.g = c.clamp(r * (0.213 - cos * 0.213 + sin * 0.143) + g * (0.715 + cos * 0.285 + sin * 0.140) + b * (0.072 - cos * 0.072 - sin * 0.283));
            c.b = c.clamp(r * (0.213 - cos * 0.213 - sin * 0.787) + g * (0.715 - cos * 0.715 + sin * 0.715) + b * (0.072 + cos * 0.928 + sin * 0.072));
        }

        brightness(c: Color, v: number) { this.linear(c, v, 0); }
        contrast(c: Color, v: number) { this.linear(c, v, -(0.5 * v) + 0.5); }

        css(filters: number[]) {
            return `invert(${Math.round(filters[0])}%) sepia(${Math.round(filters[1])}%) saturate(${Math.round(filters[2])}%) hue-rotate(${Math.round(filters[3] * 3.6)}deg) brightness(${Math.round(filters[4])}%) contrast(${Math.round(filters[5])}%)`;
        }
    }

    const color = new Color(r, g, b);
    const solver = new Solver(color);
    return solver.solve();
}

const isVideoUrl = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m3u8'];
    try {
        const pathname = new URL(url).pathname.toLowerCase();
        return videoExtensions.some((ext) => pathname.endsWith(ext));
    } catch {
        const clean = url.toLowerCase().split('?')[0].split('#')[0];
        return videoExtensions.some((ext) => clean.endsWith(ext));
    }
};

/* ═══════════════════════════════════════════════════════════════════════════
   BACKGROUND COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

const BackgroundMedia: React.FC<{ url: string }> = ({ url }) => {
    const isVideo = isVideoUrl(url);

    return (
        <>
            {isVideo ? (
                <video
                    src={url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            ) : (
                <img
                    src={url}
                    alt="Background"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            )}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                }}
            />
        </>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   CARD CONTENT
═══════════════════════════════════════════════════════════════════════════ */

interface CardContentProps {
    data: UserPageResponse;
    frame: string | null;
    badges: InventoryItem[];
    showPlusOne: boolean;
    getNameClass: () => string;
}

const CardContent: React.FC<CardContentProps> = ({ data, frame, badges, showPlusOne, getNameClass }) => {
    const profileSize = 120;
    const frameSize = profileSize + 22;
    const centered = data.contentSettings.centerAlign;
    const linkColor = data.contentSettings.biographyColor;

    const sortedLinks = useMemo(() => {
        return data.userLinksResponse.links
            .sort((a, b) => a.order - b.order)
            .reduce(
                (acc, link) => {
                    const typeId = link.typeId ?? link.linkTypeId;
                    if (typeId && ICON_MAP[typeId]) {
                        acc.typed.push(link);
                    } else {
                        acc.generic.push(link);
                    }
                    return acc;
                },
                { typed: [] as UserLink[], generic: [] as UserLink[] }
            );
    }, [data.userLinksResponse.links]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                alignItems: centered ? 'center' : 'flex-start',
                textAlign: centered ? 'center' : 'left',
            }}
        >
            {/* PROFILE IMAGE + FRAME */}
            <div style={{ position: 'relative', width: frameSize, height: frameSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div
                    style={{
                        position: 'absolute',
                        width: profileSize,
                        height: profileSize,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        backgroundColor: '#374151',
                        zIndex: 1,
                    }}
                >
                    {data.mediaUrls.profileImageUrl ? (
                        <img src={data.mediaUrls.profileImageUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#8b5cf6 0%,#ec4899 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: '#fff' }}>
                            ?
                        </div>
                    )}
                </div>

                {data.isPremium && frame && (
                    <img src={frame} alt="Frame" style={{ position: 'absolute', width: frameSize, height: frameSize, objectFit: 'contain', zIndex: 2, pointerEvents: 'none' }} />
                )}
            </div>

            {/* NAME */}
            <h1
                className={getNameClass()}
                style={{ fontSize: 28, fontWeight: 'bold', margin: 0, color: getNameClass() ? undefined : '#fff' }}
            >
                {data.nameEffects.name}
            </h1>

            {/* BADGES */}
            {badges.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: centered ? 'center' : 'flex-start' }}>
                    {badges.map((badge) => (
                        <div
                            key={badge.id}
                            style={{ position: 'relative', cursor: 'pointer', transition: 'transform 0.2s' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.25)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}
                            title={badge.name || (badge.name)}
                        >
                            <img
                                src={badge.url}
                                alt={badge.name || 'Badge'}
                                style={{
                                    width: 32,
                                    height: 32,
                                    objectFit: 'contain',
                                    filter: rgbToFilter(data.contentSettings.biographyColor)
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* BIOGRAPHY */}
            {data.contentSettings.biography && (
                <p style={{ fontSize: 14, color: linkColor, margin: 0, maxWidth: 300, lineHeight: 1.5 }}>
                    {data.contentSettings.biography}
                </p>
            )}

            {/* TAGS */}
            {data.userTagsResponse.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: centered ? 'center' : 'flex-start' }}>
                    {data.userTagsResponse.tags.map((tag) => (
                        <span
                            key={tag.tagId}
                            style={{
                                padding: '4px 12px',
                                borderRadius: 12,
                                border: '2px solid',
                                borderColor: data.contentSettings.biographyColor,
                                color: data.contentSettings.biographyColor,
                                fontSize: 14,
                                fontWeight: 600,
                            }}
                        >
                            {tag.tagName}
                        </span>
                    ))}
                </div>
            )}

            {/* EMBED */}
            {data.embedUrl && (
                <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', marginTop: 8 }}>
                    <iframe
                        src={data.embedUrl}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Embed"
                    />
                </div>
            )}

            {/* VIEW COUNTER */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: data.contentSettings.biographyColor, fontSize: 14, position: 'relative' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
                <span>{data.views.toLocaleString()}</span>

                {showPlusOne && (
                    <span className="animate-float-up" style={{ position: 'absolute', right: -30, color: '#4ade80', fontWeight: 'bold', fontSize: 18 }}>
                        +1
                    </span>
                )}
            </div>

            {/* LINKS TIPADOS */}
            {sortedLinks.typed.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: centered ? 'center' : 'flex-start', width: '100%' }}>
                    {sortedLinks.typed.map((link) => {
                        const typeId = link.typeId ?? link.linkTypeId;
                        const Icon = typeId ? ICON_MAP[typeId] : null;

                        return (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 8,
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    transition: 'all 0.3s',
                                    cursor: 'pointer',
                                }}
                                title={link.title}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                {Icon && <Icon color={linkColor} />}
                            </a>
                        );
                    })}
                </div>
            )}

            {/* LINKS GENÉRICOS */}
            {sortedLinks.generic.length > 0 && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: sortedLinks.typed.length > 0 ? 8 : 0 }}>
                    {sortedLinks.generic.map((link) => {
                        const favicon = getFaviconUrl(link.url);

                        return (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: 12,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: '#fff',
                                    fontWeight: 500,
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 12,
                                    transition: 'all 0.3s',
                                    boxSizing: 'border-box',
                                }}
                                onMouseEnter={(e) => {
                                    const t = e.currentTarget;
                                    t.style.backgroundColor = 'rgba(255,255,255,0.2)';
                                    t.style.borderColor = 'rgba(255,255,255,0.4)';
                                    t.style.transform = 'scale(1.02)';
                                }}
                                onMouseLeave={(e) => {
                                    const t = e.currentTarget;
                                    t.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    t.style.borderColor = 'rgba(255,255,255,0.2)';
                                    t.style.transform = 'scale(1)';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                                    {favicon && (
                                        <img
                                            src={favicon}
                                            alt=""
                                            style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'contain', flexShrink: 0 }}
                                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    )}

                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                        {link.title}
                                    </span>
                                </div>

                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5, flexShrink: 0 }}>
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

const UserPublicPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [data, setData] = useState<UserPageResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPlusOne, setShowPlusOne] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [showMusicPrompt, setShowMusicPrompt] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const hasTriedAutoplay = useRef(false);

    /* FETCH */
    useEffect(() => {
        if (!slug) return;

        const fetchPage = async () => {
            try {
                setLoading(true);
                setError(null);

                const request: RegisterViewRequest = {
                    referrer: document.referrer || undefined,
                    screenWidth: window.screen.width,
                    screenHeight: window.screen.height,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    language: navigator.language,
                };

                const response = await api.post<UserPageResponse>(`/public/${slug}`, request);
                setData(response.data);

                if (response.data.viewCounted) {
                    setShowPlusOne(true);
                    setTimeout(() => setShowPlusOne(false), 2000);
                }
            } catch (err: any) {
                console.error('Erro ao buscar página:', err);
                setError(err.response?.data?.message || 'Erro ao carregar página');
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, [slug]);

    /* FAVICON */
    useEffect(() => {
        if (data?.mediaUrls?.faviconUrl && data?.isPremium) {
            let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
            if (!link) {
                link = document.createElement('link');
                document.head.appendChild(link);
            }
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = data.mediaUrls.faviconUrl;
        }
    }, [data?.mediaUrls?.faviconUrl, data?.isPremium]);

    /* TITLE */
    useEffect(() => {
        if (data?.nameEffects?.name) {
            document.title = `${data.nameEffects.name} | VXO`;
        }
    }, [data?.nameEffects?.name]);

    /* AUTOPLAY MUSIC - TENTA ASSIM QUE CARREGA */
    useEffect(() => {
        if (!data?.mediaUrls?.musicUrl || hasTriedAutoplay.current) return;

        const tryAutoplay = async () => {
            hasTriedAutoplay.current = true;

            if (!audioRef.current) return;

            try {
                audioRef.current.volume = volume;
                await audioRef.current.play();
                setIsPlaying(true);
                console.log('✅ Música iniciada automaticamente');
            } catch (err) {
                console.warn('❌ Autoplay bloqueado pelo navegador:', err);
                setShowMusicPrompt(true); // Mostra overlay pedindo interação
            }
        };

        // Pequeno delay para garantir que o áudio está carregado
        const timer = setTimeout(tryAutoplay, 100);
        return () => clearTimeout(timer);
    }, [data?.mediaUrls?.musicUrl, volume]);

    /* MUSIC CONTROL */
    useEffect(() => {
        if (!audioRef.current) return;

        audioRef.current.volume = volume;

        if (isPlaying) {
            audioRef.current.play().catch((err) => {
                console.error('Erro ao tocar:', err);
                setIsPlaying(false);
            });
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, volume]);

    /* EQUIPPED ITEMS */
    const { badges, frame } = useMemo(() => {
        if (!data?.inventoryResponse?.equipped) return { badges: [], frame: null };

        const eq = data.inventoryResponse.equipped;
        const isPremium = data.isPremium;

        const validItems = eq.filter((item) => {
            if (item.isPremium && !isPremium) {
                console.warn(`Item premium "${item.id}" removido - usuário não é premium`);
                return false;
            }
            return true;
        });

        return {
            badges: validItems.filter((i) => i.type === 'BADGE'),
            frame: validItems.find((i) => i.type === 'FRAME')?.url || null,
        };
    }, [data]);

    /* HANDLER PARA INICIAR MÚSICA MANUALMENTE */
    const handleStartMusic = async () => {
        setShowMusicPrompt(false);

        if (audioRef.current) {
            try {
                audioRef.current.volume = volume;
                await audioRef.current.play();
                setIsPlaying(true);
            } catch (err) {
                console.error('Erro ao iniciar música:', err);
            }
        }
    };

    /* LOADING */
    if (loading) {
        return (
            <>
                <style dangerouslySetInnerHTML={{ __html: globalStylesCSS }} />
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f0f23 100%)' }}>
                    <div style={{ width: 50, height: 50, border: '3px solid rgba(139,92,246,0.3)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
            </>
        );
    }

    /* ERROR */
    if (error || !data) {
        return (
            <>
                <style dangerouslySetInnerHTML={{ __html: globalStylesCSS }} />
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f0f23 100%)', flexDirection: 'column', gap: 16 }}>
                    <h1 style={{ fontSize: 72, fontWeight: 'bold', color: '#fff', margin: 0 }}>404</h1>
                    <p style={{ color: '#9ca3af' }}>Usuário não encontrado</p>
                </div>
            </>
        );
    }

    /* CARD STYLE */
    const cardStyle: React.CSSProperties = {
        backgroundColor: hexToRgba(data.cardSettings.color, data.cardSettings.opacity),
        backdropFilter: `blur(${data.cardSettings.blur}px)`,
        WebkitBackdropFilter: `blur(${data.cardSettings.blur}px)`,
        transform: data.cardSettings.perspective ? 'perspective(1000px) rotateX(2deg)' : 'none',
        transition: 'all 0.3s ease',
        borderRadius: 16,
        padding: 32,
        width: '100%',
        maxWidth: 483,
        border: data.cardSettings.rgbBorder ? 'none' : '1px solid rgba(255,255,255,0.1)',
        boxSizing: 'border-box',
    };

    const getNameClass = () => {
        if (data.nameEffects.neon) return 'name-neon';
        if (data.nameEffects.shiny) return 'name-shiny';
        if (data.nameEffects.rgb) return 'name-rgb';
        return '';
    };

    const handleCardHoverEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        if (data.cardSettings.hoverGrow) {
            e.currentTarget.style.transform = 'scale(1.05)';
        }
    };
    const handleCardHoverLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.transform = data.cardSettings.perspective
            ? 'perspective(1000px) rotateX(2deg)'
            : 'none';
    };

    /* RENDER */
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: globalStylesCSS }} />

            <main
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* BACKGROUND */}
                <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
                    {data.mediaUrls.backgroundUrl ? (
                        <BackgroundMedia url={data.mediaUrls.backgroundUrl} />
                    ) : (
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: data.staticBackgroundColor
                                    ? data.staticBackgroundColor
                                    : "black",
                            }}
                        />
                    )}
                </div>

                {/* PAGE EFFECTS */}
                <PageEffectsManager effects={data.pageEffects} />

                {/* OVERLAY PARA INICIAR MÚSICA */}
                {showMusicPrompt && data.mediaUrls.musicUrl && (
                    <div
                        onClick={handleStartMusic}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 10000,
                            backdropFilter: 'blur(10px)',
                            animation: 'fadeIn 0.3s ease-out',
                        }}
                    >
                        <div
                            style={{
                                padding: '40px 60px',
                                borderRadius: 20,
                                textAlign: 'center',
                            }}
                        >
                            <svg
                                width="64"
                                height="64"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                style={{ margin: '0 auto 20px' }}
                            >
                                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="white" />
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                            </svg>

                            <h2 style={{ color: '#fff', fontSize: 24, marginBottom: 12 }}>
                                {data.contentSettings.biography}
                            </h2>
                        </div>
                    </div>
                )}

                {/* CARD */}
                <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 483 }}>
                    {data.cardSettings.rgbBorder ? (
                        <div className="rgb-border-wrapper">
                            <div
                                style={{ ...cardStyle, borderRadius: 16 }}
                                onMouseEnter={handleCardHoverEnter}
                                onMouseLeave={handleCardHoverLeave}
                            >
                                <CardContent data={data} frame={frame} badges={badges} showPlusOne={showPlusOne} getNameClass={getNameClass} />
                            </div>
                        </div>
                    ) : (
                        <div
                            style={cardStyle}
                            onMouseEnter={handleCardHoverEnter}
                            onMouseLeave={handleCardHoverLeave}
                        >
                            <CardContent data={data} frame={frame} badges={badges} showPlusOne={showPlusOne} getNameClass={getNameClass} />
                        </div>
                    )}
                </div>

                {/* AUDIO ELEMENT */}
                {data.mediaUrls.musicUrl && (
                    <audio
                        ref={audioRef}
                        src={data.mediaUrls.musicUrl}
                        loop
                        preload="auto"
                    />
                )}

                {/* MUSIC PLAYER - CANTO SUPERIOR ESQUERDO */}
                {data.mediaUrls.musicUrl && (
                    <div style={{ position: 'fixed', top: 16, left: 16, display: 'flex', gap: 8, zIndex: 50 }}>
                        {/* PLAY/PAUSE */}
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            style={{
                                padding: 12,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)';
                            }}
                            title={isPlaying ? 'Pausar' : 'Tocar'}
                        >
                            {isPlaying ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="6" y="4" width="4" height="16" />
                                    <rect x="14" y="4" width="4" height="16" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="5,3 19,12 5,21" />
                                </svg>
                            )}
                        </button>

                        {/* DIMINUIR VOLUME */}
                        {isPlaying && (
                            <button
                                onClick={() => setVolume((v) => Math.max(0, v - 0.1))}
                                style={{
                                    padding: 12,
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                title="Diminuir volume"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" />
                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                </svg>
                            </button>
                        )}

                        {/* AUMENTAR VOLUME */}
                        {isPlaying && (
                            <button
                                onClick={() => setVolume((v) => Math.min(1, v + 0.1))}
                                style={{
                                    padding: 12,
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                title="Aumentar volume"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" />
                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                </svg>
                            </button>
                        )}

                        {/* MUTAR */}
                        {isPlaying && (
                            <button
                                onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
                                style={{
                                    padding: 12,
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                title={volume === 0 ? 'Desmutar' : 'Mutar'}
                            >
                                {volume === 0 ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" />
                                        <line x1="23" y1="9" x2="17" y2="15" />
                                        <line x1="17" y1="9" x2="23" y2="15" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" />
                                    </svg>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {/* MARCA D'ÁGUA - SE NÃO FOR PREMIUM */}
                {!data.isPremium && (
                    <div
                        style={{
                            position: 'fixed',
                            bottom: 16,
                            right: 16,
                            padding: '6px 10px',
                            fontSize: 12,
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.6)',
                            background: 'rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(6px)',
                            borderRadius: 8,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            transition: 'all 0.2s ease',
                            zIndex: 50,
                            userSelect: 'none',
                            cursor: 'default'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        Criado por <strong>VXO</strong> 💖
                    </div>
                )}
            </main>
        </>
    );
};

export default UserPublicPage;