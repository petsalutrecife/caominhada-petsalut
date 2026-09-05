import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'light' | 'dark';
}

export default function Logo({ className = '', size = 'md', variant = 'light' }: LogoProps) {
  const heights = {
    sm: 'h-8 sm:h-10',
    md: 'h-10 sm:h-12',
    lg: 'h-16 sm:h-20',
  };

  const logoSrc = '/logo.png';

  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src={logoSrc}
        alt="Logo Pet Salute"
        className={`${heights[size]} w-auto object-contain transition-transform duration-200 hover:scale-105`}
      />
    </div>
  );
}
