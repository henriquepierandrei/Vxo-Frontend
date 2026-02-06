import React from "react";

interface LogoProps {
    className?: string;
    size?: number | string;
    variant?: "full" | "icon" | "minimal" | "stacked";
}

export const VxoLogoSmall: React.FC<LogoProps> = ({
    className = "",
    size = 40,
    variant = "full"
}) => {
    return (
        <svg
            viewBox="0 0 32 32" // Agora é quadrado
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size} // Mantém quadrado
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
        </svg>
    );
};
