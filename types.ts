export enum Suit {
  Wands = 'Wands',
  Cups = 'Cups',
  Swords = 'Swords',
  Pentacles = 'Pentacles',
  Major = 'Major Arcana'
}

export interface CardData {
  id: string;
  name: string;
  suit: Suit;
  number?: number; // 0 for Fool, 1-14 for Minor
  description: string; // Brief keyword description
}

export interface DrawnCard extends CardData {
  isReversed: boolean;
}

export enum SpreadType {
  Single = 'Single Card',
  ThreeCard = 'Past, Present, Future',
  CelticCross = 'Celtic Cross',
  Decision = 'Decision Making'
}

export interface SpreadPosition {
  name: string;
  description: string;
}

export interface SpreadDefinition {
  type: SpreadType;
  name: string;
  description: string;
  positions: SpreadPosition[];
}

export enum AppState {
  Intro,
  Onboarding, // New State for Soul Profile questions
  Selection, // Entering question and choosing spread
  Shuffling, // Visual shuffling
  Drawing,   // Picking cards
  Revealing, // Cards placed on table
  Reading    // AI Generating/Showing result
}

// --- SOUL PROFILE & MEMORY ---

export interface SoulProfile {
  coreValues: string;      // "Freedom, Creativity"
  deepestFear: string;     // "Stagnation, Irrelevance"
  currentGoal: string;     // "Launching a startup"
  decisionStyle: 'Head' | 'Heart' | 'Intuition';
  struggle: string;        // Current major challenge
}

export interface AIPreferences {
  style: 'Psychological' | 'Esoteric' | 'Balanced'; // Jungian vs Magick vs Mixed
  verbosity: 'Concise' | 'Detailed';
  skepticism: 'Believer' | 'Analytical'; // Tone of voice
}

export interface ReadingLog {
  id: string;
  date: number; // Timestamp
  question: string;
  spreadName: string;
  cards: { name: string; position: string; isReversed: boolean }[];
  summary: string; // Short AI summary for context window
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  age?: number; 
  soulProfile?: SoulProfile;
  preferences?: AIPreferences;
  history?: ReadingLog[]; // Last 5-10 readings for context
}