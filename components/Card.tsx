import React from 'react';
import { DrawnCard, Suit } from '../types';
import { Sparkles, Moon, Sun, Sword, Anchor, Heart, HelpCircle } from 'lucide-react';

interface CardProps {
  card?: DrawnCard;
  isFlipped: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  isPlaceholder?: boolean;
  label?: string; // For placeholder labels like "Past", "Future"
}

// Helper for Roman Numerals (1-22 for Major Arcana)
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

const SuitIcon = ({ suit, className }: { suit: Suit; className?: string }) => {
  switch (suit) {
    case Suit.Wands: return <Sun className={className} />;
    case Suit.Cups: return <Heart className={className} />;
    case Suit.Swords: return <Sword className={className} />;
    case Suit.Pentacles: return <Anchor className={className} />;
    case Suit.Major: return <Moon className={className} />;
    default: return <Sparkles className={className} />;
  }
};

export const Card: React.FC<CardProps> = ({ 
  card, 
  isFlipped, 
  onClick, 
  className = '', 
  disabled,
  isPlaceholder,
  label
}) => {
  
  // If it's a placeholder (empty slot on table)
  if (isPlaceholder) {
    return (
      <div className={`relative w-28 h-44 sm:w-36 sm:h-56 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center p-2 text-center ${className}`}>
        <div className="text-white/20 mb-2">
          <HelpCircle size={24} />
        </div>
        <span className="text-[10px] sm:text-xs uppercase tracking-widest text-white/40 font-serif">
          {label || "Card Position"}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-28 h-44 sm:w-36 sm:h-56 cursor-pointer perspective-1000 group ${className} ${disabled ? 'cursor-default' : ''}`}
      onClick={!disabled ? onClick : undefined}
    >
      <div 
        className={`w-full h-full duration-700 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Card Back */}
        <div className="absolute w-full h-full backface-hidden rounded-xl shadow-xl overflow-hidden border-2 border-[#2a2a4a] bg-[#1a1a2e]">
           {/* Pattern Overlay */}
           <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent"></div>
           
           <div className="w-full h-full flex items-center justify-center relative">
             <div className="border border-indigo-400/30 w-[92%] h-[95%] rounded-lg flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
                <div className="w-16 h-16 rounded-full border border-indigo-500/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Sparkles className="text-indigo-300 w-8 h-8" />
                </div>
             </div>
           </div>
        </div>

        {/* Card Front */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl shadow-2xl overflow-hidden bg-[#f0eee6] text-[#1a1a1a] border-[6px] border-white">
          {card && (
            <div className={`relative w-full h-full flex flex-col p-3 ${card.isReversed ? 'rotate-180' : ''}`}>
              {/* Inner ornate border */}
              <div className="absolute inset-2 border border-[#8b7355] pointer-events-none rounded-sm opacity-50"></div>
              
              {/* Top Number */}
              <div className="flex justify-center w-full mb-2">
                 <span className="font-serif font-bold text-[#8b7355] text-sm">
                   {card.suit === Suit.Major ? toRoman(card.number || 0) : (card.number || 0)}
                 </span>
              </div>

              {/* Center Content */}
              <div className="flex-1 flex flex-col items-center justify-center gap-2 z-10">
                 <SuitIcon 
                   suit={card.suit} 
                   className={`w-10 h-10 ${
                     card.suit === Suit.Cups || card.suit === Suit.Wands ? 'text-[#a63c3c]' : 'text-[#2c3e50]'
                   }`} 
                 />
                 <h3 className="font-serif font-bold text-xs sm:text-sm text-center leading-tight px-1 uppercase tracking-tight">
                   {card.name}
                 </h3>
              </div>

              {/* Bottom Suit Name */}
              <div className="mt-auto text-center z-10">
                <div className="text-[9px] font-serif uppercase tracking-widest text-gray-500 border-t border-[#8b7355]/30 pt-1 mx-4">
                  {card.suit === Suit.Major ? "Arcana Major" : card.suit}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};