import React from 'react';
import { AIPreferences } from '../types';
import { X, Settings, Brain, Sparkles, Scale } from 'lucide-react';

interface SettingsModalProps {
  preferences: AIPreferences;
  onSave: (prefs: AIPreferences) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ preferences, onSave, onClose }) => {
  const handleChange = (key: keyof AIPreferences, value: string) => {
    onSave({ ...preferences, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0f0c29] border border-[#C5A059]/40 rounded-lg p-6 shadow-[0_0_50px_rgba(197,160,89,0.2)] animate-in zoom-in-95">
        
        <div className="flex justify-between items-center mb-8 border-b border-[#C5A059]/20 pb-4">
            <h2 className="text-2xl font-decorative text-[#C5A059] flex items-center gap-2">
                <Settings className="animate-spin-slow" /> Tuning the Oracle
            </h2>
            <button onClick={onClose} className="text-[#F2F0E6]/50 hover:text-[#C5A059]"><X/></button>
        </div>

        <div className="space-y-8">
            
            {/* Style */}
            <div>
                <label className="block text-xs uppercase tracking-widest text-[#F2F0E6]/60 mb-3">Interpretation Style</label>
                <div className="grid grid-cols-3 gap-2">
                    {['Psychological', 'Balanced', 'Esoteric'].map(style => (
                        <button
                            key={style}
                            onClick={() => handleChange('style', style)}
                            className={`p-3 border rounded text-sm font-decorative transition-all ${preferences.style === style ? 'bg-[#C5A059] text-black border-[#C5A059]' : 'border-[#C5A059]/30 text-[#C5A059] hover:bg-[#C5A059]/10'}`}
                        >
                            {style}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-[#F2F0E6]/40 mt-2 italic">
                    {preferences.style === 'Psychological' && "Uses Jungian archetypes and subconscious analysis."}
                    {preferences.style === 'Esoteric' && "Uses Astrology, Kabbalah, and Magickal symbolism."}
                    {preferences.style === 'Balanced' && "A harmony of modern mind and ancient spirit."}
                </p>
            </div>

            {/* Skepticism */}
            <div>
                <label className="block text-xs uppercase tracking-widest text-[#F2F0E6]/60 mb-3">Tone</label>
                <div className="flex bg-black/40 p-1 rounded border border-[#C5A059]/20">
                    <button 
                        onClick={() => handleChange('skepticism', 'Analytical')}
                        className={`flex-1 py-2 flex items-center justify-center gap-2 rounded transition-all ${preferences.skepticism === 'Analytical' ? 'bg-[#C5A059]/20 text-[#C5A059]' : 'text-[#F2F0E6]/40'}`}
                    >
                        <Brain size={14}/> Grounded
                    </button>
                    <button 
                        onClick={() => handleChange('skepticism', 'Believer')}
                        className={`flex-1 py-2 flex items-center justify-center gap-2 rounded transition-all ${preferences.skepticism === 'Believer' ? 'bg-[#C5A059]/20 text-[#C5A059]' : 'text-[#F2F0E6]/40'}`}
                    >
                        <Sparkles size={14}/> Mystical
                    </button>
                </div>
            </div>

            {/* Verbosity */}
            <div>
                <label className="block text-xs uppercase tracking-widest text-[#F2F0E6]/60 mb-3">Depth</label>
                <div className="flex bg-black/40 p-1 rounded border border-[#C5A059]/20">
                    <button 
                        onClick={() => handleChange('verbosity', 'Concise')}
                        className={`flex-1 py-2 rounded transition-all ${preferences.verbosity === 'Concise' ? 'bg-[#C5A059]/20 text-[#C5A059]' : 'text-[#F2F0E6]/40'}`}
                    >
                        Essence (Short)
                    </button>
                    <button 
                        onClick={() => handleChange('verbosity', 'Detailed')}
                        className={`flex-1 py-2 rounded transition-all ${preferences.verbosity === 'Detailed' ? 'bg-[#C5A059]/20 text-[#C5A059]' : 'text-[#F2F0E6]/40'}`}
                    >
                        Deep Dive (Long)
                    </button>
                </div>
            </div>

        </div>

        <div className="mt-8 pt-6 border-t border-[#C5A059]/20 flex justify-end">
            <button onClick={onClose} className="px-6 py-2 bg-[#C5A059] text-black font-bold font-decorative tracking-wider hover:bg-[#cfb567] transition-colors rounded-sm">
                CONFIRM
            </button>
        </div>

      </div>
    </div>
  );
};