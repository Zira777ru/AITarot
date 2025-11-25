import React, { useState, useRef, useId, useEffect } from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';
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

const getSuitSymbol = (suit: Suit): string => {
  switch (suit) {
    case Suit.Major: return "✦";
    case Suit.Cups: return "♥";
    case Suit.Wands: return "♣";
    case Suit.Swords: return "♠";
    case Suit.Pentacles: return "♦";
    default: return "✦";
  }
};

const getArcanaSymbol = (number: number): string => {
  const symbols = ['☽', '☉', '★', '◈', '✧', '❂', '⚜', '☥', '⚓', '⚛', '⛤', '✣', '✤', '✦'];
  return symbols[number % symbols.length];
};

const getSuitColor = (suit: Suit): string => {
    // Subtle tints for the suits to distinguish them while keeping the Gold theme
    switch (suit) {
        case Suit.Cups: return "from-[#8a6d3b] to-[#8a4b3b]"; // Reddish Bronze
        case Suit.Swords: return "from-[#8a6d3b] to-[#4a5d6b]"; // Bluish Bronze
        case Suit.Wands: return "from-[#8a6d3b] to-[#5c4a3b]"; // Darker Wood Bronze
        case Suit.Pentacles: return "from-[#8a6d3b] to-[#cfb567]"; // Bright Gold
        default: return "from-[#8a6d3b] to-[#463420]"; // Classic Antique
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
  const gradientId = useId();
  
  // 3D Tilt Logic
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  // Luxury Gold Gradient for Frame
  const frontFrameGradient = `linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)`;

  // Particle effect state
  const [particles, setParticles] = useState<{x: number, y: number, id: number}[]>([]);

  useEffect(() => {
    if (!isFlipped || isPlaceholder) return;
    
    const interval = setInterval(() => {
      setParticles(prev => {
        const newParticle = {
          x: Math.random() * 100,
          y: Math.random() * 100,
          id: Date.now() + Math.random()
        };
        return [...prev.slice(-8), newParticle];
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isFlipped, isPlaceholder]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate tilt
    const rotateX = ((y - centerY) / centerY) * -12; // Increased slightly for parallax feel
    const rotateY = ((x - centerX) / centerX) * 12;
    
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

  return (
    <div 
      ref={cardRef}
      className={`relative w-36 h-60 sm:w-48 sm:h-80 cursor-pointer perspective-1000 select-none ${className} ${disabled ? 'cursor-default' : ''}`}
      onClick={!disabled ? onClick : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{...style}}
    >
      {/* Magical aura glow - only when flipped */}
      {isFlipped && !isPlaceholder && (
        <>
          <div className="absolute inset-0 rounded-lg blur-xl bg-gradient-to-r from-[#C5A059] via-[#8a6d3b] to-[#C5A059] opacity-40 animate-pulse" 
               style={{transform: 'scale(1.1)'}} />
          <div className="absolute inset-0 rounded-lg blur-2xl bg-[#C5A059] opacity-20 animate-pulse" 
               style={{transform: 'scale(1.2)', animationDelay: '0.5s'}} />
        </>
      )}

      {/* Mystical particles */}
      {isFlipped && !isPlaceholder && particles.map(p => (
        <div
          key={p.id}
          className="absolute w-1 h-1 rounded-full bg-[#C5A059] pointer-events-none animate-float-up"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            boxShadow: '0 0 4px 1px rgba(197,160,89,0.8)',
            animation: 'float-up 2s ease-out forwards'
          }}
        />
      ))}

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
              
              {/* Animated Sparkles on Frame */}
              <div className="absolute top-1 left-1 text-[#FBF5B7] animate-sparkle" style={{animationDelay: '0.2s'}}><Sparkles size={8} /></div>
              <div className="absolute bottom-1 right-1 text-[#FBF5B7] animate-sparkle" style={{animationDelay: '1.5s'}}><Sparkles size={8} /></div>

              {/* Inner Parchment Area */}
              <div className="w-full h-full bg-[#F5F0E6] relative overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,0.3)] flex flex-col border border-[#AA771C]/30 group-hover:shadow-[inset_0_0_20px_rgba(0,0,0,0.4)] transition-shadow">
                  
                  {/* Subtle Texture */}
                  <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/aged-paper.png')` }}></div>

                  {/* Holographic Sheen Overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none mix-blend-overlay animate-holo bg-[linear-gradient(115deg,transparent,rgba(255,0,128,0.3),rgba(0,255,255,0.3),rgba(255,215,0,0.3),transparent)] z-30"></div>

                  {/* --- TOP SECTION: Badge & Type --- */}
                  <div className="relative pt-4 pb-2 z-20 flex flex-col items-center justify-center">
                      {/* Decorative Badge for Number */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8a6d3b] to-[#463420] text-[#F2F0E6] flex items-center justify-center border-2 border-[#cfb567] shadow-md z-20 relative ring-1 ring-[#000]/10">
                           {/* Small decorative inner ring */}
                           <div className="absolute inset-0.5 border border-[#F2F0E6]/20 rounded-full"></div>
                           <span className="font-serif font-bold text-xs shadow-black drop-shadow-sm">{toRoman(card.number || 0)}</span>
                      </div>
                      
                      {/* Suit/Arcana Name */}
                      <span className="text-[#8a6d3b] font-decorative font-bold tracking-[0.15em] text-[9px] uppercase mt-1 opacity-80">
                        {card.suit === Suit.Major ? 'Major' : card.suit.toUpperCase()}
                      </span>
                  </div>

                  {/* --- MIDDLE: MINIMALISTIC SYMBOL COMPOSITION --- */}
                  <div className="relative flex-1 w-full overflow-hidden mx-auto flex items-center justify-center perspective-1000">
                      
                      {/* 1. Rotating Geometric Background Ring */}
                      <div className="absolute w-32 h-32 rounded-full border border-dashed border-[#8a6d3b]/20 animate-spin-slow opacity-60" 
                           style={{ animationDuration: '20s' }}></div>
                      
                      {/* 2. Static Decorative Diamond */}
                      <div className="absolute w-24 h-24 border border-[#8a6d3b]/10 rotate-45"></div>

                      {/* 3. Parallax Container */}
                      <div 
                        className="relative flex items-center justify-center"
                        style={{
                            transform: `translateX(${-rotate.y * 1.5}px) translateY(${-rotate.x * 1.5}px)`,
                            transition: 'transform 0.1s ease-out'
                        }}
                      >
                         {/* Main Suit Symbol (Massive) */}
                         <div className={`text-6xl sm:text-7xl bg-gradient-to-b ${getSuitColor(card.suit)} bg-clip-text text-transparent drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)] font-serif`}>
                             {getSuitSymbol(card.suit)}
                         </div>

                         {/* Floating Arcane Glyph (Pulsing) */}
                         <div className="absolute -top-6 -right-4 text-[#cfb567] text-xl animate-pulse drop-shadow-md opacity-80">
                             {getArcanaSymbol(card.number || 0)}
                         </div>
                      </div>

                      {/* Image-specific sheen */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay"></div>
                  </div>

                  {/* --- BOTTOM: Name Inscription --- */}
                  <div className="relative z-20 py-3 pb-4 flex flex-col items-center justify-center bg-gradient-to-t from-[#F5F0E6] via-[#F5F0E6]/95 to-transparent">
                        <div className="w-3/4 h-px bg-gradient-to-r from-transparent via-[#8a6d3b]/40 to-transparent mb-1"></div>
                        <span className="font-decorative font-bold text-[#463420] text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-center px-2 drop-shadow-sm leading-tight">
                            {card.name}
                        </span>
                        <div className="w-1/2 h-px bg-gradient-to-r from-transparent via-[#8a6d3b]/20 to-transparent mt-1"></div>
                  </div>

              </div>
              
              {/* Dynamic Glare/Sheen (Top Layer) */}
              <div 
                className="absolute inset-0 pointer-events-none mix-blend-soft-light z-40 rounded-lg"
                style={{
                   background: `linear-gradient(115deg, transparent 30%, rgba(255,255,255, 0.4) 45%, rgba(255,255,255, 0.8) 50%, rgba(255,255,255, 0.4) 55%, transparent 70%)`,
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