import React, { useState, useMemo, useRef } from 'react';
import { DrawnCard, Suit } from '../types';
import { HelpCircle } from 'lucide-react';

interface CardProps {
  card?: DrawnCard;
  isFlipped: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  isPlaceholder?: boolean;
  label?: string;
  style?: React.CSSProperties;
}

// Helper to get image URL for the RWS deck
const getCardImageUrl = (card: DrawnCard): string => {
  const baseUrl = "https://raw.githubusercontent.com/kronusme/tarot-deck/master/images";
  
  if (card.suit === Suit.Major) {
    const numStr = (card.number || 0).toString().padStart(2, '0');
    return `${baseUrl}/${numStr}.jpg`;
  } else {
    const suitPrefix = card.suit.toLowerCase();
    const numStr = (card.number || 1).toString().padStart(2, '0');
    return `${baseUrl}/${suitPrefix}${numStr}.jpg`;
  }
};

const toRoman = (num: number): string => {
  if (num === 0) return "0";
  const lookup: Record<string, number> = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
  let roman = '';
  let i;
  for ( i in lookup ) {
    while ( num >= lookup[i] ) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
};

export const Card: React.FC<CardProps> = ({ 
  card, 
  isFlipped, 
  onClick, 
  className = '', 
  disabled,
  isPlaceholder,
  label,
  style
}) => {
  const [imageError, setImageError] = useState(false);
  
  // 3D Tilt Logic
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // REDUCED TILT: Make the card feel "heavier" (Ancient Artifact)
    const rotateX = ((y - centerY) / centerY) * -6; 
    const rotateY = ((x - centerX) / centerX) * 6;
    
    setRotate({ x: rotateX, y: rotateY });
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  if (isPlaceholder) {
    return (
      <div 
        className={`relative w-36 h-60 sm:w-48 sm:h-80 rounded-lg border-2 border-dashed border-[#8a6d3b]/30 bg-[#0a0b14]/50 flex flex-col items-center justify-center p-4 text-center transition-all duration-300 group ${className}`}
        style={style}
      >
        <div className="text-[#8a6d3b] opacity-40 group-hover:opacity-100 transition-opacity duration-300">
          <HelpCircle size={32} />
        </div>
        <span className="mt-2 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#8a6d3b] opacity-60 font-decorative font-bold">
          {label || "Future Card"}
        </span>
      </div>
    );
  }

  // --- PALETTE CONSTANTS ---
  const antiqueBronze = "#8a6d3b";
  const dimBronze = "#463420";
  const lightBronze = "#cfb567";
  const arcaneDark = "#0a0b14";

  // Volumetric Gradient for Front Frame (Diagonal)
  const frontFrameGradient = `linear-gradient(135deg, ${dimBronze} 0%, ${antiqueBronze} 25%, ${lightBronze} 50%, ${antiqueBronze} 75%, ${dimBronze} 100%)`;

  return (
    <div 
      ref={cardRef}
      className={`relative w-36 h-60 sm:w-48 sm:h-80 cursor-pointer perspective-1000 select-none ${className} ${disabled ? 'cursor-default' : ''}`}
      onClick={!disabled ? onClick : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{...style}}
    >
      <div 
        className={`w-full h-full duration-700 transform-style-3d transition-transform will-change-transform rounded-lg drop-shadow-2xl`}
        style={{ 
            transform: `rotateY(${isFlipped ? 180 : 0}deg) rotateX(${rotate.x}deg) rotateY(${isFlipped ? 180 + rotate.y : rotate.y}deg)`,
            transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)' // Heavier, smoother transition
        }}
      >
        {/* ================= CARD BACK (Grimoire Style) ================= */}
        <div className="absolute inset-0 backface-hidden rounded-lg overflow-hidden z-10 bg-[#0a0b14] shadow-[inset_0_0_30px_rgba(0,0,0,1)]">
           
           {/* Texture Overlay (Noise) */}
           <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none" style={{ filter: 'url(#paper-noise)' }}></div>
           
           {/* Double Border (Inset) */}
           <div className="absolute inset-2 border border-[#8a6d3b]/60 rounded-sm"></div>
           <div className="absolute inset-3 border border-[#8a6d3b]/40 rounded-sm"></div>
           
           {/* Mystical Symbol Center */}
           <div className="absolute inset-0 flex items-center justify-center opacity-90">
                <svg viewBox="0 0 100 100" className="w-24 h-24 text-[#8a6d3b]" style={{ filter: 'drop-shadow(0 0 8px rgba(207,181,103, 0.3))' }}>
                    {/* Triangle */}
                    <path d="M50 15 L85 80 L15 80 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                    {/* Inverted Triangle */}
                    <path d="M50 85 L15 20 L85 20 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                    {/* Eye */}
                    <g transform="translate(50, 50) scale(0.15)">
                        <path d="M-50,0 C-20,-30 20,-30 50,0 C20,30 -20,30 -50,0 Z" fill="none" stroke="currentColor" strokeWidth="6"/>
                        <circle cx="0" cy="0" r="15" fill="currentColor"/>
                    </g>
                </svg>
           </div>
        </div>

        {/* ================= CARD FRONT (Aged Artifact) ================= */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg overflow-hidden bg-[#1c1611] shadow-[0_0_20px_rgba(0,0,0,0.8)]">
          {card && (
            <div className={`relative w-full h-full flex flex-col p-[10px] ${card.isReversed ? 'rotate-180' : ''}`} style={{ background: frontFrameGradient }}>
              
              {/* Inner Content Container */}
              <div className="flex-1 bg-[#1a1510] relative overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] flex flex-col">
                  
                  {/* Top: Roman Numeral Badge */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
                      <div className="w-7 h-7 bg-gradient-to-br from-[#463420] to-[#1c1611] border border-[#8a6d3b] rotate-45 flex items-center justify-center shadow-lg">
                           <span className="text-[#cfb567] font-serif font-bold text-[10px] -rotate-45">
                               {toRoman(card.number || 0)}
                           </span>
                      </div>
                  </div>

                  {/* Main Image Area with Filters */}
                  <div className="relative flex-1 w-full h-full bg-[#1a1510] overflow-hidden">
                        {!imageError ? (
                            <>
                                <img 
                                    src={getCardImageUrl(card)} 
                                    alt={card.name}
                                    onError={() => setImageError(true)}
                                    className="w-full h-full object-cover"
                                    style={{
                                        // AGING FILTER: Sepia, Contrast up, Saturation down, Brightness down
                                        filter: 'sepia(0.6) contrast(1.2) saturate(0.8) brightness(0.85)',
                                    }}
                                />
                                {/* Paper Texture Overlay */}
                                <div className="absolute inset-0 mix-blend-overlay opacity-40 pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/aged-paper.png')` }}></div>
                                {/* Vignette */}
                                <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(20,10,0,0.8)] pointer-events-none"></div>
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#2b241b] text-[#8a6d3b]">
                                <span className="font-decorative text-xs">{card.name}</span>
                            </div>
                        )}
                  </div>

                  {/* Bottom: Nameplate */}
                  <div className="h-10 bg-[#1c1611] border-t border-[#8a6d3b]/50 flex items-center justify-center relative z-20">
                       <span className="font-decorative font-bold text-[#cfb567] text-[9px] sm:text-[10px] uppercase tracking-widest text-center px-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                           {card.name}
                       </span>
                  </div>

              </div>
              
              {/* Dynamic Glare/Sheen (Gold Tinted) */}
              <div 
                className="absolute inset-0 pointer-events-none mix-blend-soft-light z-40 transition-opacity duration-150 rounded-lg"
                style={{
                   background: `linear-gradient(115deg, transparent 30%, rgba(207,181,103, 0.2) 45%, rgba(207,181,103, 0.4) 50%, rgba(207,181,103, 0.2) 55%, transparent 70%)`,
                   backgroundPosition: `${glare.x}% ${glare.y}%`,
                   backgroundSize: '250% 250%',
                   opacity: glare.opacity
                }}
              />
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
};