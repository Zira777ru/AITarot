import { CardData, SpreadDefinition, SpreadType, Suit } from './types';

export const MAJOR_ARCANA_NAMES = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
  "Judgement", "The World"
];

export const SUIT_NAMES = [Suit.Wands, Suit.Cups, Suit.Swords, Suit.Pentacles];
export const RANK_NAMES = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];

// Generate Full Deck
export const DECK: CardData[] = [
  ...MAJOR_ARCANA_NAMES.map((name, index) => ({
    id: `major-${index}`,
    name,
    suit: Suit.Major,
    number: index,
    description: "Major Archetype"
  })),
  ...SUIT_NAMES.flatMap(suit => 
    RANK_NAMES.map((rank, index) => ({
      id: `${suit.toLowerCase()}-${index}`,
      name: `${rank} of ${suit}`,
      suit,
      number: index + 1,
      description: "Minor Arcana"
    }))
  )
];

export const SPREADS: Record<SpreadType, SpreadDefinition> = {
  [SpreadType.Single]: {
    type: SpreadType.Single,
    name: "Single Card Draw",
    description: "A quick answer to a specific question or a daily theme.",
    positions: [
      { name: "The Answer", description: "Insight into the situation." }
    ]
  },
  [SpreadType.ThreeCard]: {
    type: SpreadType.ThreeCard,
    name: "Past, Present, Future",
    description: "Understand the temporal flow of your situation.",
    positions: [
      { name: "Past", description: "Influences from the past." },
      { name: "Present", description: "Current situation." },
      { name: "Future", description: "Likely outcome." }
    ]
  },
  [SpreadType.Decision]: {
    type: SpreadType.Decision,
    name: "Decision Making",
    description: "Weighing two options.",
    positions: [
      { name: "The Dilemma", description: "The nature of the choice." },
      { name: "Option A", description: "What happens if you choose A." },
      { name: "Option B", description: "What happens if you choose B." }
    ]
  },
  [SpreadType.CelticCross]: {
    type: SpreadType.CelticCross,
    name: "Celtic Cross (Simplified)",
    description: "Deep dive into a complex situation. (5 Cards version for speed)",
    positions: [
      { name: "The Heart", description: "Central issue." },
      { name: "The Cross", description: "Challenge or obstacle." },
      { name: "The Foundation", description: "Subconscious influences." },
      { name: "The Crown", description: "Goals and ideals." },
      { name: "The Outcome", description: "Final trajectory." }
    ]
  }
};
