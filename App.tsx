import React, { useState, useEffect, useRef } from 'react';
import { StarBackground } from './components/StarBackground';
import { Card } from './components/Card';
import { AppState, DrawnCard, SpreadType, UserProfile } from './types';
import { DECK, SPREADS } from './constants';
import { streamTarotReading } from './services/geminiService';
import { Sparkles, RefreshCw, ChevronRight, BookOpen, Layers, LogOut, User as UserIcon, History } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// --- MOCK AUTH SERVICE (Replace with real Firebase/Supabase in production) ---
const mockGoogleLogin = async (): Promise<UserProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'user_12345',
        name: 'Initiate Traveler',
        email: 'traveler@arcanum.ai',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4',
        age: 28 // Simulated age extraction from Google Account
      });
    }, 1500); // Simulate network delay
  });
};

// --- CUSTOM ICONS ---
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.027-3.24 2.053-2.053 2.627-5.027 2.627-7.467 0-.747-.08-1.467-.213-2.187h-10.44z"/>
  </svg>
);

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.Intro);
  const [question, setQuestion] = useState("");
  const [selectedSpreadType, setSelectedSpreadType] = useState<SpreadType>(SpreadType.Single);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [deckStack, setDeckStack] = useState<DrawnCard[]>([]); // The shuffled deck waiting to be drawn
  const [reading, setReading] = useState("");
  const [isReadingLoading, setIsReadingLoading] = useState(false);
  const [cardsRevealed, setCardsRevealed] = useState(false); // Controls the visual flip animation
  const readingEndRef = useRef<HTMLDivElement>(null);

  // --- AUTH STATE ---
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const spreadDef = SPREADS[selectedSpreadType];

  const handleLogin = async (shouldStartAfterLogin: boolean = false) => {
    setIsAuthLoading(true);
    try {
      // In a real app, calls firebase.auth().signInWithPopup(provider)
      const userData = await mockGoogleLogin();
      setUser(userData);
      
      // If triggered from the "Start" button, auto-advance
      if (shouldStartAfterLogin) {
          setAppState(AppState.Selection);
      }
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    resetApp();
  };

  const handleStart = async () => {
    if (!user) {
        // Enforce Login
        await handleLogin(true);
    } else {
        setAppState(AppState.Selection);
    }
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
      }, 800);
    }
  };

  const revealAllCards = () => {
     // Trigger reading generation
     setAppState(AppState.Reading);
     generateReading();
  };

  // Handle Reveal Animation and Reading Trigger
  useEffect(() => {
    if (appState === AppState.Revealing) {
      // Small delay to ensure component is mounted before triggering the flip animation
      setTimeout(() => {
          setCardsRevealed(true);
      }, 100);

      const timer = setTimeout(() => {
         setAppState(AppState.Reading);
         generateReading();
      }, 2000); // Wait 2s for cards to flip and user to see them
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState]);

  const generateReading = async () => {
    setIsReadingLoading(true);
    setReading("");
    await streamTarotReading(user, question, spreadDef, drawnCards, (chunk) => {
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
    setCardsRevealed(false);
    setAppState(AppState.Intro);
  };

  // Custom Separator Component
  const OrnamentalSeparator = () => (
    <div className="flex items-center justify-center gap-4 w-full my-8 opacity-80">
      <div className="h-px bg-gradient-to-r from-transparent via-[#C5A059] to-transparent w-full flex-1" />
      <div className="relative">
         <div className="w-2 h-2 rotate-45 border border-[#C5A059] bg-transparent"></div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-[#C5A059] to-transparent w-full flex-1" />
    </div>
  );

  return (
    <div className="min-h-screen text-[#F2F0E6] relative overflow-x-hidden pb-12 font-sans selection:bg-[#C5A059] selection:text-black">
      <StarBackground />

      <header className="p-6 flex justify-between items-center z-10 relative bg-black/20 backdrop-blur-sm border-b border-[#C5A059]/20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Sparkles className="text-[#C5A059] absolute animate-pulse opacity-50" size={24} />
            <Sparkles className="text-[#F2F0E6] relative z-10" size={20} />
          </div>
          <h1 className="text-xl sm:text-2xl font-decorative font-bold tracking-[0.1em] text-[#C5A059] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] cursor-pointer" onClick={resetApp}>
            ARCANUM
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {appState !== AppState.Intro && (
            <button onClick={resetApp} className="hidden sm:flex text-xs sm:text-sm text-[#F2F0E6]/70 hover:text-[#C5A059] transition items-center gap-1 border border-[#C5A059]/30 rounded-full px-3 py-1 hover:bg-[#C5A059]/10">
              <RefreshCw size={14} /> New Reading
            </button>
          )}

          {/* --- AUTH SECTION --- */}
          {user ? (
            <div className="flex items-center gap-3 animate-in fade-in">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-decorative text-[#C5A059] tracking-wider">{user.name}</span>
                <span className="text-[10px] text-gray-500 font-body italic">Acolyte</span>
              </div>
              <div className="relative group cursor-pointer">
                 <div className="w-9 h-9 rounded-full p-[2px] border border-[#C5A059] bg-black/50 overflow-hidden relative">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="User" className="w-full h-full rounded-full" />
                    ) : (
                      <UserIcon className="w-full h-full p-1 text-[#C5A059]" />
                    )}
                 </div>
                 {/* Dropdown */}
                 <div className="absolute right-0 top-full mt-2 w-48 bg-[#0a0b14] border border-[#C5A059]/40 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all transform origin-top-right scale-95 group-hover:scale-100 z-50">
                    <div className="p-3 border-b border-[#C5A059]/20 text-center">
                       <p className="text-[#C5A059] text-xs font-decorative">Saved Readings</p>
                       <p className="text-gray-500 text-[10px] italic">0 Scrolls stored</p>
                    </div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-[#F2F0E6] hover:bg-[#C5A059]/20 flex items-center gap-2 transition-colors">
                       <LogOut size={14} /> Sign Out
                    </button>
                 </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => handleLogin(false)}
              disabled={isAuthLoading}
              className="group flex items-center gap-2 px-4 py-2 rounded-sm border border-[#C5A059]/50 bg-transparent hover:bg-[#C5A059]/10 transition-all duration-300 relative overflow-hidden"
            >
              {isAuthLoading ? (
                 <Sparkles className="animate-spin text-[#C5A059]" size={18} />
              ) : (
                 <>
                   <GoogleIcon className="text-[#C5A059] group-hover:text-[#F2F0E6] transition-colors w-4 h-4" />
                   <span className="text-sm font-decorative tracking-wide text-[#C5A059] group-hover:text-[#F2F0E6]">Sign In</span>
                 </>
              )}
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8 flex flex-col items-center justify-center min-h-[70vh]">
        
        {/* STAGE 1: INTRO */}
        {appState === AppState.Intro && (
          <div className="text-center max-w-2xl animate-in fade-in zoom-in duration-700 mt-10">
            <div className="mb-8 inline-flex items-center justify-center p-6 rounded-full bg-gradient-to-br from-black to-[#1a1a2e] border border-[#C5A059]/40 backdrop-blur-md shadow-[0_0_40px_rgba(197,160,89,0.2)]">
                <Sparkles className="w-16 h-16 text-[#C5A059] animate-pulse" />
            </div>
            <h2 className="text-5xl md:text-7xl font-decorative mb-6 text-[#F2F0E6] drop-shadow-[0_0_25px_rgba(197,160,89,0.3)] tracking-wide">
              ARCANUM
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent mx-auto mb-8"></div>
            <p className="text-lg md:text-xl text-[#F2F0E6]/80 mb-12 font-body italic leading-relaxed">
              "The universe speaks in symbols." <br/>
              Enter the sanctuary, focus your intent, and let the cards guide your path.
            </p>
            
            {/* Main Action Button - Changes based on Auth */}
            <button 
              onClick={handleStart}
              disabled={isAuthLoading}
              className="group relative px-12 py-4 bg-transparent border border-[#C5A059]/50 text-[#C5A059] font-decorative text-lg tracking-[0.15em] overflow-hidden transition-all duration-500 hover:bg-[#C5A059]/10 hover:border-[#C5A059] hover:shadow-[0_0_30px_rgba(197,160,89,0.2)]"
            >
              <span className="absolute inset-0 w-0 bg-[#C5A059]/10 transition-all duration-[250ms] ease-out group-hover:w-full"></span>
              <span className="relative flex items-center gap-3">
                 {isAuthLoading ? (
                    <Sparkles className="animate-spin" />
                 ) : user ? (
                    <>ENTER SANCTUARY <ChevronRight size={18} /></>
                 ) : (
                    <>
                       <GoogleIcon className="w-5 h-5 mr-1" />
                       SIGN IN TO BEGIN
                    </>
                 )}
              </span>
            </button>
            
            {!user && (
               <p className="mt-6 text-xs text-gray-500 font-body italic opacity-60">
                 Account required for personalized destiny readings.
               </p>
            )}
          </div>
        )}

        {/* STAGE 2: SELECTION */}
        {appState === AppState.Selection && (
          <div className="w-full max-w-lg bg-[#0f0c29]/90 backdrop-blur-md p-6 sm:p-8 rounded-lg border border-[#C5A059]/20 animate-in slide-in-from-bottom-10 fade-in shadow-2xl">
            <div className="mb-8">
              <label className="block text-xs font-bold text-[#C5A059] mb-2 uppercase tracking-widest flex items-center gap-2 font-decorative">
                 <Sparkles size={12}/> Your Query
              </label>
              <textarea 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What energies are influencing my path? What should I focus on?"
                className="w-full bg-black/40 border border-[#C5A059]/30 rounded-none border-t-0 border-x-0 border-b-2 p-4 text-[#F2F0E6] focus:outline-none focus:border-[#C5A059] transition h-32 resize-none placeholder:text-gray-600 font-body text-lg italic"
              />
            </div>

            <div className="mb-10">
              <label className="block text-xs font-bold text-[#C5A059] mb-3 uppercase tracking-widest flex items-center gap-2 font-decorative">
                 <Layers size={12}/> Sacred Spread
              </label>
              <div className="grid grid-cols-1 gap-3">
                {(Object.values(SPREADS) as typeof spreadDef[]).map((s) => (
                  <button
                    key={s.type}
                    onClick={() => setSelectedSpreadType(s.type)}
                    className={`p-4 rounded-sm border text-left transition-all duration-300 flex items-center justify-between group ${
                      selectedSpreadType === s.type 
                        ? 'bg-[#C5A059]/10 border-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.1)]' 
                        : 'bg-transparent border-[#C5A059]/20 text-gray-400 hover:bg-[#C5A059]/5 hover:border-[#C5A059]/40'
                    }`}
                  >
                    <div>
                        <div className={`font-bold font-decorative tracking-wide ${selectedSpreadType === s.type ? 'text-[#F2F0E6]' : 'text-gray-500 group-hover:text-[#F2F0E6]'}`}>{s.name}</div>
                        <div className="text-xs opacity-70 mt-1 font-body italic">{s.description}</div>
                    </div>
                    {selectedSpreadType === s.type && <Sparkles size={16} className="text-[#C5A059] animate-spin-slow" />}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleSelectionComplete}
              disabled={!question.trim()}
              className="w-full py-4 bg-gradient-to-r from-[#1a1a2e] to-[#0f0c29] rounded-sm border border-[#C5A059]/40 font-decorative tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#C5A059] hover:shadow-[0_0_20px_rgba(197,160,89,0.2)] transition-all text-[#C5A059] font-bold"
            >
              COMMUNE WITH CARDS
            </button>
          </div>
        )}

        {/* STAGE 3: SHUFFLING */}
        {appState === AppState.Shuffling && (
          <div className="flex flex-col items-center animate-in fade-in duration-1000">
            <div className="relative w-40 h-60 mb-8">
               {/* Shuffling Animation */}
               <div className="absolute inset-0 bg-[#0f0c29] rounded-xl border border-[#C5A059]/50 shadow-xl animate-[ping_1.5s_ease-in-out_infinite] opacity-20"></div>
               <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-xl border-2 border-[#C5A059]/30 flex items-center justify-center animate-[bounce_0.5s_infinite]">
                 <Layers className="text-[#C5A059] w-12 h-12 animate-pulse" />
               </div>
            </div>
            <p className="text-2xl font-decorative text-[#C5A059] animate-pulse tracking-[0.3em]">MIXING FATE</p>
            <p className="mt-4 text-sm text-[#C5A059]/60 max-w-md text-center italic font-body">
              "The threads of destiny are being woven..."
            </p>
          </div>
        )}

        {/* STAGE 4: DRAWING (Interactive) */}
        {appState === AppState.Drawing && (
          <div className="w-full flex flex-col items-center min-h-[60vh]">
             <div className="text-center mb-10 animate-in slide-in-from-top-5">
                <h3 className="text-2xl font-decorative text-[#F2F0E6] tracking-[0.2em] mb-2">THE DRAW</h3>
                <p className="text-sm text-[#C5A059]/80 font-body italic">
                    Focus on your question. Click the deck to draw {spreadDef.positions.length - drawnCards.length} more card{spreadDef.positions.length - drawnCards.length !== 1 ? 's' : ''}.
                </p>
             </div>

             <div className="flex flex-col xl:flex-row items-center justify-center gap-16 xl:gap-24 w-full max-w-7xl">
                
                {/* The Deck Stack (Left side) */}
                <div className="relative group cursor-pointer" onClick={handleDrawOneCard}>
                    {/* Visual stack depth */}
                    <div className="absolute top-[-6px] left-[-6px] w-44 h-72 bg-[#18181b] rounded-xl border border-[#C5A059]/20 rotate-[-3deg]"></div>
                    <div className="absolute top-[-3px] left-[-3px] w-44 h-72 bg-[#27272a] rounded-xl border border-[#C5A059]/30 rotate-[-1.5deg]"></div>
                    
                    {/* Main Interactive Deck Card */}
                    <Card 
                        isFlipped={false} 
                        className="shadow-[0_0_30px_rgba(197,160,89,0.1)] hover:shadow-[0_0_60px_rgba(197,160,89,0.3)] transition-all duration-300 hover:-translate-y-2 border-[#C5A059]/50"
                    />
                    
                    <div className="absolute -bottom-12 w-full text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                         <span className="text-xs uppercase tracking-widest text-[#C5A059] font-bold bg-black/80 px-3 py-1.5 rounded font-decorative border border-[#C5A059]/30">Click to Draw</span>
                    </div>
                </div>

                {/* The Spread Slots (Right/Center side) */}
                <div className="flex flex-wrap justify-center gap-8">
                    {spreadDef.positions.map((pos, idx) => {
                        const card = drawnCards[idx];
                        const isNext = idx === drawnCards.length;

                        return (
                           <div key={idx} className={`flex flex-col items-center gap-4 transition-all duration-500 ${isNext ? 'opacity-100 scale-105' : 'opacity-70 grayscale-[0.5]'}`}>
                              <div className="text-[10px] font-decorative text-[#C5A059]/70 uppercase tracking-widest min-h-[1rem]">{idx + 1}. {pos.name}</div>
                              {card ? (
                                  <Card 
                                    card={card} 
                                    isFlipped={false} 
                                    className="animate-in zoom-in slide-in-from-left-10 duration-500 shadow-lg"
                                  />
                              ) : (
                                  <Card 
                                    isFlipped={false} 
                                    isPlaceholder={true} 
                                    label={pos.name}
                                    className={`${isNext ? 'border-[#C5A059] bg-[#C5A059]/10 shadow-[0_0_20px_rgba(197,160,89,0.2)]' : ''}`}
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
          <div className="w-full max-w-7xl flex flex-col items-center">
            
            {/* The Spread Display */}
            <div className="flex flex-wrap justify-center gap-8 sm:gap-10 mb-20 w-full animate-in slide-in-from-bottom-20 duration-1000 ease-out px-4">
              {spreadDef.positions.map((pos, idx) => {
                const card = drawnCards[idx];
                return (
                  <div key={idx} className="flex flex-col items-center gap-4 group perspective-1000">
                    <div className="text-[10px] font-decorative text-[#C5A059] uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full border border-[#C5A059]/20 shadow-lg">
                        {pos.name}
                    </div>
                    <Card 
                      card={card} 
                      isFlipped={cardsRevealed || appState === AppState.Reading} 
                      className={`shadow-[0_15px_40px_rgba(0,0,0,0.8)] transition-all duration-700 hover:scale-105 hover:z-10`} 
                      style={{ transitionDelay: `${idx * 200}ms` }}
                    />
                    <div className="text-center mt-2 max-w-[9rem] opacity-0 animate-in fade-in fill-mode-forwards" style={{animationDelay: `${idx * 200 + 500}ms`}}>
                        <p className="font-decorative font-bold text-sm text-[#F2F0E6] border-b border-[#C5A059]/30 pb-1 mb-1">{card.name}</p>
                        {card.isReversed ? (
                            <p className="text-[10px] text-red-400 uppercase font-bold tracking-wider inline-block bg-red-950/50 px-2 py-0.5 rounded border border-red-500/30">Reversed</p>
                        ) : (
                            <p className="text-[10px] text-emerald-400/70 uppercase font-bold tracking-wider inline-block">Upright</p>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* The Reading */}
            {appState === AppState.Reading && (
              <div className="w-full max-w-3xl rounded-sm p-10 sm:p-14 shadow-2xl animate-in fade-in duration-1000 mb-20 relative overflow-hidden bg-[radial-gradient(circle_at_center,_#1E2A4A_0%,_#000000_100%)]">
                
                {/* Noise Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#C5A059] opacity-50"></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#C5A059] opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#C5A059] opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#C5A059] opacity-50"></div>

                <div className="flex flex-col items-center gap-4 mb-4 relative z-10">
                  <div className="p-3 bg-black/60 rounded-full border border-[#C5A059]/60 shadow-[0_0_15px_rgba(197,160,89,0.2)]">
                     <BookOpen className="text-[#C5A059] w-6 h-6" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-decorative text-[#C5A059] tracking-widest text-center mt-2 drop-shadow-md">
                    THE INTERPRETATION
                  </h3>
                  
                  <OrnamentalSeparator />
                </div>
                
                <div className="drop-cap prose prose-invert prose-p:text-[#F2F0E6] prose-p:font-body prose-headings:text-[#C5A059] prose-headings:font-decorative prose-headings:tracking-wide prose-strong:text-[#C5A059] prose-strong:font-bold max-w-none leading-loose text-lg sm:text-xl font-light relative z-10 text-justify">
                   {reading ? (
                      <ReactMarkdown>{reading}</ReactMarkdown>
                   ) : (
                      <div className="flex flex-col items-center justify-center py-12 gap-6 text-[#C5A059]/80 animate-pulse">
                        <Sparkles size={40} className="animate-spin-slow" /> 
                        <span className="font-decorative text-xl tracking-[0.2em]">CONSULTING THE ORACLE...</span>
                      </div>
                   )}
                   <div ref={readingEndRef} />
                </div>
                
                {isReadingLoading && reading && (
                   <div className="mt-8 flex justify-center gap-3 relative z-10">
                      <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-bounce delay-150"></span>
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