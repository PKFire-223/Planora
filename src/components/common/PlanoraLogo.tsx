import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface PlanoraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
  variant?: 'light' | 'dark' | 'auto';
}

export function PlanoraLogo({
  size = 'md',
  showText = true,
  className = '',
  onClick,
  variant = 'auto'
}: PlanoraLogoProps) {
  const { isDark: contextIsDark } = useTheme();
  const isDark = variant === 'auto' ? contextIsDark : variant === 'dark';

  const iconSizes = {
    sm: { width: 22, height: 16 },
    md: { width: 32, height: 23 },
    lg: { width: 44, height: 32 },
    xl: { width: 58, height: 42 }
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
    xl: 'w-3 h-3'
  };

  const currentIcon = iconSizes[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Official Planora Icon SVG */}
      <svg
        width={currentIcon.width}
        height={currentIcon.height}
        viewBox="0 0 102 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
        aria-label="Planora Logo Icon"
      >
        {/* Left vertical capsule */}
        <rect
          x="0"
          y="0"
          width="14"
          height="72"
          rx="7"
          fill="#2563EB"
        />
        {/* Top horizontal capsule (purple / periwinkle) */}
        <rect
          x="24"
          y="0"
          width="54"
          height="16"
          rx="8"
          fill="#6366F1"
        />
        {/* Middle horizontal capsule (cyan / teal, longer) */}
        <rect
          x="24"
          y="28"
          width="74"
          height="16"
          rx="8"
          fill="#06B6D4"
        />
        {/* Bottom horizontal capsule (blue) */}
        <rect
          x="24"
          y="56"
          width="42"
          height="16"
          rx="8"
          fill="#3B82F6"
        />
      </svg>

      {/* Planora Brand Name & Accent Dot */}
      {showText && (
        <div className="flex items-baseline font-bold tracking-tight">
          <span
            className={`${textSizes[size]} transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
            style={{ fontFamily: "'Roboto', sans-serif", letterSpacing: '-0.02em' }}
          >
            Planora
          </span>
          <span
            className={`inline-block rounded-full bg-[#6366F1] ml-1 mb-0.5 ${dotSizes[size]}`}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
