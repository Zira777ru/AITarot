import React, { useState, useEffect, useRef } from 'react';
import { StarBackground } from './components/StarBackground';
import { Card } from './components/Card';
import { AppState, DrawnCard, SpreadType } from './types';
import { DECK, SPREADS } from './constants';
import { streamTarotReading } from './services/geminiService';
import { Sparkles, RefreshCw, ChevronRight, BookOpen, Layers } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.Intro);
  const [question, setQuestion] = useState("");
  const [selectedSpreadType, setSelectedSpreadType] = useState<SpreadType>(SpreadType.Single);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [deckStack, setDeckStack] = useState<DrawnCard[]>([]); // The shuffled deck waiting to be drawn
  const [reading, setReading] = useState("");
  const [isReadingLoading, setIsReadingLoading] = useState(false);
  const readingEndRef = useRef<HTMLDivElement>(null);

  const spreadDef = SPREADS[selectedSpreadType];

  const handleStart = () => {
    setAppState(AppState.Selection);
  };

  const handleSelectionComplete = () => {
    if (!question.trim()) return;
    setAppState(AppState.Shuffling);
    
    // Shuffle the deck here
    const shuffled = [...DECK].sort(() => 0.5 - Math.random());
    // Pre-assign reversals
    const preparedDeck = shuffled.map(card => ({
        ...card,
        isReversed: Math.random() > 0.8 
    }));
    setDeckStack(preparedDeck);

    // Simulate shuffling time
    setTimeout(() => {
      setAppState(AppState.Drawing);
    }, 2500);
  };

  // User clicks the deck to "deal" a card
  const handleDrawOneCard = () => {
    if (drawnCards.length >= spreadDef.positions.length) return;

    const nextCard = deckStack[0];
    const remainingDeck = deckStack.slice(1);
    
    setDeckStack(remainingDeck);
    setDrawnCards(prev => [...prev, nextCard]);

    // If we just drew the last card needed
    if (drawnCards.length + 1 === spreadDef.positions.length) {
      setTimeout(() => {
        setAppState(AppState.Revealing);
      }, 500);
    }
  };

  const revealAllCards = () => {
     // Trigger reading generation
     setAppState(AppState.Reading);
     generateReading();
  };

  // We no longer auto-generate on Revealing state, user clicks "Interpret" or we auto-trigger after cards are shown
  // Let's auto-trigger for smoothness but keep separate states
  useEffect(() => {
    if (appState === AppState.Revealing) {
      const timer = setTimeout(() => {
         setAppState(AppState.Reading);
         generateReading();
      }, 1000); 
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState]);

  const generateReading = async () => {
    setIsReadingLoading(true);
    setReading("");
    await streamTarotReading(question, spreadDef, drawnCards, (chunk) => {
      setReading(prev => prev + chunk);
      // Auto-scroll
      if (readingEndRef.current) {
        readingEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    });
    setIsReadingLoading(false);
  };

  const resetApp = () => {
    setQuestion("");
    setDrawnCards([]);
    setDeckStack([]);
    setReading("");
    setAppState(AppState.Intro);
  };

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden pb-12 font-sans">
      <StarBackground />

      <header className="p-6 flex justify-between items-center z-10 relative bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="text-purple-400" />
          <h1 className="text-xl sm:text-2xl font-serif tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-300">
            MYSTIC AI TAROT
          </h1>
        </div>
        {appState !== AppState.Intro && (
          <button onClick={resetApp} className="text-xs sm:text-sm text-purple-200/70 hover:text-white transition flex items-center gap-1 border border-purple-500/30 rounded-full px-3 py-1">
            <RefreshCw size={14} /> New Reading
          </button>
        )}
      </header>

      <main className="container mx-auto px-4 mt-8 flex flex-col items-center justify-center min-h-[70vh]">
        
        {/* STAGE 1: INTRO */}
        {appState === AppState.Intro && (
          <div className="text-center max-w-2xl animate-in fade-in zoom-in duration-700 mt-10">
            <div className="mb-6 inline-block p-4 rounded-full bg-purple-900/20 border border-purple-500/30 backdrop-blur-md">
                <Sparkles className="w-12 h-12 text-purple-400 animate-pulse" />
            </div>
            <h2 className="text-4xl md:text-6xl font-serif mb-6 text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              Reveal Your Destiny
            </h2>
            <p className="text-lg text-gray-300 mb-10 font-light leading-relaxed">
              Experience the ancient wisdom of Tarot, interpreted by modern intelligence. 
              Focus your energy, ask your question, and personally draw your cards.
            </p>
            <button 
              onClick={handleStart}
              className="group relative px-10 py-4 bg-purple-900/40 border border-purple-400/50 text-purple-100 font-serif text-lg tracking-widest overflow-hidden hover:bg-purple-800/50 transition-all duration-300 rounded-sm"
            >
              <span className="relative flex items-center gap-3">
                 BEGIN READING <ChevronRight size={18} />
              </span>
            </button>
          </div>
        )}

        {/* STAGE 2: SELECTION */}
        {appState === AppState.Selection && (
          <div className="w-full max-w-lg bg-[#0f0c29]/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 animate-in slide-in-from-bottom-10 fade-in shadow-2xl">
            <div className="mb-6">
              <label className="block text-xs font-bold text-purple-300 mb-2 uppercase tracking-widest">Your Question</label>
              <textarea 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What is the energy surrounding my career? Will I find love soon?"
                className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition h-32 resize-none placeholder:text-gray-600"
              />
            </div>

            <div className="mb-8">
              <label className="block text-xs font-bold text-purple-300 mb-2 uppercase tracking-widest">Choose Spread</label>
              <div className="grid grid-cols-1 gap-3">
                {(Object.values(SPREADS) as typeof spreadDef[]).map((s) => (
                  <button
                    key={s.type}
                    onClick={() => setSelectedSpreadType(s.type)}
                    className={`p-4 rounded-lg border text-left transition flex items-center justify-between group ${
                      selectedSpreadType === s.type 
                        ? 'bg-purple-900/40 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                        : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div>
                        <div className={`font-bold font-serif ${selectedSpreadType === s.type ? 'text-white' : 'text-gray-300'}`}>{s.name}</div>
                        <div className="text-xs opacity-70 mt-1">{s.description}</div>
                    </div>
                    {selectedSpreadType === s.type && <Sparkles size={16} className="text-purple-400" />}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleSelectionComplete}
              disabled={!question.trim()}
              className="w-full py-4 bg-gradient-to-r from-purple-700 to-indigo-700 rounded-lg font-serif tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-indigo-600 hover:shadow-[0_0_20px_rgba(129,140,248,0.4)] transition-all text-white font-bold"
            >
              CONSULT THE CARDS
            </button>
          </div>
        )}

        {/* STAGE 3: SHUFFLING */}
        {appState === AppState.Shuffling && (
          <div className="flex flex-col items-center animate-in fade-in duration-1000">
            <div className="relative w-40 h-60 mb-8">
               {/* Shuffling Animation */}
               <div className="absolute inset-0 bg-indigo-950 rounded-xl border border-indigo-700 shadow-xl animate-[ping_1.5s_ease-in-out_infinite] opacity-20"></div>
               <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-xl border-2 border-indigo-400/30 flex items-center justify-center animate-[bounce_0.5s_infinite]">
                 <Layers className="text-indigo-300 w-12 h-12 animate-spin-slow" />
               </div>
            </div>
            <p className="text-2xl font-serif text-purple-200 animate-pulse tracking-widest">SHUFFLING</p>
            <p className="mt-4 text-sm text-purple-300/60 max-w-md text-center italic">
              "The cards are aligning with your energy..."
            </p>
          </div>
        )}

        {/* STAGE 4: DRAWING (Interactive) */}
        {appState === AppState.Drawing && (
          <div className="w-full flex flex-col items-center">
             <div className="text-center mb-8 animate-in slide-in-from-top-5">
                <h3 className="text-xl font-serif text-purple-200 tracking-wider">DRAW YOUR CARDS</h3>
                <p className="text-sm text-purple-400/60 mt-2">
                    Click the deck to draw {spreadDef.positions.length - drawnCards.length} more card{spreadDef.positions.length - drawnCards.length !== 1 ? 's' : ''}
                </p>
             </div>

             <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 w-full max-w-5xl">
                
                {/* The Deck Stack */}
                <div className="relative group cursor-pointer" onClick={handleDrawOneCard}>
                    {/* Stack effect behind */}
                    <div className="absolute top-[-4px] left-[-4px] w-36 h-56 bg-indigo-900 rounded-xl border border-indigo-800 rotate-[-2deg]"></div>
                    <div className="absolute top-[-2px] left-[-2px] w-36 h-56 bg-indigo-900 rounded-xl border border-indigo-800 rotate-[-1deg]"></div>
                    
                    {/* Main Deck Card */}
                    <Card 
                        isFlipped={false} 
                        className="shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] transition-shadow hover:-translate-y-2 duration-300"
                    />
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="bg-black/50 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 uppercase tracking-widest">
                            Draw
                        </span>
                    </div>
                </div>

                {/* The Spread (Placeholders & Drawn Cards) */}
                <div className="flex flex-wrap justify-center gap-4">
                    {spreadDef.positions.map((pos, idx) => {
                        const card = drawnCards[idx];
                        const isNext = idx === drawnCards.length;

                        return (
                           <div key={idx} className={`flex flex-col items-center gap-2 transition-all duration-500 ${isNext ? 'scale-105 opacity-100' : 'opacity-80'}`}>
                              <div className="text-[10px] font-serif text-purple-300/70 uppercase tracking-widest mb-1">{idx + 1}. {pos.name}</div>
                              {card ? (
                                  <Card 
                                    card={card} 
                                    isFlipped={false} 
                                    className="animate-in zoom-in slide-in-from-left-10 duration-500"
                                  />
                              ) : (
                                  <Card 
                                    isFlipped={false} 
                                    isPlaceholder={true} 
                                    label={pos.name}
                                    className={`${isNext ? 'border-purple-400/60 bg-purple-900/10' : ''}`}
                                  />
                              )}
                           </div>
                        );
                    })}
                </div>

             </div>
          </div>
        )}

        {/* STAGE 5 & 6: REVEALING & READING */}
        {(appState === AppState.Revealing || appState === AppState.Reading) && (
          <div className="w-full max-w-6xl flex flex-col items-center">
            
            {/* The Spread Display */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-12 w-full animate-in slide-in-from-bottom-20 duration-700">
              {spreadDef.positions.map((pos, idx) => {
                const card = drawnCards[idx];
                return (
                  <div key={idx} className="flex flex-col items-center gap-3 group">
                    <div className="text-[10px] font-serif text-purple-300 uppercase tracking-widest bg-black/30 px-2 py-1 rounded border border-white/5">
                        {pos.name}
                    </div>
                    <Card 
                      card={card} 
                      isFlipped={true} 
                      className={`shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-700 delay-${idx * 150} hover:scale-105 hover:z-10`} 
                    />
                    <div className="text-center mt-1 max-w-[9rem]">
                        <p className="font-serif font-bold text-sm text-purple-100 border-b border-white/10 pb-1 mb-1">{card.name}</p>
                        {card.isReversed ? (
                            <p className="text-[9px] text-red-300 uppercase font-bold tracking-wider inline-block bg-red-900/20 px-1 rounded">Reversed</p>
                        ) : (
                            <p className="text-[9px] text-green-300/50 uppercase font-bold tracking-wider inline-block">Upright</p>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* The Reading */}
            {appState === AppState.Reading && (
              <div className="w-full max-w-3xl bg-[#0f0c29]/90 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 sm:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in duration-1000 mb-20">
                <div className="flex flex-col items-center gap-4 mb-8 border-b border-white/10 pb-6">
                  <BookOpen className="text-purple-400 w-8 h-8" />
                  <h3 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-200">The Interpretation</h3>
                </div>
                
                <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-purple-200 prose-headings:font-serif prose-strong:text-purple-100 max-w-none leading-relaxed font-light text-lg">
                   {reading ? (
                      <ReactMarkdown>{reading}</ReactMarkdown>
                   ) : (
                      <div className="flex flex-col items-center justify-center py-10 gap-4 text-purple-300 animate-pulse">
                        <Sparkles size={32} /> 
                        <span className="font-serif text-xl tracking-widest">Consulting the Oracle...</span>
                      </div>
                   )}
                   <div ref={readingEndRef} />
                </div>
                
                {isReadingLoading && reading && (
                   <div className="mt-6 flex justify-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-75"></span>
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></span>
                   </div>
                )}
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}

export default App;