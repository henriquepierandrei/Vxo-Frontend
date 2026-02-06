import React from "react";

interface LogoProps {
  className?: string;
  size?: number | string;
  variant?: "full" | "icon" | "minimal" | "stacked";
}

// ============================================
// VARIANTE 1: Logo Completo (Ícone + Wordmark)
// ============================================
export const VxoLogo: React.FC<LogoProps> = ({
  className = "",
  size = 120,
  variant = "full"
}) => {


  return (
    <svg
      viewBox="0 0 120 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={typeof size === "number" ? (size * 32) / 120 : "auto"}
      className={className}
      aria-label="NEO Logo"
      role="img"
    >
      {/* Icon - Árvore de Links */}
      <g>
        {/* Círculo externo */}
        <circle
          cx="16"
          cy="16"
          r="14"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />

        {/* Tronco central */}
        <line
          x1="16"
          y1="24"
          x2="16"
          y2="12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Galho esquerdo */}
        <line
          x1="16"
          y1="16"
          x2="10"
          y2="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Galho direito */}
        <line
          x1="16"
          y1="16"
          x2="22"
          y2="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Nó central (ponto de conexão) */}
        <circle
          cx="16"
          cy="16"
          r="2"
          fill="currentColor"
        />

        {/* Folha/Link esquerdo */}
        <circle
          cx="10"
          cy="10"
          r="2"
          fill="currentColor"
          opacity="0.7"
        />

        {/* Folha/Link direito */}
        <circle
          cx="22"
          cy="10"
          r="2"
          fill="currentColor"
          opacity="0.7"
        />

        {/* Folha/Link topo */}
        <circle
          cx="16"
          cy="8"
          r="2"
          fill="currentColor"
        />

        {/* Linha para folha topo */}
        <line
          x1="16"
          y1="12"
          x2="16"
          y2="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* Wordmark */}
      <g fill="currentColor">
        {/* V */}
        <path d="M34 8h3.5l4 12 4-12h3.5l-5.5 16h-4L34 8Z" />
        {/* X */}
        <path d="M51 8h4l4 6 4-6h4l-6 8 6 8h-4l-4-6-4 6h-4l6-8-6-8Z" />
        {/* O */}
        <path d="M77 7.5c4.7 0 8 3.5 8 8.5s-3.3 8.5-8 8.5-8-3.5-8-8.5 3.3-8.5 8-8.5Zm0 13.5c2.5 0 4.3-2 4.3-5s-1.8-5-4.3-5-4.3 2-4.3 5 1.8 5 4.3 5Z" />
      </g>
    </svg>
  );
};