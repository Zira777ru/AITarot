import React, { useState, useRef, useId } from 'react';
import { HelpCircle } from 'lucide-react';
import { DrawnCard, Suit } from '../types';

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

// --- LOGIC ---

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
  for (let i in lookup) {
    while (num >= lookup[i]) {
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
  const gradientId = useId();
  
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
    
    // Calculate tilt
    const rotateX = ((y - centerY) / centerY) * -10; 
    const rotateY = ((x - centerX) / centerX) * 10;
    
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

  // Luxury Gold Gradient for Frame
  const frontFrameGradient = `linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)`;

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
        className={`w-full h-full duration-700 will-change-transform rounded-lg drop-shadow-2xl relative`}
        style={{ 
            transformStyle: 'preserve-3d', 
            // Apply flip separately from tilt to avoid matrix interpolation issues
            transform: `rotateY(${isFlipped ? 180 : 0}deg) rotateY(${rotate.y}deg) rotateX(${rotate.x}deg)`,
            transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      >
        {/* ================= CARD BACK ================= */}
        {/* Z-Index logic: If NOT flipped, Back is on top (20) else (10) */}
        <div 
            className={`absolute inset-0 rounded-lg overflow-hidden bg-[#0a0b14] shadow-[inset_0_0_30px_rgba(0,0,0,1)] border border-[#8a6d3b]/30 transition-all ${!isFlipped ? 'z-20' : 'z-10'}`}
        >
           {/* Texture Overlay */}
           <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/leather.png')]"></div>
           
           {/* Double Border (Inset) */}
           <div className="absolute inset-2 border border-[#8a6d3b]/60 rounded-sm"></div>
           <div className="absolute inset-3 border border-[#8a6d3b]/40 rounded-sm"></div>
           
           {/* Mystical Symbol Center */}
           <div className="absolute inset-0 flex items-center justify-center opacity-80">
                <svg viewBox="0 0 100 100" className="w-20 h-20 text-[#8a6d3b]" style={{ filter: 'drop-shadow(0 0 5px rgba(207,181,103, 0.3))' }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8a6d3b" />
                            <stop offset="50%" stopColor="#cfb567" />
                            <stop offset="100%" stopColor="#8a6d3b" />
                        </linearGradient>
                    </defs>
                    <path d="M50 15 L85 80 L15 80 Z" fill="none" stroke={`url(#${gradientId})`} strokeWidth="1" />
                    <path d="M50 85 L15 20 L85 20 Z" fill="none" stroke={`url(#${gradientId})`} strokeWidth="1" />
                    <circle cx="50" cy="50" r="10" fill={`url(#${gradientId})`} opacity="0.5" />
                </svg>
           </div>
        </div>

        {/* ================= CARD FRONT ================= */}
        {/* Z-Index logic: If flipped, Front is on top (20) else (10) */}
        <div 
            className={`absolute inset-0 rounded-lg overflow-hidden bg-[#1c1611] shadow-xl transition-all ${isFlipped ? 'z-20' : 'z-10'}`}
            style={{ 
                // Front is strictly rotated 180deg relative to container
                transform: 'rotateY(180deg)'
            }}
        >
          {card && (
            <div className={`relative w-full h-full p-[6px] ${card.isReversed ? 'rotate-180' : ''}`} style={{ background: frontFrameGradient }}>
              
              {/* Inner Parchment Area */}
              <div className="w-full h-full bg-[#F5F0E6] relative overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,0.3)] flex flex-col border border-[#AA771C]/30">
                  
                  {/* Subtle Texture */}
                  <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/aged-paper.png')` }}></div>

                  {/* --- TOP SECTION: Badge & Type --- */}
                  <div className="relative pt-4 pb-2 z-10 flex flex-col items-center justify-center">
                      {/* Decorative Badge for Number */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8a6d3b] to-[#463420] text-[#F2F0E6] flex items-center justify-center border-2 border-[#cfb567] shadow-md z-20 relative ring-1 ring-[#000]/10">
                           {/* Small decorative inner ring */}
                           <div className="absolute inset-0.5 border border-[#F2F0E6]/20 rounded-full"></div>
                           <span className="font-serif font-bold text-xs shadow-black drop-shadow-sm">{toRoman(card.number || 0)}</span>
                      </div>
                      
                      {/* Suit/Arcana Name - Smaller, subordinate to the badge */}
                      <span className="text-[#8a6d3b] font-decorative font-bold tracking-[0.15em] text-[9px] uppercase mt-1 opacity-80">
                        {card.suit === Suit.Major ? 'Major' : card.suit.toUpperCase()}
                      </span>
                  </div>

                  {/* --- MIDDLE: Main Image --- */}
                  <div className="relative flex-1 w-full overflow-hidden mx-auto px-2 flex items-center justify-center">
                        {!imageError ? (
                            <div className="w-full h-full relative">
                                <img 
                                    src={getCardImageUrl(card)} 
                                    alt={card.name}
                                    onError={() => setImageError(true)}
                                    className="w-full h-full object-contain drop-shadow-md"
                                    style={{
                                        // Light vintage filter for clarity but with a touch of age
                                        filter: 'sepia(0.2) contrast(1.05)',
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#463420]/50 bg-[#F5F0E6]">
                                <span className="font-decorative text-xs">Image Unavailable</span>
                            </div>
                        )}
                  </div>

                  {/* --- BOTTOM: Name Inscription --- */}
                  <div className="relative z-10 py-3 pb-4 flex flex-col items-center justify-center bg-gradient-to-t from-[#F5F0E6] via-[#F5F0E6]/95 to-transparent">
                        {/* Decorative separator */}
                        <div className="w-3/4 h-px bg-gradient-to-r from-transparent via-[#8a6d3b]/40 to-transparent mb-1"></div>
                        
                        {/* Name in Cinzel Decorative, Uppercase, Tracking Widest */}
                        <span className="font-decorative font-bold text-[#463420] text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-center px-2 drop-shadow-sm leading-tight">
                            {card.name}
                        </span>
                        
                         {/* Decorative separator */}
                        <div className="w-1/2 h-px bg-gradient-to-r from-transparent via-[#8a6d3b]/20 to-transparent mt-1"></div>
                  </div>

              </div>
              
              {/* Dynamic Glare/Sheen */}
              <div 
                className="absolute inset-0 pointer-events-none mix-blend-soft-light z-40"
                style={{
                   background: `linear-gradient(115deg, transparent 30%, rgba(255,255,255, 0.4) 45%, rgba(255,255,255, 0.7) 50%, rgba(255,255,255, 0.4) 55%, transparent 70%)`,
                   backgroundPosition: `${glare.x}% ${glare.y}%`,
                   backgroundSize: '250% 250%',
                   opacity: glare.opacity,
                   transition: 'opacity 0.2s'
                }}
              />
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
};