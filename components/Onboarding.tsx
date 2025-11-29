import React, { useState } from 'react';
import { SoulProfile } from '../types';
import { Sparkles, ArrowRight, BookOpen, Moon, Sun, Heart, Brain } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: SoulProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<SoulProfile>>({
    decisionStyle: 'Intuition'
  });

  const handleNext = (key: keyof SoulProfile, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
    setStep(prev => prev + 1);
  };

  const handleFinalSubmit = () => {
    // Validate
    if (data.coreValues && data.deepestFear && data.currentGoal && data.struggle) {
        onComplete(data as SoulProfile);
    }
  };

  const questions = [
    {
      title: "The Core",
      question: "What values drive your spirit?",
      key: "coreValues",
      placeholder: "e.g., Freedom, Truth, Family, Creativity...",
      icon: <Sun className="w-8 h-8 text-[#C5A059]" />
    },
    {
      title: "The Shadow",
      question: "What is your deepest fear?",
      key: "deepestFear",
      placeholder: "e.g., Being forgotten, Stagnation, Betrayal...",
      icon: <Moon className="w-8 h-8 text-[#C5A059]" />
    },
    {
      title: "The Path",
      question: "What is your current major goal?",
      key: "currentGoal",
      placeholder: "e.g., Launching a business, Finding inner peace...",
      icon: <BookOpen className="w-8 h-8 text-[#C5A059]" />
    },
    {
      title: "The Obstacle",
      question: "What is your biggest struggle right now?",
      key: "struggle",
      placeholder: "e.g., Lack of confidence, Financial stress...",
      icon: <Sparkles className="w-8 h-8 text-[#C5A059]" />
    },
  ];

  if (step === questions.length) {
     // Decision Style Step
     return (
        <div className="fixed inset-0 z-50 bg-[#050505] flex items-center justify-center p-4">
           <div className="max-w-md w-full animate-in fade-in zoom-in duration-700">
              <h2 className="text-3xl font-decorative text-[#C5A059] text-center mb-8">How do you decide?</h2>
              <div className="grid grid-cols-1 gap-4">
                 {[
                    { val: 'Head', label: 'Logic & Analysis', icon: <Brain/> },
                    { val: 'Heart', label: 'Emotion & Feeling', icon: <Heart/> },
                    { val: 'Intuition', label: 'Gut & Spirit', icon: <Sparkles/> }
                 ].map((choice) => (
                    <button 
                        key={choice.val}
                        onClick={() => {
                            setData(prev => ({ ...prev, decisionStyle: choice.val as any }));
                            // We need to pass the complete object including this update
                            const finalProfile = { ...data, decisionStyle: choice.val } as SoulProfile;
                            onComplete(finalProfile);
                        }}
                        className="p-6 border border-[#C5A059]/30 hover:border-[#C5A059] hover:bg-[#C5A059]/10 rounded flex items-center gap-4 transition-all group"
                    >
                        <div className="text-[#C5A059] group-hover:scale-110 transition-transform">{choice.icon}</div>
                        <span className="font-decorative text-xl text-[#F2F0E6]">{choice.label}</span>
                    </button>
                 ))}
              </div>
           </div>
        </div>
     );
  }

  const q = questions[step];

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center p-6">
       <div className="absolute top-0 left-0 w-full h-2 bg-[#1a1a1a]">
          <div className="h-full bg-[#C5A059] transition-all duration-700" style={{ width: `${(step / (questions.length + 1)) * 100}%` }}></div>
       </div>

       <div className="max-w-xl w-full text-center animate-in slide-in-from-right-10 duration-500 key={step}">
          <div className="flex justify-center mb-6 animate-pulse">
             {q.icon}
          </div>
          <h2 className="text-sm font-decorative tracking-[0.3em] text-[#C5A059]/70 uppercase mb-2">Step {step + 1} of {questions.length + 1}</h2>
          <h1 className="text-3xl md:text-4xl font-decorative text-[#F2F0E6] mb-8">{q.question}</h1>
          
          <input 
            autoFocus
            type="text" 
            className="w-full bg-transparent border-b-2 border-[#C5A059]/30 text-2xl py-4 text-center text-[#C5A059] focus:outline-none focus:border-[#C5A059] placeholder:text-[#C5A059]/20 font-body italic"
            placeholder={q.placeholder}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) handleNext(q.key as keyof SoulProfile, e.currentTarget.value);
            }}
          />
          
          <button 
            className="mt-12 group flex items-center gap-2 mx-auto text-[#F2F0E6]/50 hover:text-[#C5A059] transition-colors"
            onClick={(e) => {
                const input = (e.currentTarget.previousSibling as HTMLInputElement).value;
                if (input) handleNext(q.key as keyof SoulProfile, input);
            }}
          >
             <span className="uppercase tracking-widest text-sm">Next</span>
             <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform"/>
          </button>
       </div>
    </div>
  );
};