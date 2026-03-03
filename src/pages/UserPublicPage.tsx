import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { publicApi } from '../services/api';
import { Turnstile } from '@marsidev/react-turnstile';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES — aligned with backend UserPageFrontendSimplifiedResponse
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
    viewColor: string;
    badgeColor: string;
    tagColor: string;
}

interface NameEffects {
    name: string;
    nameColor: string;
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
    type: 'FRAME' | 'BADGE' | 'CARD_EFFECT';
    isPremium: boolean;
    equipped: boolean;
    name?: string;
}

interface InventoryPublicResponse {
    equipped: InventoryItem[];
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
    linkText: string; // Texto extraído do link
}

interface UserLinksResponse {
    links: UserLink[];
}

interface TagResponse {
    tagId: number;
    tagName: string;
}

interface UserTagsResponse {
    tags: TagResponse[];
}

/**
 * Matches backend: UserPageFrontendSimplifiedResponse
 * NO views, NO viewCounted — those come from POST /view
 */
interface UserPageSimplifiedResponse {
    pageEffects: PageEffects;
    cardSettings: CardSettings;
    contentSettings: ContentSettings;
    userTagsResponse: UserTagsResponse;
    nameEffects: NameEffects;
    mediaUrls: MediaUrls;
    inventoryResponse: InventoryPublicResponse;
    userLinksResponse: UserLinksResponse;
    embedUrl: string | null;
    staticBackgroundColor: string | null;
    slug: string;
    isPremium: boolean;
    cachedViews: number; // For SEO and initial render before POST /view returns
}

/**
 * Matches backend: RegisterViewResponse
 */
interface RegisterViewResponse {
    viewCounted: boolean;
    views: number;
}

interface RegisterViewRequest {
    visitorId?: string;
    fingerprint?: string;
    turnstileToken?: string;
    referrer?: string;
    screenWidth?: number;
    screenHeight?: number;
    timezone?: string;
    language?: string;
}

/**
 * Internal state: page data + view info (merged from both endpoints)
 */
interface UserPageState {
    pageEffects: PageEffects;
    cardSettings: CardSettings;
    contentSettings: ContentSettings;
    userTagsResponse: UserTagsResponse;
    nameEffects: NameEffects;
    mediaUrls: MediaUrls;
    inventoryResponse: InventoryPublicResponse;
    userLinksResponse: UserLinksResponse;
    embedUrl: string | null;
    staticBackgroundColor: string | null;
    slug: string;
    isPremium: boolean;
    // View data — populated from POST /view response
    views: number;
    viewCounted: boolean;
}

interface IconProps {
    color?: string;
}

const VERIFIED_BADGE_ID = "vxo_badge_e01uyc9s2xkpvz";

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */

const extractBadgeName = (url: string): string => {
    try {
        const pathname = new URL(url).pathname;
        const filename = pathname.split('/').pop() || '';
        const name = filename.replace(/\.(svg|png|jpg|jpeg|gif|webp)$/i, '');
        return name
            .replace(/[-_]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ') || 'Badge';
    } catch {
        return 'Badge';
    }
};

const isVerifiedBadge = (badge: InventoryItem): boolean =>
    badge.id === VERIFIED_BADGE_ID || badge.url.toLowerCase().includes('verificado');

const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
};

const faviconCache = new Map<string, string>();
const getFaviconUrl = (url: string): string => {
    if (faviconCache.has(url)) return faviconCache.get(url)!;
    try {
        const domain = new URL(url).origin;
        const result = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        faviconCache.set(url, result);
        return result;
    } catch {
        return '';
    }
};

const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m3u8']);
const isVideoUrl = (url: string): boolean => {
    try {
        const pathname = new URL(url).pathname.toLowerCase();
        for (const ext of VIDEO_EXTENSIONS) {
            if (pathname.endsWith(ext)) return true;
        }
        return false;
    } catch {
        const clean = url.toLowerCase().split('?')[0].split('#')[0];
        for (const ext of VIDEO_EXTENSIONS) {
            if (clean.endsWith(ext)) return true;
        }
        return false;
    }
};

const getErrorMessage = (err: unknown): string => {
    if (
        err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
    ) {
        return String(err.response.data.message);
    }
    return 'Erro ao carregar página';
};

/* ═══════════════════════════════════════════════════════════════════════════
   PRELOAD CRITICAL IMAGES
═══════════════════════════════════════════════════════════════════════════ */

function preloadCriticalImages(data: UserPageSimplifiedResponse) {
    const urls: { url: string; priority: 'high' | 'low' }[] = [];

    if (data.mediaUrls.backgroundUrl && !isVideoUrl(data.mediaUrls.backgroundUrl)) {
        urls.push({ url: data.mediaUrls.backgroundUrl, priority: 'high' });
    }
    if (data.mediaUrls.profileImageUrl) {
        urls.push({ url: data.mediaUrls.profileImageUrl, priority: 'high' });
    }

    urls.forEach(({ url, priority }) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        link.setAttribute('fetchpriority', priority);
        document.head.appendChild(link);
    });
}

/* ═══════════════════════════════════════════════════════════════════════════
   RGB TO FILTER
═══════════════════════════════════════════════════════════════════════════ */

const filterCache = new Map<string, string>();

function rgbToFilter(c: string): string {
    const parse = (c: string) => {
        if (c.startsWith('#')) {
            const h = c.replace('#', '');
            const f = h.length === 3;
            return [0, 1, 2].map(i => parseInt(f ? h[i] + h[i] : h.slice(i * 2, i * 2 + 2), 16));
        }
        return (c.match(/\d+/g) || []).map(Number);
    };

    const [tr, tg, tb] = parse(c);
    const clamp = (v: number) => Math.max(0, Math.min(255, v));

    const toHSL = (r: number, g: number, b: number) => {
        const [nr, ng, nb] = [r / 255, g / 255, b / 255];
        const max = Math.max(nr, ng, nb), min = Math.min(nr, ng, nb);
        let h = 0, s = 0;
        const l = (max + min) / 2;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            h = max === nr ? ((ng - nb) / d + (ng < nb ? 6 : 0)) / 6
                : max === ng ? ((nb - nr) / d + 2) / 6
                    : ((nr - ng) / d + 4) / 6;
        }
        return [h * 360, s * 100, l * 100];
    };

    const targetHSL = toHSL(tr, tg, tb);

    const applyFilters = (f: number[]) => {
        let r = 0, g = 0, b = 0;
        const linear = (slope: number, int: number) => {
            r = clamp(r * slope + int * 255);
            g = clamp(g * slope + int * 255);
            b = clamp(b * slope + int * 255);
        };
        const iv = f[0] / 100;
        r = clamp((iv + (r / 255) * (1 - 2 * iv)) * 255);
        g = clamp((iv + (g / 255) * (1 - 2 * iv)) * 255);
        b = clamp((iv + (b / 255) * (1 - 2 * iv)) * 255);
        const sv = f[1] / 100;
        const [sr, sg, sb] = [r, g, b];
        r = clamp(sr * (1 - .607 * sv) + sg * .769 * sv + sb * .189 * sv);
        g = clamp(sr * .349 * sv + sg * (1 - .314 * sv) + sb * .168 * sv);
        b = clamp(sr * .272 * sv + sg * .534 * sv + sb * (1 - .869 * sv));
        const stv = f[2] / 100;
        const [sa, sag, sab] = [r, g, b];
        r = clamp(sa * (.213 + .787 * stv) + sag * (.715 - .715 * stv) + sab * (.072 - .072 * stv));
        g = clamp(sa * (.213 - .213 * stv) + sag * (.715 + .285 * stv) + sab * (.072 - .072 * stv));
        b = clamp(sa * (.213 - .213 * stv) + sag * (.715 - .715 * stv) + sab * (.072 + .928 * stv));
        const rad = (f[3] * 3.6 / 180) * Math.PI;
        const cos = Math.cos(rad), sin = Math.sin(rad);
        const [hr, hg, hb] = [r, g, b];
        r = clamp(hr * (.213 + cos * .787 - sin * .213) + hg * (.715 - cos * .715 - sin * .715) + hb * (.072 - cos * .072 + sin * .928));
        g = clamp(hr * (.213 - cos * .213 + sin * .143) + hg * (.715 + cos * .285 + sin * .14) + hb * (.072 - cos * .072 - sin * .283));
        b = clamp(hr * (.213 - cos * .213 - sin * .787) + hg * (.715 - cos * .715 + sin * .715) + hb * (.072 + cos * .928 + sin * .072));
        linear(f[4] / 100, 0);
        linear(f[5] / 100, -(0.5 * f[5] / 100) + 0.5);

        const hsl = toHSL(r, g, b);
        return Math.abs(r - tr) + Math.abs(g - tg) + Math.abs(b - tb)
            + Math.abs(hsl[0] - targetHSL[0]) + Math.abs(hsl[1] - targetHSL[1]) + Math.abs(hsl[2] - targetHSL[2]);
    };

    const fix = (v: number, i: number) => {
        const max = [100, 100, 7500, 350, 100, 100][i];
        if (i === 2) v = v % 7500; else if (i === 4) v = v % 360;
        return Math.max(0, Math.min(v, max));
    };

    const spsa = (A: number, a: number[], c: number, vals: number[], iters: number) => {
        let best = { loss: Infinity, values: vals.slice() };
        const deltas = Array(6), high = Array(6), low = Array(6);
        for (let k = 0; k < iters; k++) {
            const ck = c / Math.pow(k + 1, 0.16667);
            for (let i = 0; i < 6; i++) {
                deltas[i] = Math.random() > 0.5 ? 1 : -1;
                high[i] = vals[i] + ck * deltas[i];
                low[i] = vals[i] - ck * deltas[i];
            }
            const diff = applyFilters(high) - applyFilters(low);
            for (let i = 0; i < 6; i++) {
                vals[i] = fix(vals[i] - (a[i] / Math.pow(A + k + 1, 1)) * (diff / (2 * ck)) * deltas[i], i);
            }
            const loss = applyFilters(vals);
            if (loss < best.loss) best = { loss, values: vals.slice() };
        }
        return best;
    };

    let best = { loss: Infinity, values: [] as number[] };
    const a = [60, 180, 18000, 600, 1.2, 1.2];
    for (let i = 0; i < 3; i++) {
        const r = spsa(5, a, 15, [50, 20, 3750, 50, 100, 100], 1000);
        if (r.loss < best.loss) best = r;
    }
    const A5 = best.loss + 1;
    const narrow = spsa(best.loss, [.25 * A5, .25 * A5, A5, .25 * A5, .2 * A5, .2 * A5], 2, best.values, 500);
    const f = narrow.values;

    return `invert(${Math.round(f[0])}%) sepia(${Math.round(f[1])}%) saturate(${Math.round(f[2])}%) hue-rotate(${Math.round(f[3] * 3.6)}deg) brightness(${Math.round(f[4])}%) contrast(${Math.round(f[5])}%)`;
}

const useDeferredFilter = (color: string): string => {
    const [filter, setFilter] = useState(() => {
        if (!color || color === 'transparent' || color === 'rgb(255, 255, 255)') return 'none';
        return filterCache.get(color) ?? 'none';
    });

    useEffect(() => {
        if (!color || color === 'transparent' || color === 'rgb(255, 255, 255)') {
            setFilter('none');
            return;
        }
        if (filterCache.has(color)) {
            setFilter(filterCache.get(color)!);
            return;
        }

        const compute = () => {
            const result = rgbToFilter(color);
            filterCache.set(color, result);
            setFilter(result);
        };

        if ('requestIdleCallback' in window) {
            const id = requestIdleCallback(compute, { timeout: 500 });
            return () => cancelIdleCallback(id);
        } else {
            const id = setTimeout(compute, 50);
            return () => clearTimeout(id);
        }
    }, [color]);

    return filter;
};

/* ═══════════════════════════════════════════════════════════════════════════
   FINGERPRINT
═══════════════════════════════════════════════════════════════════════════ */

let fpPromise: Promise<string> | null = null;
const getFingerprint = (): Promise<string> => {
    if (!fpPromise) {
        fpPromise = import('@fingerprintjs/fingerprintjs')
            .then(mod => mod.default.load())
            .then(fp => fp.get())
            .then(r => r.visitorId)
            .catch(() => 'unknown');
    }
    return fpPromise;
};

const getVisitorId = (): string => {
    let id = localStorage.getItem('visitorId');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('visitorId', id);
    }
    return id;
};

/* ═══════════════════════════════════════════════════════════════════════════
   VERIFIED ICON
═══════════════════════════════════════════════════════════════════════════ */

const VERIFIED_ICON_PATH = "M21.007 8.27C22.194 9.125 23 10.45 23 12c0 1.55-.806 2.876-1.993 3.73.24 1.442-.134 2.958-1.227 4.05-1.095 1.095-2.61 1.459-4.046 1.225C14.883 22.196 13.546 23 12 23c-1.55 0-2.878-.807-3.731-1.996-1.438.235-2.954-.128-4.05-1.224-1.095-1.095-1.459-2.611-1.217-4.05C1.816 14.877 1 13.551 1 12s.816-2.878 2.002-3.73c-.242-1.439.122-2.955 1.218-4.05 1.093-1.094 2.61-1.467 4.057-1.227C9.125 1.804 10.453 1 12 1c1.545 0 2.88.803 3.732 1.993 1.442-.24 2.956.135 4.048 1.227 1.093 1.092 1.468 2.608 1.227 4.05Zm-4.426-.084a1 1 0 0 1 .233 1.395l-5 7a1 1 0 0 1-1.521.126l-3-3a1 1 0 0 1 1.414-1.414l2.165 2.165 4.314-6.04a1 1 0 0 1 1.395-.232Z";

const VerifiedIcon: React.FC<{ size?: number }> = React.memo(({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, overflow: "visible" }}>
        <defs>
            <linearGradient id="vGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <filter id="vGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
                <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.15 0 0 0 0 0.39 0 0 0 0 0.92 0 0 0 0.6 0" result="glow" />
                <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <clipPath id="vClip"><path d={VERIFIED_ICON_PATH} /></clipPath>
            <linearGradient id="vShine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="50%" stopColor="white" stopOpacity="0.35" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
        </defs>
        <path fillRule="evenodd" clipRule="evenodd" d={VERIFIED_ICON_PATH} fill="url(#vGrad)" filter="url(#vGlow)" />
        <g clipPath="url(#vClip)">
            <g transform="rotate(30 12 12)">
                <rect y="-5" width="8" height="35" fill="url(#vShine)">
                    <animate attributeName="x" values="-12; 28; 28" keyTimes="0; 0.4; 1" dur="3s" repeatCount="indefinite" />
                </rect>
            </g>
        </g>
    </svg>
));
VerifiedIcon.displayName = 'VerifiedIcon';

/* ═══════════════════════════════════════════════════════════════════════════
   BADGE TOOLTIP
═══════════════════════════════════════════════════════════════════════════ */

const BADGE_TOOLTIP_STYLES = `
@keyframes tooltip-pop {
    0%   { opacity: 0; transform: translateX(-50%) translateY(6px) scale(0.85); }
    70%  { transform: translateX(-50%) translateY(-3px) scale(1.04); }
    100% { opacity: 1; transform: translateX(-50%) translateY(-2px) scale(1); }
}
.badge-img-hover {
    animation: badge-spin-glow 0.55s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.badge-tooltip {
    position: absolute; bottom: calc(100% + 10px); left: 50%;
    transform: translateX(-50%) translateY(-2px); white-space: nowrap;
    background: linear-gradient(135deg, rgba(30,30,40,0.97) 0%, rgba(50,50,70,0.97) 100%);
    color: #fff; font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
    padding: 5px 10px; border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.1) inset, 0 0 12px rgba(255,255,255,0.08);
    pointer-events: none; animation: tooltip-pop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 9999;
}
.badge-tooltip::after {
    content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
    border: 5px solid transparent; border-top-color: rgba(50,50,70,0.97);
    filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));
}
`;

interface BadgeWithTooltipProps {
    badge: InventoryItem;
    biographyColor: string;
}

const BadgeWithTooltip: React.FC<BadgeWithTooltipProps> = React.memo(({ badge, biographyColor }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const badgeName = useMemo(() => badge.name || extractBadgeName(badge.url), [badge.name, badge.url]);
    const colorFilter = useDeferredFilter(biographyColor);
    const isColorReady = colorFilter !== 'none';

    const imgStyle = useMemo((): React.CSSProperties => ({
        width: 24, height: 24, objectFit: 'contain',
        transition: showTooltip ? 'none' : 'filter 0.3s ease-in-out, opacity 0.3s ease-in-out, transform 0.3s ease',
        opacity: isColorReady ? 1 : 0.5,
        filter: isColorReady ? `${colorFilter} drop-shadow(0 0 1px ${biographyColor}80)` : 'grayscale(1)',
    }), [showTooltip, isColorReady, colorFilter, biographyColor]);

    const onEnter = useCallback(() => setShowTooltip(true), []);
    const onLeave = useCallback(() => setShowTooltip(false), []);

    return (
        <div style={{ position: 'relative', cursor: 'pointer', display: 'inline-flex' }} onMouseEnter={onEnter} onMouseLeave={onLeave}>
            <img
                key={biographyColor}
                src={badge.url}
                alt={badgeName}
                className={showTooltip ? 'badge-img-hover' : undefined}
                style={imgStyle}
                loading="lazy"
            />
            {showTooltip && <div className="badge-tooltip">{badgeName}</div>}
        </div>
    );
});
BadgeWithTooltip.displayName = 'BadgeWithTooltip';

/* ═══════════════════════════════════════════════════════════════════════════
   VOLUME SLIDER
═══════════════════════════════════════════════════════════════════════════ */

interface VolumeSliderProps {
    volume: number;
    onChange: (volume: number) => void;
    isPlaying: boolean;
    onTogglePlay: () => void;
    onToggleMute: () => void;
}

const VolumeSlider: React.FC<VolumeSliderProps> = React.memo(({
    volume, onChange, isPlaying, onTogglePlay, onToggleMute,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [audioLevels, setAudioLevels] = useState<number[]>([0.3, 0.5, 0.7, 0.4, 0.6, 0.8, 0.5, 0.3]);
    const sliderRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isPlaying) {
            setAudioLevels([0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]);
            return;
        }
        const interval = setInterval(() => {
            setAudioLevels(prev => prev.map(() => 0.2 + Math.random() * 0.8 * volume));
        }, 100);
        return () => clearInterval(interval);
    }, [isPlaying, volume]);

    useEffect(() => {
        if (!isExpanded) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsExpanded(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded]);

    const handleSliderInteraction = useCallback((e: React.MouseEvent | MouseEvent) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const y = Math.max(0, Math.min(1, (rect.bottom - e.clientY) / rect.height));
        onChange(Math.round(y * 100) / 100);
    }, [onChange]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        handleSliderInteraction(e);
        const handleMouseMove = (e: MouseEvent) => {
            if (!sliderRef.current) return;
            const rect = sliderRef.current.getBoundingClientRect();
            const y = Math.max(0, Math.min(1, (rect.bottom - e.clientY) / rect.height));
            onChange(Math.round(y * 100) / 100);
        };
        const handleMouseUp = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [handleSliderInteraction, onChange]);

    const handleMainClick = useCallback(() => {
        if (isExpanded) onTogglePlay(); else setIsExpanded(true);
    }, [isExpanded, onTogglePlay]);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsExpanded(prev => !prev);
    }, []);

    const onHoverEnter = useCallback(() => setIsHovering(true), []);
    const onHoverLeave = useCallback(() => setIsHovering(false), []);

    const VolumeIcon = useMemo(() => {
        if (volume === 0) {
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="22" y1="9" x2="16" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="16" y1="9" x2="22" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            );
        }
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2" />
                {volume > 0 && (
                    <path d="M15.54 8.46C16.48 9.4 17 10.67 17 12C17 13.33 16.48 14.6 15.54 15.54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ opacity: volume > 0.3 ? 1 : 0.4, transition: 'opacity 0.2s' }} />
                )}
                {volume > 0.5 && (
                    <path d="M18.07 5.93C19.78 7.64 20.75 9.78 20.75 12C20.75 14.22 19.78 16.36 18.07 18.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ opacity: volume > 0.6 ? 1 : 0.4, transition: 'opacity 0.2s' }} />
                )}
            </svg>
        );
    }, [volume]);

    const PlayPauseIcon = useMemo(() => (
        <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1">
                        <animate attributeName="height" values="16;12;16" dur="0.5s" repeatCount="indefinite" />
                        <animate attributeName="y" values="4;6;4" dur="0.5s" repeatCount="indefinite" />
                    </rect>
                    <rect x="14" y="4" width="4" height="16" rx="1">
                        <animate attributeName="height" values="12;16;12" dur="0.5s" repeatCount="indefinite" />
                        <animate attributeName="y" values="6;4;6" dur="0.5s" repeatCount="indefinite" />
                    </rect>
                </svg>
            ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36a1 1 0 00-1.5.86z" />
                </svg>
            )}
        </div>
    ), [isPlaying]);

    const volumeDasharray = useMemo(() => `${volume * 150.8} 150.8`, [volume]);

    return (
        <div
            ref={containerRef}
            onMouseEnter={onHoverEnter}
            onMouseLeave={onHoverLeave}
            style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        >
            <div style={{
                position: 'relative', width: 56,
                height: isExpanded ? 180 : 0, opacity: isExpanded ? 1 : 0,
                transform: isExpanded ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: isExpanded ? 'auto' : 'none', overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(20,20,20,0.98) 100%)',
                    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: 28, border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 -20px 40px rgba(255,255,255,0.02) inset',
                    padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', opacity: 0.9, letterSpacing: '0.05em', fontFamily: 'SF Mono, Monaco, monospace' }}>
                        {Math.round(volume * 100)}%
                    </div>
                    <div ref={sliderRef} onMouseDown={handleMouseDown} style={{ position: 'relative', width: 32, height: 100, cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ position: 'absolute', width: 6, height: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                height: `${volume * 100}%`,
                                background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
                                borderRadius: 3, transition: isDragging ? 'none' : 'height 0.15s ease-out',
                                boxShadow: '0 0 12px rgba(255,255,255,0.3)',
                            }} />
                        </div>
                        <div style={{
                            position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                            gap: 2, padding: '0 2px', opacity: isPlaying ? 0.6 : 0, transition: 'opacity 0.3s',
                        }}>
                            {audioLevels.map((level, i) => (
                                <div key={i} style={{
                                    width: 2, height: `${level * 100}%`,
                                    background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 100%)',
                                    borderRadius: 1, transition: 'height 0.1s ease-out',
                                }} />
                            ))}
                        </div>
                        <div style={{
                            position: 'absolute', left: '50%',
                            bottom: `calc(${volume * 100}% - 8px)`,
                            transform: `translateX(-50%) scale(${isDragging ? 1.2 : 1})`,
                            width: 16, height: 16, background: '#fff', borderRadius: '50%',
                            boxShadow: `0 2px 8px rgba(0,0,0,0.3), 0 0 0 ${isDragging ? '8px' : '0px'} rgba(255,255,255,0.1)`,
                            transition: isDragging ? 'transform 0.1s, box-shadow 0.2s' : 'all 0.15s ease-out',
                            cursor: 'grab',
                        }}>
                            <div style={{
                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                width: 6, height: 6, background: 'linear-gradient(135deg, #333 0%, #000 100%)', borderRadius: '50%',
                            }} />
                        </div>
                    </div>
                    <button
                        onClick={onToggleMute}
                        style={{
                            width: 32, height: 32,
                            background: volume === 0 ? 'rgba(255,59,48,0.2)' : 'rgba(255,255,255,0.1)',
                            border: 'none', borderRadius: '50%', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s', color: volume === 0 ? '#ff3b30' : '#fff',
                        }}
                    >
                        <div style={{ color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{VolumeIcon}</div>
                    </button>
                </div>
            </div>
            <button
                onClick={handleMainClick}
                onContextMenu={handleContextMenu}
                style={{
                    position: 'relative', width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, rgba(30,30,30,0.98) 0%, rgba(10,10,10,0.98) 100%)',
                    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset${isPlaying ? ', 0 0 20px rgba(255,255,255,0.1)' : ''}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isHovering ? 'scale(1.05)' : 'scale(1)', overflow: 'hidden',
                }}
            >
                {isPlaying && (
                    <div style={{
                        position: 'absolute', inset: -2, borderRadius: '50%',
                        border: '2px solid transparent', borderTopColor: 'rgba(255,255,255,0.5)',
                        animation: 'spin 2s linear infinite',
                    }} />
                )}
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />
                <svg style={{ position: 'absolute', width: 52, height: 52, transform: 'rotate(-90deg)' }}>
                    <circle cx="26" cy="26" r="24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                    <circle cx="26" cy="26" r="24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeDasharray={volumeDasharray} style={{ transition: 'stroke-dasharray 0.2s ease-out' }} />
                </svg>
                {PlayPauseIcon}
            </button>
            <div style={{
                position: 'absolute', right: 70, bottom: 14, padding: '6px 12px',
                background: 'rgba(0,0,0,0.9)', borderRadius: 8, fontSize: 12, color: '#fff', whiteSpace: 'nowrap',
                opacity: isHovering && !isExpanded ? 1 : 0,
                transform: isHovering && !isExpanded ? 'translateX(0)' : 'translateX(10px)',
                transition: 'all 0.2s', pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
                {isPlaying ? 'Tocando' : 'Pausado'} • Clique para {isPlaying ? 'pausar' : 'tocar'}
            </div>
        </div>
    );
});
VolumeSlider.displayName = 'VolumeSlider';

/* ═══════════════════════════════════════════════════════════════════════════
   SOCIAL ICONS  (mantidos exatamente como no original)
═══════════════════════════════════════════════════════════════════════════ */

const InstagramIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30">
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
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#FFFC00"}>
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
    </svg>
);

const YouTubeIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={color || "#FFFC00"}><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="red" d="M14.712 4.633a1.754 1.754 0 00-1.234-1.234C12.382 3.11 8 3.11 8 3.11s-4.382 0-5.478.289c-.6.161-1.072.634-1.234 1.234C1 5.728 1 8 1 8s0 2.283.288 3.367c.162.6.635 1.073 1.234 1.234C3.618 12.89 8 12.89 8 12.89s4.382 0 5.478-.289a1.754 1.754 0 001.234-1.234C15 10.272 15 8 15 8s0-2.272-.288-3.367z"></path><path fill="#ffffff" d="M6.593 10.11l3.644-2.098-3.644-2.11v4.208z"></path></g></svg>
);

const DiscordIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#5865F2"}>
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
);

const FacebookIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#1877F2"}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const TwitterIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#000000"}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const TikTokIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#000000"}>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
);

const LastFmIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#D51007"}>
        <path d="M10.584 17.21l-.88-2.392s-1.43 1.594-3.573 1.594c-1.897 0-3.244-1.649-3.244-4.288 0-3.381 1.704-4.591 3.381-4.591 2.42 0 3.189 1.567 3.849 3.574l.88 2.749c.88 2.666 2.529 4.81 7.285 4.81 3.409 0 5.718-1.044 5.718-3.793 0-2.227-1.265-3.381-3.63-3.931l-1.758-.385c-1.21-.275-1.567-.77-1.567-1.594 0-.935.742-1.484 1.952-1.484 1.32 0 2.034.495 2.144 1.677l2.749-.33c-.22-2.474-1.924-3.492-4.729-3.492-2.474 0-4.893.935-4.893 3.932 0 1.87.907 3.051 3.189 3.601l1.87.44c1.402.33 1.869.825 1.869 1.677 0 1.044-1.016 1.456-2.914 1.456-2.831 0-4.014-1.484-4.674-3.52l-.907-2.749c-1.155-3.574-2.997-4.894-6.653-4.894C2.144 5.333 0 7.89 0 12.233c0 4.18 2.144 6.434 5.993 6.434 3.106 0 4.591-1.457 4.591-1.457z" />
    </svg>
);

const SteamIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#000000"}>
        <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0z" />
    </svg>
);

const GitHubIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#181717"}>
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
);

const SpotifyIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#1DB954"}>
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
);

const TwitchIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#9146FF"}>
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
    </svg>
);

const SoundcloudIcon: React.FC<IconProps> = ({ }) => (
    <svg width="30" height="30" fill="#FF5500" viewBox="-271 345.8 256 111.2"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M-238.4,398.1c-0.8,0-1.4,0.6-1.5,1.5l-2.3,28l2.3,27.1c0.1,0.8,0.7,1.5,1.5,1.5c0.8,0,1.4-0.6,1.5-1.5l2.6-27.1l-2.6-28 C-237,398.7-237.7,398.1-238.4,398.1z"></path> <path d="M-228.2,399.9c-0.9,0-1.7,0.7-1.7,1.7l-2.1,26l2.1,27.3c0.1,1,0.8,1.7,1.7,1.7c0.9,0,1.6-0.7,1.7-1.7l2.4-27.3l-2.4-26 C-226.6,400.6-227.3,399.9-228.2,399.9z"></path> <path d="M-258.6,403.5c-0.5,0-1,0.4-1.1,1l-2.5,23l2.5,22.5c0.1,0.6,0.5,1,1.1,1c0.5,0,1-0.4,1.1-1l2.9-22.5l-2.9-23 C-257.7,404-258.1,403.5-258.6,403.5z"></path> <path d="M-268.1,412.3c-0.5,0-1,0.4-1,1l-1.9,14.3l1.9,14c0.1,0.6,0.5,1,1,1s0.9-0.4,1-1l2.2-14l-2.2-14.2 C-267.2,412.8-267.6,412.3-268.1,412.3z"></path> <path d="M-207.5,373.5c-1.2,0-2.1,0.9-2.2,2.1l-1.9,52l1.9,27.2c0.1,1.2,1,2.1,2.2,2.1s2.1-0.9,2.2-2.1l2.1-27.2l-2.1-52 C-205.4,374.4-206.4,373.5-207.5,373.5z"></path> <path d="M-248.6,399c-0.7,0-1.2,0.5-1.3,1.3l-2.4,27.3l2.4,26.3c0.1,0.7,0.6,1.3,1.3,1.3c0.7,0,1.2-0.5,1.3-1.2l2.7-26.3l-2.7-27.3 C-247.4,399.6-247.9,399-248.6,399z"></path> <path d="M-217.9,383.4c-1,0-1.9,0.8-1.9,1.9l-2,42.3l2,27.3c0.1,1.1,0.9,1.9,1.9,1.9s1.9-0.8,1.9-1.9l2.3-27.3l-2.3-42.3 C-216,384.2-216.9,383.4-217.9,383.4z"></path> <path d="M-154.4,359.3c-1.8,0-3.2,1.4-3.2,3.2l-1.2,65l1.2,26.1c0,1.8,1.5,3.2,3.2,3.2c1.8,0,3.2-1.5,3.2-3.2l1.4-26.1l-1.4-65 C-151.1,360.8-152.6,359.3-154.4,359.3z"></path> <path d="M-197.1,368.9c-1.3,0-2.3,1-2.4,2.4l-1.8,56.3l1.8,26.9c0,1.3,1.1,2.3,2.4,2.3s2.3-1,2.4-2.4l2-26.9l-2-56.3 C-194.7,370-195.8,368.9-197.1,368.9z"></path> <path d="M-46.5,394c-4.3,0-8.4,0.9-12.2,2.4C-61.2,368-85,345.8-114,345.8c-7.1,0-14,1.4-20.1,3.8c-2.4,0.9-3,1.9-3,3.7v99.9 c0,1.9,1.5,3.5,3.4,3.7c0.1,0,86.7,0,87.3,0c17.4,0,31.5-14.1,31.5-31.5C-15,408.1-29.1,394-46.5,394z"></path> <path d="M-143.6,353.2c-1.9,0-3.4,1.6-3.5,3.5l-1.4,70.9l1.4,25.7c0,1.9,1.6,3.4,3.5,3.4c1.9,0,3.4-1.6,3.5-3.5l1.5-25.8l-1.5-70.9 C-140.2,354.8-141.7,353.2-143.6,353.2z"></path> <path d="M-186.5,366.8c-1.4,0-2.5,1.1-2.6,2.6l-1.6,58.2l1.6,26.7c0,1.4,1.2,2.6,2.6,2.6s2.5-1.1,2.6-2.6l1.8-26.7l-1.8-58.2 C-184,367.9-185.1,366.8-186.5,366.8z"></path> <path d="M-175.9,368.1c-1.5,0-2.8,1.2-2.8,2.8l-1.5,56.7l1.5,26.5c0,1.6,1.3,2.8,2.8,2.8s2.8-1.2,2.8-2.8l1.7-26.5l-1.7-56.7 C-173.1,369.3-174.3,368.1-175.9,368.1z"></path> <path d="M-165.2,369.9c-1.7,0-3,1.3-3,3l-1.4,54.7l1.4,26.3c0,1.7,1.4,3,3,3c1.7,0,3-1.3,3-3l1.5-26.3l-1.5-54.7 C-162.2,371.3-163.5,369.9-165.2,369.9z"></path> </g> </g></svg>

);

const WhatsappIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#25D366"}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
);

const TelegramIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#26A5E4"}>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

const BattleNetIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#00AEFF"}>
        <path d="M10.457 0c-.37.018-.734.14-1.062.377C8.19 1.26 7.91 3.153 8.16 5.63a21.09 21.09 0 00-3.907 2.321c-.192-.403-.503-.896-.926-1.238-.91-.736-1.992-.645-2.853.083-.795.672-1.089 1.715-.803 2.853.265 1.057.918 2.195 1.848 3.283-1.11 2.025-1.616 3.874-1.449 5.33.148 1.291.808 2.34 1.89 2.975 1.505.883 3.467.646 5.634-.54.28.257.567.51.864.758.263 1.1.582 1.88 1.059 2.35a2.147 2.147 0 001.571.643c.67-.014 1.26-.322 1.69-.781.67-.716.894-1.782.689-2.96a21.063 21.063 0 003.063-2.037c.314.522.782 1.065 1.327 1.417.935.605 2.01.574 2.903-.108.825-.63 1.196-1.65.996-2.8-.186-1.066-.76-2.223-1.627-3.346 1.025-1.903 1.494-3.639 1.382-5.012-.096-1.18-.608-2.162-1.49-2.807-.864-.632-1.974-.847-3.157-.66-1.02.161-2.104.578-3.218 1.206a21.197 21.197 0 00-3.243-2.208c-.148-1.105-.418-1.93-.872-2.454A2.147 2.147 0 0010.457 0z" />
    </svg>
);

const LinkedinIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#0A66C2"}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const PayPalIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#003087"}>
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" />
    </svg>
);

const XboxIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#107C10"}>
        <path d="M5.112 3.4C6.88 1.983 9.14 1.04 11.999 1c2.86.04 5.12.983 6.889 2.4C17.362 1.862 15.03 1.207 12 1.207S6.638 1.862 5.112 3.4z" />
        <path d="M4.102 21.033C6.211 22.881 8.977 24 12 24c3.026 0 5.789-1.119 7.902-2.967 1.877-1.912-4.316-8.709-7.902-11.417-3.582 2.708-9.779 9.505-7.898 11.417z" />
        <path d="M4.012 4.108C2.272 5.836.879 8.222.879 11.4c0 2.548.801 5.131 2.209 7.052C2.088 14.364 4.771 9.4 7.577 6.8c-.975-.876-2.375-1.9-3.565-2.692z" />
        <path d="M16.423 6.8c2.806 2.6 5.489 7.564 4.489 11.652 1.408-1.921 2.209-4.504 2.209-7.052 0-3.178-1.393-5.564-3.133-7.292-1.19.792-2.59 1.816-3.565 2.692z" />
        <path d="M15.904 6.205C14.354 4.962 13.04 4.17 12 3.873c-1.04.297-2.354 1.089-3.904 2.332C9.398 7.62 10.745 8.95 12 10.05c1.255-1.1 2.602-2.43 3.904-3.845z" />
    </svg>
);
const PinterestIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#BD081C"}>
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
    </svg>
);

const LetterboxdIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#00D735"}>
        <path d="M8.224 14.352a4.447 4.447 0 0 1-3.775 2.092C1.992 16.444 0 14.454 0 12s1.992-4.444 4.45-4.444c1.592 0 2.988.836 3.774 2.092-.483.74-.764 1.622-.764 2.572s.281 1.834.764 2.572z" />
    </svg>
);

const TumblrIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#36465D"}>
        <path d="M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.156 1.404h-.167z" />
    </svg>
);

const VSCOIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#000000"}>
        <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 2.592a9.408 9.408 0 110 18.816 9.408 9.408 0 010-18.816zm0 1.56a7.848 7.848 0 100 15.696 7.848 7.848 0 000-15.696zm0 1.896a5.952 5.952 0 110 11.904 5.952 5.952 0 010-11.904zm0 1.776a4.176 4.176 0 100 8.352 4.176 4.176 0 000-8.352z" />
    </svg>
);

const OnlyfansIcon: React.FC<IconProps> = ({ color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-20.62 0.53 820.42 555.49" width="30" height="30" fill={color || "#00AFF0"}><path d="M266.82.53c35 0 69.65 6.91 101.98 20.34s61.71 33.11 86.45 57.93c24.75 24.81 44.37 54.27 57.77 86.7a267.919 267.919 0 0 1 20.29 102.27c0 108.09-64.93 205.53-164.51 246.89s-214.2 18.5-290.41-57.93C2.18 380.3-20.62 265.36 20.62 165.5 61.87 65.64 159.04.53 266.82.53zm0 347.4c10.5.01 20.9-2.05 30.61-6.07s18.52-9.93 25.95-17.38 13.31-16.29 17.33-26.02a80.365 80.365 0 0 0 6.06-30.7c0-32.43-19.48-61.66-49.35-74.07s-64.26-5.55-87.12 17.38-29.7 57.41-17.33 87.37 41.53 49.49 73.86 49.49z" fill="#00aeef" /><path d="M566.35 200.96c67.71 19.54 147.63 0 147.63 0-23.19 101.55-96.75 165.15-202.81 172.89a266.766 266.766 0 0 1-40.48 65.86 266.208 266.208 0 0 1-57.62 51.43c-21.6 14.24-45.15 25.25-69.92 32.68s-50.48 11.19-76.33 11.18l79.95-254.81C428.95 18.28 471.08.54 665.98.54H799.8c-22.38 98.88-99.54 174.41-233.44 200.42z" fill="#008ccf" /></svg>
);

const BlueskyIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#0085FF"}>
        <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 01-.415-.056c.14.017.279.036.415.056 2.67.296 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" />
    </svg>
);

const ThreadsIcon: React.FC<IconProps> = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" x="0px" y="0px" viewBox="0 0 50 50">
        <path d="M46,9v32c0,2.757-2.243,5-5,5H9c-2.757,0-5-2.243-5-5V9c0-2.757,2.243-5,5-5h32C43.757,4,46,6.243,46,9z M33.544,35.913	c2.711-2.708,2.635-6.093,1.746-8.17c-0.54-1.255-1.508-2.33-2.798-3.108l-0.223-0.138c-0.33-0.208-0.609-0.375-1.046-0.542	c-0.008-0.278-0.025-0.556-0.058-0.807c-0.59-4.561-3.551-5.535-5.938-5.55c-2.154,0-3.946,0.92-5.044,2.592l1.672,1.098	c0.736-1.121,1.871-1.689,3.366-1.689c2.367,0.015,3.625,1.223,3.96,3.801c-1.141-0.231-2.426-0.314-3.807-0.233	c-3.924,0.226-5.561,2.591-5.442,4.836c0.134,2.486,2.278,4.222,5.216,4.222c0.13,0,0.259-0.003,0.384-0.011	c2.297-0.126,5.105-1.29,5.61-6.063c0.021,0.013,0.041,0.026,0.062,0.039l0.253,0.157c0.932,0.562,1.621,1.317,1.994,2.185	c0.643,1.501,0.682,3.964-1.322,5.966c-1.732,1.73-3.812,2.479-6.936,2.502c-3.47-0.026-6.099-1.145-7.812-3.325	c-1.596-2.028-2.42-4.953-2.451-8.677c0.031-3.728,0.855-6.646,2.451-8.673c1.714-2.181,4.349-3.299,7.814-3.325	c3.492,0.026,6.165,1.149,7.944,3.338c0.864,1.063,1.525,2.409,1.965,3.998l1.928-0.532c-0.514-1.858-1.301-3.449-2.341-4.728	c-2.174-2.674-5.363-4.045-9.496-4.076c-4.12,0.031-7.278,1.406-9.387,4.089c-1.875,2.383-2.844,5.712-2.879,9.91	c0.035,4.193,1.004,7.529,2.879,9.913c2.109,2.682,5.262,4.058,9.385,4.088C28.857,38.973,31.433,38.021,33.544,35.913z M28.993,25.405c0.07,0.016,0.138,0.031,0.202,0.046c-0.005,0.078-0.01,0.146-0.015,0.198c-0.314,3.928-2.295,4.489-3.761,4.569	c-0.091,0.005-0.181,0.008-0.271,0.008c-1.851,0-3.144-0.936-3.218-2.329c-0.065-1.218,0.836-2.576,3.561-2.732	c0.297-0.018,0.589-0.027,0.875-0.027C27.325,25.137,28.209,25.227,28.993,25.405z"></path>
    </svg>
);

const RobloxIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#000000"}>
        <path d="M5.164 0L0 18.627 18.836 24 24 5.373 5.164 0zM14.6 15.549l-5.61-1.377 1.377-5.61 5.61 1.377-1.377 5.61z" />
    </svg>
);

const PatreonIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#FF424D"}>
        <path d="M0 .48v23.04h4.22V.48zm15.385 0c-4.764 0-8.641 3.88-8.641 8.65 0 4.755 3.877 8.623 8.641 8.623 4.75 0 8.615-3.868 8.615-8.623C24 4.36 20.136.48 15.385.48z" />
    </svg>
);

const PrivacyIcon: React.FC<IconProps> = ({ color }) => (
    <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill={color || "#00FF00"} viewBox="0 0 600.000000 450.000000" preserveAspectRatio="xMidYMid meet"> <g transform="translate(0.000000,450.000000) scale(0.100000,-0.100000)" fill="#f58b3d" stroke="none"> <path d="M2835 3620 c-398 -65 -742 -317 -922 -674 -49 -98 -93 -225 -114 -331 -11 -56 -14 -219 -14 -810 l0 -740 31 -55 c71 -125 222 -181 354 -131 86 33 114 62 206 219 48 81 92 153 99 160 10 11 22 9 66 -12 73 -33 158 -60 254 -82 110 -25 349 -25 462 -1 334 72 600 243 787 507 153 214 226 448 226 721 0 218 -36 370 -134 562 -165 324 -453 552 -821 648 -62 16 -119 21 -255 24 -96 2 -197 0 -225 -5z m460 -264 c368 -108 620 -371 716 -746 31 -121 31 -320 1 -443 -39 -156 -96 -278 -189 -399 -50 -66 -153 -168 -169 -168 -8 0 -118 172 -182 286 -11 20 -9 26 14 51 89 95 150 207 174 318 32 147 3 326 -73 453 -126 208 -320 322 -552 323 -190 2 -339 -61 -472 -198 -151 -156 -213 -366 -168 -578 19 -93 84 -221 145 -288 28 -30 50 -58 50 -63 0 -4 -29 -53 -64 -108 -35 -56 -83 -132 -106 -171 -24 -38 -92 -151 -153 -250 -60 -99 -121 -199 -134 -223 -29 -50 -64 -63 -93 -37 -19 18 -20 35 -20 655 0 679 6 784 50 918 110 332 380 589 705 671 116 29 126 30 285 26 121 -2 160 -7 235 -29z m-92 -603 c160 -76 258 -257 228 -424 -20 -118 -61 -179 -199 -299 -28 -24 -42 -46 -47 -72 -7 -37 5 -66 80 -187 11 -17 11 -17 109 -168 68 -105 75 -123 54 -141 -19 -15 -164 -56 -238 -66 -131 -19 -441 4 -474 35 -6 5 -19 9 -29 9 -22 0 -77 30 -77 43 0 4 8 20 19 35 26 37 96 147 175 274 57 92 66 113 66 154 0 42 -4 50 -37 78 -86 74 -153 147 -172 189 -102 224 12 489 242 563 26 8 78 13 137 11 84 -2 103 -6 163 -34z"></path> </g> </svg>
);

const FivemIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#F40552"}>
        <path d="M4.717 0h8.565A4.716 4.716 0 0118 4.717v8.565A4.717 4.717 0 0113.283 18H4.717A4.717 4.717 0 010 13.282V4.717A4.717 4.717 0 014.717 0z" />
    </svg>
);

const IFoodIcon: React.FC<IconProps> = ({ color }) => (
    <svg width="30" height="30" fill={color || "#F40552"} viewBox="0 0 24 24" role="img"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M8.428 1.67c-4.65 0-7.184 4.149-7.184 6.998 0 2.294 2.2 3.299 4.25 3.299l-.006-.006c4.244 0 7.184-3.854 7.184-6.998 0-2.29-2.175-3.293-4.244-3.293zm11.328 0c-4.65 0-7.184 4.149-7.184 6.998 0 2.294 2.2 3.299 4.25 3.299l-.006-.006C21.061 11.96 24 8.107 24 4.963c0-2.29-2.18-3.293-4.244-3.293zm-5.584 12.85 2.435 1.834c-2.17 2.07-6.124 3.525-9.353 3.17A8.913 8.913 0 0 1 .23 14.541H0a9.598 9.598 0 0 0 8.828 7.758c3.814.24 7.323-.905 9.947-3.13l-.004.007 1.08 2.988 1.555-7.623-7.234-.02z"></path></g></svg>
);

const GmailIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30">
        <path fill={color || "#EA4335"} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    </svg>
);

const NameMCIcon: React.FC<IconProps> = ({ color }) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill={color || "#3C8527"}>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.8c1.327 0 2.4 1.073 2.4 2.4v2.4H9.6V7.2c0-1.327 1.073-2.4 2.4-2.4zm4.8 7.2v7.2H7.2V12h9.6z" />
    </svg>
);

const ICON_MAP: Record<number, React.FC<IconProps>> = {
    1: InstagramIcon,
    2: SnapchatIcon,
    3: YouTubeIcon,
    4: DiscordIcon,
    5: FacebookIcon,
    6: TwitterIcon,
    7: TikTokIcon,
    8: LastFmIcon,
    9: SteamIcon,
    10: GitHubIcon,
    11: SpotifyIcon,
    12: TwitchIcon,
    13: SoundcloudIcon,
    14: WhatsappIcon,
    15: TelegramIcon,
    16: BattleNetIcon,
    17: LinkedinIcon,
    18: PayPalIcon,
    19: XboxIcon,
    20: PinterestIcon,
    21: LetterboxdIcon,
    22: TumblrIcon,
    23: VSCOIcon,
    24: OnlyfansIcon,
    25: BlueskyIcon,
    26: ThreadsIcon,
    27: RobloxIcon,
    28: PatreonIcon,
    29: PrivacyIcon,
    30: FivemIcon,
    31: IFoodIcon,
    32: GmailIcon,
    33: NameMCIcon,
};


/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════════════════════ */

const globalStylesCSS = `
@keyframes float-up {
    0% { opacity: 1; transform: translateY(0) scale(1); }
    50% { opacity: 1; transform: translateY(-20px) scale(1.3); }
    100% { opacity: 0; transform: translateY(-40px) scale(0.8); }
}
.animate-float-up {
    animation: float-up 2s ease-out forwards;
}
@keyframes neon-flicker {
    0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
        text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ff00de, 0 0 30px #ff00de, 0 0 40px #ff00de, 0 0 55px #ff00de, 0 0 75px #ff00de;
    }
    20%, 24%, 55% { text-shadow: none; }
}
.name-neon {
    color: #fff;
    text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ff00de, 0 0 30px #ff00de, 0 0 40px #ff00de;
    animation: neon-flicker 1.5s infinite alternate;
}
@keyframes shiny-move { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
.name-shiny-container { position: relative; display: inline-block; padding: 1px; }
.name-shiny-container::before {
    content: ''; position: absolute; inset: 0;
    background: url('https://vxo.lat/effects/shiny.gif') repeat center/auto;
    opacity: 1; border-radius: 12px; z-index: 0; pointer-events: none;
}
.name-shiny-container::after {
    content: ''; position: absolute; inset: 0;
    background: url('https://vxo.lat/effects/shiny.gif') repeat center/auto;
    opacity: 0.7; border-radius: 12px; z-index: 2; pointer-events: none; mix-blend-mode: screen;
}
.name-shiny {
    position: relative; z-index: 1; color: #ffffff; font-weight: bold;
    -webkit-text-fill-color: #ffffff;
    text-shadow: 0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.5);
    background: none; background-image: none; animation: none;
}
@keyframes rgb-cycle {
    0% { color: #ff0000; } 16.67% { color: #ff8000; } 33.33% { color: #ffff00; }
    50% { color: #00ff00; } 66.67% { color: #0080ff; } 83.33% { color: #8000ff; } 100% { color: #ff0000; }
}
.name-rgb { animation: rgb-cycle 3s linear infinite; }
@keyframes text-glow-pulse {
    0%, 100% { text-shadow: 0 0 4px rgba(255,255,255,0.3), 0 0 12px rgba(255,255,255,0.15); }
    50% { text-shadow: 0 0 8px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.25), 0 0 40px rgba(255,255,255,0.1); }
}
.name-glow {
    text-shadow: 0 0 6px rgba(255,255,255,0.35), 0 0 16px rgba(255,255,255,0.15);
    animation: text-glow-pulse 3s ease-in-out infinite;
}
@keyframes rgb-border-animation { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
.rgb-border-wrapper {
    position: relative; padding: 3px; border-radius: 36px;
    background: linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #00ff00, #0080ff, #8000ff, #ff0080, #ff0000);
    background-size: 400% 400%; animation: rgb-border-animation 3s linear infinite;
}
@keyframes money-fall { 0% { transform: translateY(-100px) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
@keyframes thunder-flash { 0%, 100% { opacity: 0; } 10%, 30% { opacity: 0.3; } 20% { opacity: 0.8; } }
.thunder-overlay { animation: thunder-flash 4s infinite; }
@keyframes smoke-rise { 0% { transform: translateY(100%) scale(1); opacity: 0.6; } 100% { transform: translateY(-100vh) scale(2); opacity: 0; } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   EFFECTS COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

const CANVAS_STYLE: React.CSSProperties = {
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999,
};

const useCanvasEffect = (
    drawFn: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => (() => void) | void
) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const updateSize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        updateSize();
        const cleanup = drawFn(ctx, canvas);
        window.addEventListener('resize', updateSize);
        return () => { window.removeEventListener('resize', updateSize); cleanup?.(); };
    }, []);
    return canvasRef;
};

const SnowEffect: React.FC = React.memo(() => {
    const canvasRef = useCanvasEffect((ctx, canvas) => {
        const flakes = Array.from({ length: 150 }, () => ({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            r: Math.random() * 3 + 1, speed: Math.random() * 2 + 0.5,
            wind: Math.random() * 0.5 - 0.25, opacity: Math.random() * 0.5 + 0.5,
        }));
        let animId: number;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const f of flakes) {
                ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${f.opacity})`; ctx.fill();
                f.y += f.speed; f.x += f.wind;
                if (f.y > canvas.height) { f.y = -5; f.x = Math.random() * canvas.width; }
                if (f.x > canvas.width) f.x = 0; if (f.x < 0) f.x = canvas.width;
            }
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animId);
    });
    return <canvas ref={canvasRef} style={CANVAS_STYLE} />;
});
SnowEffect.displayName = 'SnowEffect';

const RainEffect: React.FC = React.memo(() => {
    const canvasRef = useCanvasEffect((ctx, canvas) => {
        const drops = Array.from({ length: 200 }, () => ({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            len: Math.random() * 20 + 10, speed: Math.random() * 15 + 10,
            opacity: Math.random() * 0.3 + 0.2,
        }));
        let animId: number;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.lineWidth = 1;
            for (const d of drops) {
                ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + 1, d.y + d.len);
                ctx.strokeStyle = `rgba(174,194,224,${d.opacity})`; ctx.stroke();
                d.y += d.speed;
                if (d.y > canvas.height) { d.y = -d.len; d.x = Math.random() * canvas.width; }
            }
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animId);
    });
    return <canvas ref={canvasRef} style={CANVAS_STYLE} />;
});
RainEffect.displayName = 'RainEffect';

const MoneyRainEffect: React.FC = React.memo(() => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const container = ref.current; if (!container) return;
        const emojis = ['💵', '💰', '💸', '🤑', '💲', '💎'];
        const els: HTMLSpanElement[] = [];
        const create = () => {
            const el = document.createElement('span');
            el.innerText = emojis[Math.floor(Math.random() * emojis.length)];
            el.style.cssText = `position:fixed;left:${Math.random() * 100}vw;top:-50px;font-size:${Math.random() * 20 + 20}px;pointer-events:none;z-index:9999;animation:money-fall ${Math.random() * 3 + 3}s linear forwards;transform:rotate(${Math.random() * 360}deg)`;
            container.appendChild(el); els.push(el);
            setTimeout(() => { el.remove(); const i = els.indexOf(el); if (i > -1) els.splice(i, 1); }, 6000);
        };
        const interval = setInterval(create, 150);
        return () => { clearInterval(interval); els.forEach(e => e.remove()); };
    }, []);
    return <div ref={ref} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 9999 }} />;
});
MoneyRainEffect.displayName = 'MoneyRainEffect';

const ThunderEffect: React.FC = React.memo(() => {
    const [flash, setFlash] = useState(false);
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) { setFlash(true); setTimeout(() => setFlash(false), 200); }
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    return (
        <>
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'white', opacity: flash ? 0.8 : 0, pointerEvents: 'none', zIndex: 9999, transition: 'opacity 0.1s' }} />
            <div className="thunder-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(100,100,150,0.3)', pointerEvents: 'none', zIndex: 9998 }} />
        </>
    );
});
ThunderEffect.displayName = 'ThunderEffect';

const SmokeEffect: React.FC = React.memo(() => {
    const canvasRef = useCanvasEffect((ctx, canvas) => {
        interface SmokeParticle {
            x: number; y: number; vx: number; vy: number; size: number; maxSize: number;
            growRate: number; opacity: number; fadeRate: number; turbulenceX: number;
            turbulenceY: number; turbulenceSpeed: number; turbulenceOffset: number;
            rotation: number; rotationSpeed: number; life: number; maxLife: number;
            color: { r: number; g: number; b: number };
        }
        const particles: SmokeParticle[] = [];
        let time = 0;
        const emitters = [
            { x: 0.15, spread: 60 }, { x: 0.35, spread: 80 },
            { x: 0.5, spread: 100 }, { x: 0.65, spread: 80 }, { x: 0.85, spread: 60 },
        ];
        const createParticle = (): SmokeParticle => {
            const emitter = emitters[Math.floor(Math.random() * emitters.length)];
            const baseX = canvas.width * emitter.x;
            const brightness = Math.random() * 40 + 180;
            const blueTint = Math.random() * 15;
            return {
                x: baseX + (Math.random() - 0.5) * emitter.spread,
                y: canvas.height + 20 + Math.random() * 40,
                vx: (Math.random() - 0.5) * 0.3, vy: -(Math.random() * 0.6 + 0.3),
                size: Math.random() * 8 + 4, maxSize: Math.random() * 120 + 80,
                growRate: Math.random() * 0.4 + 0.2, opacity: 0,
                fadeRate: Math.random() * 0.001 + 0.0008,
                turbulenceX: Math.random() * 2 + 1, turbulenceY: Math.random() * 0.5 + 0.3,
                turbulenceSpeed: Math.random() * 0.008 + 0.004,
                turbulenceOffset: Math.random() * Math.PI * 2,
                rotation: Math.random() * Math.PI * 2, rotationSpeed: (Math.random() - 0.5) * 0.005,
                life: 0, maxLife: Math.random() * 600 + 400,
                color: { r: brightness, g: brightness, b: brightness + blueTint },
            };
        };
        for (let i = 0; i < 15; i++) {
            const p = createParticle();
            p.life = Math.random() * p.maxLife * 0.5; p.size = p.maxSize * 0.5;
            p.y = canvas.height - Math.random() * canvas.height * 0.7; p.opacity = 0.08;
            particles.push(p);
        }
        let spawnTimer = 0; let animId: number;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); time++; spawnTimer++;
            if (spawnTimer % 8 === 0 && particles.length < 60) particles.push(createParticle());
            const globalWindX = Math.sin(time * 0.002) * 0.15;
            const globalWindY = Math.cos(time * 0.0015) * 0.05;
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i]; p.life++;
                const lifeProgress = p.life / p.maxLife;
                if (lifeProgress < 0.15) p.opacity = (lifeProgress / 0.15) * 0.12;
                else if (lifeProgress < 0.5) p.opacity = 0.12;
                else { const fadeProgress = (lifeProgress - 0.5) / 0.5; p.opacity = 0.12 * (1 - fadeProgress * fadeProgress); }
                if (p.size < p.maxSize) p.size += p.growRate * (1 - (p.size / p.maxSize));
                const turb1 = Math.sin(time * p.turbulenceSpeed + p.turbulenceOffset) * p.turbulenceX;
                const turb2 = Math.sin(time * p.turbulenceSpeed * 0.7 + p.turbulenceOffset * 1.3) * p.turbulenceX * 0.5;
                const turb3 = Math.cos(time * p.turbulenceSpeed * 1.3 + p.turbulenceOffset * 0.7) * p.turbulenceY;
                p.x += p.vx + turb1 + turb2 + globalWindX;
                p.y += p.vy + turb3 + globalWindY;
                p.vy *= 0.999; p.rotation += p.rotationSpeed;
                ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 0.5);
                const { r, g, b } = p.color;
                gradient.addColorStop(0, `rgba(${r},${g},${b},${p.opacity * 0.8})`);
                gradient.addColorStop(0.2, `rgba(${r},${g},${b},${p.opacity * 0.6})`);
                gradient.addColorStop(0.4, `rgba(${r},${g},${b},${p.opacity * 0.35})`);
                gradient.addColorStop(0.6, `rgba(${r},${g},${b},${p.opacity * 0.15})`);
                gradient.addColorStop(0.8, `rgba(${r},${g},${b},${p.opacity * 0.05})`);
                gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
                ctx.fillStyle = gradient;
                ctx.scale(1, 0.85 + Math.sin(p.rotation) * 0.15);
                ctx.beginPath(); ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
                if (p.life >= p.maxLife || p.opacity <= 0.001 || p.y < -p.size) particles.splice(i, 1);
            }
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animId);
    });
    return <canvas ref={canvasRef} style={{ ...CANVAS_STYLE, mixBlendMode: 'screen' }} />;
});
SmokeEffect.displayName = 'SmokeEffect';

const StarsEffect: React.FC = React.memo(() => {
    const canvasRef = useCanvasEffect((ctx, canvas) => {
        const stars = Array.from({ length: 100 }, () => ({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            r: Math.random() * 2 + 0.5, opacity: Math.random(),
            speed: Math.random() * 0.02 + 0.005, inc: Math.random() > 0.5,
        }));
        let animId: number;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const s of stars) {
                if (s.inc) { s.opacity += s.speed; if (s.opacity >= 1) s.inc = false; }
                else { s.opacity -= s.speed; if (s.opacity <= 0.2) s.inc = true; }
                ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${s.opacity})`; ctx.fill();
                ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${s.opacity * 0.3})`; ctx.fill();
            }
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animId);
    });
    return <canvas ref={canvasRef} style={CANVAS_STYLE} />;
});
StarsEffect.displayName = 'StarsEffect';

const PageEffectsManager: React.FC<{ effects: PageEffects }> = React.memo(({ effects }) => (
    <>
        {effects.snow && <SnowEffect />}
        {effects.rain && <RainEffect />}
        {effects.cash && <MoneyRainEffect />}
        {effects.thunder && <ThunderEffect />}
        {effects.smoke && <SmokeEffect />}
        {effects.stars && <StarsEffect />}
    </>
));
PageEffectsManager.displayName = 'PageEffectsManager';

/* ═══════════════════════════════════════════════════════════════════════════
   BACKGROUND COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

const backgroundOverlayStyle: React.CSSProperties = { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)' };
const bgMediaStyle: React.CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' };

const BackgroundMedia: React.FC<{ url: string }> = React.memo(({ url }) => {
    const isVideo = useMemo(() => isVideoUrl(url), [url]);
    return (
        <>
            {isVideo ? (
                <video src={url} autoPlay loop muted playsInline style={bgMediaStyle} />
            ) : (
                <img
                    src={url}
                    alt="Background"
                    style={bgMediaStyle}
                    // @ts-ignore
                    fetchpriority="high"
                    decoding="async"
                />
            )}
            <div style={backgroundOverlayStyle} />
        </>
    );
});
BackgroundMedia.displayName = 'BackgroundMedia';

/* ═══════════════════════════════════════════════════════════════════════════
   CARD EFFECT OVERLAY
═══════════════════════════════════════════════════════════════════════════ */

const cardEffectContainerStyle: React.CSSProperties = {
    position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 28, zIndex: 100, overflow: 'hidden',
};
const cardEffectImgStyle: React.CSSProperties = {
    width: '100%', transform: 'translateY(0%)', height: '100%',
    objectFit: 'cover', objectPosition: 'top', pointerEvents: 'none', userSelect: 'none',
};

const CardEffectOverlay: React.FC<{ url: string }> = React.memo(({ url }) => (
    <div style={cardEffectContainerStyle}>
        <img src={url} alt="Card Effect" style={cardEffectImgStyle} loading="lazy" />
    </div>
));
CardEffectOverlay.displayName = 'CardEffectOverlay';

/* ═══════════════════════════════════════════════════════════════════════════
   CARD CONTENT — now uses UserPageState (with views)
═══════════════════════════════════════════════════════════════════════════ */

interface CardContentProps {
    data: UserPageState;
    frame: string | null;
    badges: InventoryItem[];
    showPlusOne: boolean;
    getNameClass: () => string;
    hasVerifiedBadge: boolean;
}

const CardContent: React.FC<CardContentProps> = React.memo(({
    data, frame, badges, showPlusOne, hasVerifiedBadge,
}) => {
    const profileSize = 90;
    const frameSize = profileSize + 20;
    const centered = data.contentSettings.centerAlign;
    const badgeColor = data.contentSettings.badgeColor || data.contentSettings.biographyColor;

    const sortedLinks = useMemo(() => {
        return data.userLinksResponse.links
            .sort((a, b) => a.order - b.order)
            .reduce(
                (acc, link) => {
                    if (link.hasLinkTyped && link.linkTypeId && ICON_MAP[link.linkTypeId]) {
                        acc.typed.push(link);
                    } else {
                        acc.generic.push(link);
                    }
                    return acc;
                },
                { typed: [] as UserLink[], generic: [] as UserLink[] }
            );
    }, [data.userLinksResponse.links]);

    const displayBadges = useMemo(() => badges.filter(badge => !isVerifiedBadge(badge)), [badges]);

    const containerStyle = useMemo((): React.CSSProperties => ({
        display: 'flex', flexDirection: 'column', padding: 14, gap: 6,
        alignItems: centered ? 'center' : 'flex-start',
        textAlign: centered ? 'center' : 'left',
    }), [centered]);

    const profileContainerStyle = useMemo((): React.CSSProperties => ({
        position: 'relative', width: frameSize, height: frameSize,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    }), [frameSize]);

    const profileImageContainerStyle = useMemo((): React.CSSProperties => ({
        position: 'absolute', width: profileSize, height: profileSize,
        borderRadius: '50%', overflow: 'hidden', backgroundColor: '#374151',
        zIndex: 1, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    }), [profileSize]);

    const embedStyle = useMemo((): React.CSSProperties | null => {
        if (!data.embedUrl) return null;
        const base: React.CSSProperties = {
            width: '100%', borderRadius: 16, overflow: 'hidden',
            marginTop: 4, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        };
        if (data.embedUrl.includes('spotify.com')) {
            const isCompact = data.embedUrl.includes('/track/') || data.embedUrl.includes('/episode/');
            return { ...base, height: isCompact ? 152 : 352, minHeight: isCompact ? 152 : 352 };
        }
        return { ...base, aspectRatio: '16/9' };
    }, [data.embedUrl]);


    const viewsFormatted = useMemo(() => {
        if (!data) return null;
        return formatViews(data.views);
    }, [data?.views]);

    function formatViews(views: number): string {
        if (views >= 1_000_000) {
            return (views / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (views >= 1_000) {
            return (views / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return views.toString();
    }

    const genericLinkBaseStyle = useMemo((): React.CSSProperties => ({
        width: '100%', padding: '12px 16px', borderRadius: 16,
        backgroundColor: data.contentSettings.biographyColor + "1A",
        border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff',
        fontWeight: 500, textDecoration: 'none', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', gap: 14,
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        boxSizing: 'border-box', cursor: 'pointer', outline: 'none',
    }), [data.contentSettings.biographyColor]);

    return (
        <div style={containerStyle}>
            {/* PROFILE IMAGE + FRAME */}
            <div style={profileContainerStyle}>
                <div style={profileImageContainerStyle}>
                    {data.mediaUrls.profileImageUrl ? (
                        <img
                            src={data.mediaUrls.profileImageUrl}
                            alt="Profile"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            // @ts-ignore
                            fetchpriority="high"
                            decoding="async"
                        />
                    ) : (
                        <div style={{
                            width: '100%', height: '100%',
                            background: 'linear-gradient(135deg,#8b5cf6 0%,#ec4899 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 48, color: '#fff',
                        }}>?</div>
                    )}
                </div>
                {data.isPremium && frame && (
                    <img
                        src={frame} alt="Frame"
                        style={{
                            position: 'absolute', width: frameSize, height: frameSize,
                            objectFit: 'contain', zIndex: 2, pointerEvents: 'none',
                        }}
                        loading="lazy"
                    />
                )}
            </div>

            {/* NAME + VERIFIED */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: centered ? 'center' : 'flex-start', gap: 8 }}>
                {data.nameEffects.shiny ? (
                    <div className="name-shiny-container">
                        <h1 className="name-shiny" style={{ fontSize: 24, fontWeight: 'bold', margin: 0, letterSpacing: '-0.02em' }}>
                            {data.nameEffects.name || data.slug}
                        </h1>
                    </div>
                ) : (
                    <h1
                        className={data.nameEffects.neon ? 'name-neon' : data.nameEffects.rgb ? 'name-rgb' : ''}
                        style={{
                            fontSize: 28, fontWeight: 'bold', margin: 0, letterSpacing: '-0.02em',
                            color: !data.nameEffects.neon && !data.nameEffects.rgb
                                ? data.nameEffects.nameColor || '#fff' : undefined,
                        }}
                    >
                        {data.nameEffects.name || data.slug}
                    </h1>
                )}
                {hasVerifiedBadge && (
                    <div style={{ display: 'flex', alignItems: 'center', animation: 'fadeIn 0.5s ease-out' }} title="Conta Verificada">
                        <VerifiedIcon size={24} />
                    </div>
                )}
            </div>

            {/* BADGES */}
            {displayBadges.length > 0 && (
                <div style={{
                    width: 'max-content', padding: '0px', borderRadius: 20,
                    backgroundColor: 'transparent', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', gap: 3,
                }}>
                    {badges.map((badge) => (
                        <BadgeWithTooltip key={badge.id} badge={badge} biographyColor={badgeColor} />
                    ))}
                </div>
            )}

            {/* BIOGRAPHY */}
            {data.contentSettings.biography && (
                <p style={{
                    fontSize: 16, paddingTop: '15px',
                    color: data.contentSettings.biographyColor || '#fff',
                    margin: 0, maxWidth: 380, lineHeight: 1.3, opacity: 0.85,
                }}>
                    {data.contentSettings.biography}
                </p>
            )}

            {/* TAGS */}
            {data.userTagsResponse.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: centered ? 'center' : 'flex-start' }}>
                    {data.userTagsResponse.tags.map((tag) => (
                        <span key={tag.tagId} style={{
                            padding: '3px 5px', borderRadius: 14, border: '1px solid',
                            borderColor: `${data.contentSettings.tagColor}80`,
                            backgroundColor: 'transparent', color: data.contentSettings.tagColor,
                            fontSize: 13, fontWeight: 600,
                        }}>
                            {tag.tagName}
                        </span>
                    ))}
                </div>
            )}

            {/* EMBED */}
            {data.embedUrl && embedStyle && (
                <div style={embedStyle}>
                    <iframe
                        src={data.embedUrl}
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen title="Embed" loading="lazy"
                    />
                </div>
            )}

            {/* TYPED LINKS */}
            {sortedLinks.typed.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, justifyContent: centered ? 'center' : 'flex-start', width: '100%' }}>
                    {sortedLinks.typed.map((link) => {
                        const Icon = link.linkTypeId ? ICON_MAP[link.linkTypeId] : null;
                        return (
                            <a
                                key={link.linkId} href={link.url} target="_blank" rel="noopener noreferrer"
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: 5, borderRadius: 16, backgroundColor: 'transparent',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer',
                                }}
                                title={link.title}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15) translateY(-2px)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                {Icon && <Icon />}
                            </a>
                        );
                    })}
                </div>
            )}

            {/* GENERIC LINKS */}
            {sortedLinks.generic.length > 0 && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, marginTop: sortedLinks.typed.length > 0 ? 4 : 0 }}>
                    {sortedLinks.generic.map((link) => {
                        const favicon = getFaviconUrl(link.url);
                        return (
                            <a
                                key={link.linkId} href={link.url} target="_blank" rel="noopener noreferrer"
                                style={genericLinkBaseStyle}
                                onMouseEnter={(e) => {
                                    const t = e.currentTarget;
                                    t.style.transform = 'scale(1.02) translateY(-2px)';
                                    t.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                                    const arrow = t.querySelector('.link-arrow') as HTMLElement;
                                    if (arrow) { arrow.style.transform = 'translate(3px, -3px)'; arrow.style.opacity = '1'; }
                                }}
                                onMouseLeave={(e) => {
                                    const t = e.currentTarget;
                                    t.style.transform = 'scale(1)';
                                    t.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                                    const arrow = t.querySelector('.link-arrow') as HTMLElement;
                                    if (arrow) { arrow.style.transform = 'translate(0, 0)'; arrow.style.opacity = '0.5'; }
                                }}
                                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
                                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)'; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                                    {favicon && (
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 10,
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                        }}>
                                            <img
                                                src={favicon} alt=""
                                                style={{ width: 20, height: 20, borderRadius: 6, objectFit: 'contain' }}
                                                loading="lazy"
                                                onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
                                            />
                                        </div>
                                    )}
                                    <span style={{
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        flex: 1, fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em', color: data.contentSettings.tagColor || '#ffffff'
                                    }}>
                                        {link.linkText}
                                    </span>
                                </div>
                                <svg className="link-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                    style={{ opacity: 0.5, flexShrink: 0, transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
                                    <path d="M7 17L17 7" /><path d="M7 7h10v10" />
                                </svg>
                            </a>
                        );
                    })}
                </div>
            )}

            {/* VIEW COUNTER */}
            {viewsFormatted !== null && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '2%',
                    color: data.contentSettings.viewColor || data.contentSettings.biographyColor,
                    fontSize: 13,
                    fontWeight: 900,
                    position: 'relative',
                    opacity: 0.8,
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>

                    <span>{viewsFormatted}</span>

                    {/* +1 Animation */}
                    {showPlusOne && (
                        <span
                            className="animate-float-up"
                            style={{
                                position: 'absolute',
                                right: -30,
                                color: '#4ade80',
                                fontWeight: 'bolder',
                                fontSize: 18,
                            }}
                        >
                            +1
                        </span>
                    )}
                </div>
            )}
        </div>
    );
});
CardContent.displayName = 'CardContent';

/* ═══════════════════════════════════════════════════════════════════════════
   ERROR PAGE CSS
═══════════════════════════════════════════════════════════════════════════ */

const errorPageCSS = `
${globalStylesCSS}
@keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
@keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(143, 124, 255, 0.2); } 50% { box-shadow: 0 0 40px rgba(143, 124, 255, 0.4); } }
.error-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #121316; padding: 20px; position: relative; overflow: hidden; }
.error-page::before { content: ''; position: absolute; width: 500px; height: 500px; background: radial-gradient(circle, rgba(143, 124, 255, 0.08) 0%, transparent 70%); top: -150px; right: -150px; pointer-events: none; }
.error-page::after { content: ''; position: absolute; width: 400px; height: 400px; background: radial-gradient(circle, rgba(79, 140, 255, 0.06) 0%, transparent 70%); bottom: -100px; left: -100px; pointer-events: none; }
.error-card { background: rgba(17, 18, 19, 0.767); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 28px; padding: 60px 48px; text-align: center; max-width: 420px; width: 100%; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); animation: slideIn 0.5s ease-out; position: relative; z-index: 1; }
.error-avatar { width: 100px; height: 100px; background: linear-gradient(135deg, #1f2846 0%, rgba(143, 124, 255, 0.1) 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 32px; border: 2px dashed rgba(143, 124, 255, 0.3); animation: float 3s ease-in-out infinite, pulse-glow 3s ease-in-out infinite; }
.error-avatar svg { width: 48px; height: 48px; color: rgba(237, 237, 237, 0.4); }
.error-status { display: inline-block; padding: 6px 16px; background: rgba(143, 124, 255, 0.1); border: 1px solid rgba(143, 124, 255, 0.3); border-radius: 20px; color: #8F7CFF; font-size: 13px; font-weight: 600; margin-bottom: 20px; letter-spacing: 0.5px; }
.error-heading { font-size: 28px; font-weight: 700; color: #EDEDED; margin: 0 0 12px; }
.error-desc { color: rgba(237, 237, 237, 0.6); font-size: 15px; line-height: 1.7; margin: 0 0 32px; }
.error-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.btn-primary { padding: 14px 32px; background: linear-gradient(135deg, #8F7CFF 0%, #7A66F0 100%); color: #fff; border: none; border-radius: 14px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; text-decoration: none; box-shadow: 0 4px 20px rgba(143, 124, 255, 0.3); }
.btn-primary:hover { background: linear-gradient(135deg, #7A66F0 0%, #8F7CFF 100%); transform: translateY(-2px); box-shadow: 0 6px 30px rgba(143, 124, 255, 0.5); }
.btn-primary:active { transform: translateY(0); }
.btn-secondary { padding: 14px 32px; background: rgba(255, 255, 255, 0.021); color: rgba(237, 237, 237, 0.6); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 14px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; text-decoration: none; }
.btn-secondary:hover { background: rgba(255, 255, 255, 0.09); border-color: rgba(255, 255, 255, 0.2); color: #EDEDED; }
@media (max-width: 480px) { .error-card { padding: 40px 28px; border-radius: 20px; } .error-heading { font-size: 24px; } .error-actions { flex-direction: column; } .btn-primary, .btn-secondary { width: 100%; justify-content: center; } }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   LOADING SKELETON CSS
═══════════════════════════════════════════════════════════════════════════ */

const skeletonCSS = `
${globalStylesCSS}
@keyframes shimmer {
    0% { background-position: -600px 0; }
    100% { background-position: 600px 0; }
}
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
}
.skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.09) 200px, rgba(255,255,255,0.04) 400px);
    background-size: 600px 100%;
    animation: shimmer 1.6s ease-in-out infinite;
    border-radius: 10px;
}
`;

/* ═══════════════════════════════════════════════════════════════════════════
   LOADING SKELETON COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

const LoadingSkeleton: React.FC = React.memo(() => (
    <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 10, background: 'linear-gradient(135deg,#0d0d1a 0%,#111827 50%,#0a0a14 100%)',
    }}>
        <div style={{
            width: '100%', maxWidth: 440, borderRadius: 28,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)', padding: 20,
            display: 'flex', flexDirection: 'column', gap: 0,
            animation: 'fadeInUp 0.4s ease-out', boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '6px 6px 16px' }}>
                <div className="skeleton" style={{ width: 90, height: 90, borderRadius: '50%', flexShrink: 0 }} />
                <div className="skeleton" style={{ width: 160, height: 26 }} />
                <div style={{ display: 'flex', gap: 6 }}>
                    {[24, 24, 24].map((size, i) => (
                        <div key={i} className="skeleton" style={{ width: size, height: size, borderRadius: '50%' }} />
                    ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                    <div className="skeleton" style={{ width: '92%', height: 14 }} />
                    <div className="skeleton" style={{ width: '75%', height: 14 }} />
                    <div className="skeleton" style={{ width: '60%', height: 14 }} />
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                    {[70, 90, 60].map((w, i) => (
                        <div key={i} className="skeleton" style={{ width: w, height: 24, borderRadius: 20 }} />
                    ))}
                </div>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0 16px' }} />
            <div style={{ display: 'flex', gap: 8, padding: '0 6px 16px' }}>
                {[1, 2, 3, 4, 5].map((_, i) => (
                    <div key={i} className="skeleton" style={{ width: 36, height: 36, borderRadius: 12 }} />
                ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 6px 16px' }}>
                {[1, 2, 3].map((_, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', borderRadius: 16,
                        border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)',
                    }}>
                        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0 }} />
                        <div className="skeleton" style={{ flex: 1, height: 14, width: `${60 + i * 10}%` }} />
                        <div className="skeleton" style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0 }} />
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px' }}>
                <div className="skeleton" style={{ width: 16, height: 16, borderRadius: '50%' }} />
                <div className="skeleton" style={{ width: 40, height: 12 }} />
            </div>
        </div>
    </div>
));
LoadingSkeleton.displayName = 'LoadingSkeleton';

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

const UserPublicPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();

    /* ── estado principal ───────────────────────────────── */
    const [data, setData] = useState<UserPageState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPlusOne, setShowPlusOne] = useState(false);

    /* ── view-counting (background) ─────────────────────── */
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [fingerprint, setFingerprint] = useState<string>('');
    const [fpReady, setFpReady] = useState(false);
    const hasCountedView = useRef(false);

    /* ── áudio ───────────────────────────────────────────── */
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [showMusicPrompt, setShowMusicPrompt] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const hasTriedAutoplay = useRef(false);

    /* ── 3-D tilt ────────────────────────────────────────── */
    const [tiltX, setTiltX] = useState(0);
    const [tiltY, setTiltY] = useState(0);
    const [scale, setScale] = useState(1);
    const [hovering, setHovering] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const hasFetchedData = useRef(false);

    /* ══════════════════════════════════════════════════════
   FASE 1 — buscar dados IMEDIATAMENTE (GET, sem bloqueio)
   ═══════════════════════════════════════════════════════ */
    useEffect(() => {
        if (!slug || hasFetchedData.current) return;
        hasFetchedData.current = true;

        const fetchPage = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await publicApi.get<UserPageSimplifiedResponse>(`/public/${slug}`);
                const pageData = response.data;

                const stateData: UserPageState = {
                    ...pageData,
                    views: pageData.cachedViews,  // ✅ Mostra cachedViews IMEDIATAMENTE
                    viewCounted: false,
                };

                setData(stateData);
                preloadCriticalImages(pageData);
            } catch (err: unknown) {
                console.error('Erro ao buscar página:', err);
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, [slug]);

    /* ══════════════════════════════════════════════════════
       FASE 2 — contar view em BACKGROUND
       ═══════════════════════════════════════════════════════ */
    useEffect(() => {
        if (!slug || !data || !fpReady || !turnstileToken || hasCountedView.current) return;
        hasCountedView.current = true;

        const countView = async () => {
            try {
                const request: RegisterViewRequest = {
                    visitorId: getVisitorId(),
                    fingerprint,
                    turnstileToken: turnstileToken ?? undefined,
                    referrer: document.referrer || undefined,
                    screenWidth: window.screen.width,
                    screenHeight: window.screen.height,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    language: navigator.language,
                };

                const response = await publicApi.post<RegisterViewResponse>(
                    `/public/${slug}/view`,
                    request
                );

                if (response.data.viewCounted) {
                    // ✅ View foi contada! Mostra animação +1 PRIMEIRO
                    setShowPlusOne(true);

                    // ✅ Pequeno delay para o +1 aparecer ANTES do número mudar
                    // Isso cria o efeito visual de "somou"
                    setTimeout(() => {
                        setData(prev => {
                            if (!prev) return prev;
                            return {
                                ...prev,
                                views: response.data.views, // Atualiza para o valor real do backend
                                viewCounted: true,
                            };
                        });
                    }, 150); // 150ms de delay para o número atualizar após o +1 aparecer

                    // Remove a animação +1 depois de 2 segundos
                    setTimeout(() => setShowPlusOne(false), 2000);
                } else {
                    // ❌ View NÃO foi contada (já visitou antes)
                    // Apenas atualiza o número real sem animação
                    setData(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            views: response.data.views,
                            viewCounted: false,
                        };
                    });
                }
            } catch (err) {
                console.error('Erro ao contar view:', err);
                // Se falhar, mantém o cachedViews — já está exibido
            }
        };

        countView();
    }, [slug, data, fpReady, turnstileToken, fingerprint]);

    /* ── Fingerprint em background ──────────────────────── */
    useEffect(() => {
        getFingerprint().then((fp) => {
            setFingerprint(fp);
            setFpReady(true);
        });
    }, []);

    /* ── Turnstile callback ─────────────────────────────── */
    const handleTurnstileSuccess = useCallback((token: string) => {
        setTurnstileToken(token);
    }, []);

    /* ── Mouse handlers ─────────────────────────────────── */
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!data?.cardSettings.perspective || !cardRef.current) return;
        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        setTiltY(((e.clientX - centerX) / (rect.width / 2)) * 15);
        setTiltX(-((e.clientY - centerY) / (rect.height / 2)) * 15);
    }, [data?.cardSettings.perspective]);

    const handleMouseLeave = useCallback(() => {
        setTiltX(0); setTiltY(0); setScale(1); setHovering(false);
    }, []);

    const handleMouseEnter = useCallback(() => {
        if (data?.cardSettings.hoverGrow) { setScale(1.03); setHovering(true); }
    }, [data?.cardSettings.hoverGrow]);

    /* ── Favicon ─────────────────────────────────────────── */
    useEffect(() => {
        if (data?.mediaUrls?.faviconUrl && data?.isPremium) {
            let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
            if (!link) { link = document.createElement('link'); document.head.appendChild(link); }
            link.type = 'image/x-icon'; link.rel = 'shortcut icon'; link.href = data.mediaUrls.faviconUrl;
        }
    }, [data?.mediaUrls?.faviconUrl, data?.isPremium]);

    /* ── Title ───────────────────────────────────────────── */
    useEffect(() => {
        if (data?.nameEffects?.name) document.title = `${data.nameEffects.name} | VXO`;
    }, [data?.nameEffects?.name]);

    /* ── Autoplay music ──────────────────────────────────── */
    useEffect(() => {
        if (!data?.mediaUrls?.musicUrl || hasTriedAutoplay.current) return;
        const tryAutoplay = async () => {
            hasTriedAutoplay.current = true;
            if (!audioRef.current) return;
            try {
                audioRef.current.volume = volume;
                await audioRef.current.play();
                setIsPlaying(true);
            } catch {
                setShowMusicPrompt(true);
            }
        };
        const timer = setTimeout(tryAutoplay, 100);
        return () => clearTimeout(timer);
    }, [data?.mediaUrls?.musicUrl, volume]);

    /* ── Music control ───────────────────────────────────── */
    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.volume = volume;
        if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
        else audioRef.current.pause();
    }, [isPlaying, volume]);

    /* ── Equipped items ──────────────────────────────────── */
    const { badges, frame, cardEffect, hasVerifiedBadge } = useMemo(() => {
        if (!data?.inventoryResponse?.equipped) return { badges: [], frame: null, cardEffect: null, hasVerifiedBadge: false };
        const eq = data.inventoryResponse.equipped;
        const isPremium = data.isPremium;
        const validItems = eq.filter(item => !item.isPremium || isPremium);
        const allBadges = validItems.filter(i => i.type === 'BADGE');
        return {
            badges: allBadges,
            frame: validItems.find(i => i.type === 'FRAME')?.url || null,
            cardEffect: validItems.find(i => i.type === 'CARD_EFFECT')?.url || null,
            hasVerifiedBadge: allBadges.some(isVerifiedBadge),
        };
    }, [data]);

    /* ── Callbacks ───────────────────────────────────────── */
    const handleStartMusic = useCallback(async () => {
        setShowMusicPrompt(false);
        if (audioRef.current) {
            try { audioRef.current.volume = volume; await audioRef.current.play(); setIsPlaying(true); }
            catch (err) { console.error('Erro ao iniciar música:', err); }
        }
    }, [volume]);

    const handleVolumeChange = useCallback((v: number) => setVolume(v), []);
    const handleTogglePlay = useCallback(() => setIsPlaying(prev => !prev), []);
    const handleToggleMute = useCallback(() => setVolume(prev => prev === 0 ? 0.5 : 0), []);
    const handleGoBack = useCallback(() => window.history.back(), []);

    const getNameClass = useCallback(() => {
        if (!data) return '';
        if (data.nameEffects.neon) return 'name-neon';
        if (data.nameEffects.shiny) return 'name-shiny';
        if (data.nameEffects.rgb) return 'name-rgb';
        return '';
    }, [data]);

    /* ── Card style ──────────────────────────────────────── */
    const cardStyle = useMemo((): React.CSSProperties | null => {
        if (!data) return null;
        return {
            backgroundColor: data.cardSettings.opacity === 0
                ? 'transparent'
                : hexToRgba(data.cardSettings.color, data.cardSettings.opacity),
            backdropFilter: data.cardSettings.blur ? `blur(${data.cardSettings.blur}px) saturate(180%)` : 'none',
            WebkitBackdropFilter: data.cardSettings.blur ? `blur(${data.cardSettings.blur}px) saturate(180%)` : 'none',
            transform: data.cardSettings.perspective
                ? `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`
                : data.cardSettings.hoverGrow && hovering ? `scale(${scale})` : 'none',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.15s ease-out, box-shadow 0.3s ease',
            borderRadius: 28, padding: 6, width: '100%', maxWidth: 480,
            boxSizing: 'border-box', willChange: 'transform',
            position: 'relative', overflow: 'visible',
        };
    }, [data, tiltX, tiltY, scale, hovering]);

    /* ═══════════════════════════════════════════════════════════════
       RENDER — LOADING
       ═══════════════════════════════════════════════════════════════ */
    if (loading) {
        return (
            <>
                <style dangerouslySetInnerHTML={{ __html: skeletonCSS }} />
                <Turnstile
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                    onSuccess={handleTurnstileSuccess}
                    options={{ size: 'invisible' }}
                />
                <LoadingSkeleton />
            </>
        );
    }

    /* ═══════════════════════════════════════════════════════════════
       RENDER — ERROR
       ═══════════════════════════════════════════════════════════════ */
    if (error || !data) {
        return (
            <>
                {!turnstileToken && (
                    <Turnstile
                        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                        onSuccess={handleTurnstileSuccess}
                        options={{ size: 'invisible' }}
                    />
                )}
                <style dangerouslySetInnerHTML={{ __html: errorPageCSS }} />
                <div className="error-page">
                    <div className="error-card">
                        <div className="error-avatar">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <span className="error-status">Erro 404</span>
                        <h1 className="error-heading">Perfil não encontrado</h1>
                        <p className="error-desc">
                            Não conseguimos encontrar o usuário que você está procurando.
                            Verifique o link ou tente buscar novamente.
                        </p>
                        <div className="error-actions">
                            <a href="/" className="btn-primary">Ir para home</a>
                            <button onClick={handleGoBack} className="btn-secondary">Voltar</button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    /* ═══════════════════════════════════════════════════════════════
       RENDER — CONTEÚDO PRINCIPAL
       ═══════════════════════════════════════════════════════════════ */
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: globalStylesCSS + BADGE_TOOLTIP_STYLES }} />

            {!turnstileToken && (
                <Turnstile
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                    onSuccess={handleTurnstileSuccess}
                    options={{ size: 'invisible' }}
                />
            )}

            <main style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 10, position: 'relative', overflowY: 'hidden', overflow: 'hidden',
            }}>
                {/* BACKGROUND */}
                <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
                    {data.mediaUrls.backgroundUrl ? (
                        <BackgroundMedia url={data.mediaUrls.backgroundUrl} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', backgroundColor: data.staticBackgroundColor || 'black' }} />
                    )}
                </div>

                {/* PAGE EFFECTS */}
                <PageEffectsManager effects={data.pageEffects} />

                {/* MUSIC PROMPT OVERLAY */}
                {showMusicPrompt && data.mediaUrls.musicUrl && (
                    <div
                        onClick={handleStartMusic}
                        style={{
                            position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', zIndex: 10000, backdropFilter: 'blur(20px)',
                            animation: 'fadeIn 0.3s ease-out',
                        }}
                    >
                        <div style={{ padding: '48px 64px', borderRadius: 32, textAlign: 'center' }}>
                            <div style={{
                                width: 50, height: 80, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                            }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="white" />
                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                </svg>
                            </div>
                            <h2 style={{ color: '#fff', fontSize: 14, marginBottom: 12, fontWeight: 600 }}>
                                {data.contentSettings.biography}
                            </h2>
                        </div>
                    </div>
                )}

                {/* CARD */}
                <div style={{
                    position: 'relative', zIndex: 10, width: '100%',
                    maxWidth: 440, animation: 'slideUp 0.6s ease-out',
                }}>
                    {data.cardSettings.rgbBorder ? (
                        <div className="rgb-border-wrapper">
                            <div
                                ref={cardRef}
                                style={cardStyle!}
                                onMouseMove={handleMouseMove}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                <CardContent
                                    data={data} frame={frame} badges={badges}
                                    showPlusOne={showPlusOne} getNameClass={getNameClass}
                                    hasVerifiedBadge={hasVerifiedBadge}
                                />
                                {cardEffect && data.isPremium && <CardEffectOverlay url={cardEffect} />}
                            </div>
                        </div>
                    ) : (
                        <div
                            ref={cardRef}
                            style={cardStyle!}
                            onMouseMove={handleMouseMove}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <CardContent
                                data={data} frame={frame} badges={badges}
                                showPlusOne={showPlusOne} getNameClass={getNameClass}
                                hasVerifiedBadge={hasVerifiedBadge}
                            />
                            {cardEffect && data.isPremium && <CardEffectOverlay url={cardEffect} />}
                        </div>
                    )}
                </div>

                {/* AUDIO */}
                {data.mediaUrls.musicUrl && (
                    <audio ref={audioRef} src={data.mediaUrls.musicUrl} loop preload="auto" />
                )}

                {/* VOLUME SLIDER */}
                {data.mediaUrls.musicUrl && !showMusicPrompt && (
                    <VolumeSlider
                        volume={volume}
                        onChange={handleVolumeChange}
                        isPlaying={isPlaying}
                        onTogglePlay={handleTogglePlay}
                        onToggleMute={handleToggleMute}
                    />
                )}

                {/* WATERMARK */}
                {!data.isPremium && (
                    <div
                        onClick={() => window.location.href = "/"}
                        style={{
                            position: 'fixed', top: 20, right: 20, padding: '8px 14px',
                            fontSize: 12, fontWeight: 500, color: 'rgba(255, 255, 255, 0.5)',
                            background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)',
                            borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.2s ease', zIndex: 50, userSelect: 'none',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
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
