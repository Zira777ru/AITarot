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
  Selection, // Entering question and choosing spread
  Shuffling, // Visual shuffling
  Drawing,   // Picking cards
  Revealing, // Cards placed on table
  Reading    // AI Generating/Showing result
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  age?: number; // Extracted or inferred from Google Account
}