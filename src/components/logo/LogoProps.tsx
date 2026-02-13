import React from "react";
import { useNavigate } from "react-router-dom";

interface LogoProps {
  className?: string;
  size?: number | string;
  variant?: "full" | "icon" | "minimal" | "stacked";
}

export const VxoLogo: React.FC<LogoProps> = ({
  className = "",
  size = 60,
  variant = "full"
}) => {
  const numericSize = typeof size === 'string' ? parseInt(size) : size;
  const navigate = useNavigate();
  
  const getSize = () => {
    switch (variant) {
      case "icon":
        return numericSize * 0.4;
      case "minimal":
        return numericSize * 0.6;
      case "stacked":
        return numericSize * 0.8;
      case "full":
      default:
        return numericSize;
    }
  };

  const iconSize = getSize();
  const spacing = iconSize * 0.15;
  const fontSize = iconSize * 0.55;

  // Componente do ícone reutilizável
  const LogoIcon = ({ size: iconSz }: { size: number }) => (
    <svg 
      width={iconSz} 
      height={iconSz} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="transition-all duration-300 hover:brightness-110 hover:scale-105"
      style={{ color: 'var(--color-primary)', cursor: 'pointer' }}
      onClick={() => navigate("/")}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-secondary)" />
        </linearGradient>
      </defs>
      <path 
        d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2ZM16.37 14.63L14.15 16.85C13.61 17.39 12.91 17.65 12.21 17.65C11.51 17.65 10.8 17.38 10.27 16.85C9.2 15.78 9.2 14.03 10.27 12.96L11.68 11.55C11.97 11.26 12.45 11.26 12.74 11.55C13.03 11.84 13.03 12.32 12.74 12.61L11.33 14.02C10.84 14.51 10.84 15.3 11.33 15.79C11.82 16.28 12.61 16.28 13.1 15.79L15.32 13.57C15.93 12.96 16.27 12.14 16.27 11.27C16.27 10.4 15.93 9.59 15.32 8.97C14.09 7.74 11.95 7.74 10.72 8.97L8.29 11.4C7.25 12.44 7.25 14.14 8.29 15.19C8.58 15.48 8.58 15.96 8.29 16.25C8 16.54 7.52 16.54 7.23 16.25C5.6 14.62 5.6 11.97 7.23 10.34L9.65 7.92C10.55 7.02 11.74 6.53 13.01 6.53C14.28 6.53 15.47 7.02 16.37 7.92C17.27 8.82 17.76 10.01 17.76 11.28C17.76 12.55 17.27 13.74 16.37 14.63Z" 
        fill="url(#logoGradient)"
      />
    </svg>
  );

  // Componente do texto VXO estilizado
  const LogoText = ({ size: textSize }: { size: number }) => (
    <span 
      className="transition-all duration-300 hover:brightness-110 hover:scale-105 inline-block"
      style={{ 
        fontSize: `${textSize}px`,
        fontFamily: '"Nunito", "Quicksand", "Comfortaa", "Poppins", system-ui, sans-serif',
        fontWeight: 900,
        letterSpacing: '-0.02em',
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        lineHeight: 1,
        cursor: 'pointer',
      }}
      onClick={() => navigate("/")}
    >
      VXO
    </span>
  );

  // Variante: apenas um ícone (sem texto)
  if (variant === "icon") {
    return (
      <div className={className}>
        <LogoIcon size={iconSize} />
      </div>
    );
  }

  // Variante: stacked (empilhado verticalmente)
  if (variant === "stacked") {
    return (
      <div 
        className={`flex flex-col items-center ${className}`} 
        style={{ gap: spacing * 0.5 }}
      >
        <LogoIcon size={iconSize} />
        <LogoText size={fontSize * 0.8} />
      </div>
    );
  }

  // Variante: minimal (apenas texto estilizado)
  if (variant === "minimal") {
    return (
      <div className={`flex items-center ${className}`}>
        <LogoText size={fontSize * 1.2} />
      </div>
    );
  }

  // Variante: full (ícone + texto lado a lado)
  return (
    <div 
      className={`flex items-center ${className}`}
      style={{ gap: spacing * 0.6 }}
    >
      <LogoIcon size={iconSize * 0.65} />
      <LogoText size={fontSize * 0.9} />
    </div>
  );
};