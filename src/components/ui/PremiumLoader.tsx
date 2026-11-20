'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface PremiumLoaderProps {
  title?: string;
  subtitle?: string;
  minHeight?: string;
  compact?: boolean;
}

export function PremiumLoader({
  title = 'Loading Operations Data...',
  subtitle = 'Synchronizing bespoke records, client orders, and atelier metrics...',
  minHeight = 'min-h-[360px]',
  compact = false,
}: PremiumLoaderProps) {
  return (
    <div
      className={`w-full flex flex-col items-center justify-center text-center p-6 ${
        compact ? 'py-12' : minHeight
      } select-none`}
    >
      {/* Ambient Radial Aura */}
      <div className="relative flex items-center justify-center">
        {/* Soft Golden Glow */}
        <div className="absolute w-28 h-28 rounded-full bg-[#D4AF37]/15 blur-2xl animate-pulse pointer-events-none" />

        {/* Outer Rotating Metallic Ring */}
        <div className="w-16 h-16 rounded-full border-2 border-transparent border-t-[#D4AF37] border-r-[#D4AF37]/40 animate-spin" />

        {/* Inner Counter-Rotating Ring */}
        <div className="absolute w-11 h-11 rounded-full border-2 border-transparent border-b-[#8C5818] border-l-[#FFE59E] animate-spin [animation-direction:reverse] [animation-duration:1.3s]" />

        {/* Central Crown/Sparkle Core */}
        <div className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-[#200414] to-[#450A2C] border border-[#D4AF37]/80 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
          <Sparkles className="w-3.5 h-3.5 text-[#FFE8A3] animate-pulse" />
        </div>
      </div>

      {/* Typography Hierarchy */}
      <div className="mt-5 space-y-1.5 max-w-md">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FAF0DD] border border-[#D4AF37]/50 text-[10px] font-serif font-bold uppercase tracking-[0.22em] text-[#8C5818]">
          <span>Nalmara Atelier</span>
        </div>

        <h3 className="text-base font-serif font-bold text-[#200414] tracking-wide">
          {title}
        </h3>

        {subtitle && (
          <p className="text-xs text-[#6B4B35] font-light leading-relaxed">
            {subtitle}
          </p>
        )}

        {/* Shimmering Golden Hairline */}
        <div className="pt-2 flex justify-center">
          <div className="w-36 h-0.5 rounded-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default PremiumLoader;

