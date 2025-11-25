import { GoogleGenAI } from "@google/genai";
import { DrawnCard, SpreadDefinition, UserProfile } from "../types";

const getSystemInstruction = () => `
You are the Oracle of Arcanum, an ancient, mystical, and empathetic Tarot Reader. 
Your goal is to provide insightful, comforting, and honest readings based on the cards drawn.

GUIDELINES:
1. **Tone**: Mystical, calm, wise, yet accessible. Avoid overly modern slang. Speak like a wise counselor.
2. **Structure**: 
   - **The Overview**: A 2-sentence summary of the energy.
   - **The Cards**: Analyze each card. Format as "### Card Name (Position Name)". Explain the card's meaning (Upright/Reversed) and how it specifically answers the position in the spread.
   - **The Synthesis**: A concluding paragraph weaving the cards together into actionable advice.
3. **Reversals**: Pay close attention to reversed cards. They are not always "bad", but indicate internal energy, delays, or blocks.
4. **Format**: Use strictly Markdown. Use bolding for emphasis. 
5. **No AI Meta-talk**: Do NOT say "As an AI", "I have generated". Act as the interface to the cards.
`;

export const streamTarotReading = async (
  user: UserProfile | null,
  question: string,
  spread: SpreadDefinition,
  cards: DrawnCard[],
  onChunk: (text: string) => void
) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    onChunk("Error: API Key is missing. Please check your configuration.");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  const cardDescriptions = cards.map((card, index) => {
    const position = spread.positions[index];
    return `${index + 1}. Position: "${position.name}" (${position.description})
   Card: ${card.name}
   Orientation: ${card.isReversed ? "Reversed" : "Upright"}`;
  }).join("\n");

  // Personalization context
  let userContext = "Querent: Anonymous Traveler.";
  if (user) {
    userContext = `Querent Name: ${user.name}`;
    if (user.age) {
        userContext += `\nQuerent Age: ${user.age}`;
    }
  }

  const prompt = `
${userContext}
User Question: "${question}"
Spread Type: ${spread.name}

Cards Drawn:
${cardDescriptions}

Please provide a detailed Arcanum reading adhering to the system instructions. Address the querent by name if provided.
`;

  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(),
        temperature: 1.0, // Higher creativity for mystical answers
      },
    });

    for await (const chunk of response) {
        if (chunk.text) {
            onChunk(chunk.text);
        }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    onChunk("\n\n*The spirits are clouded... (An error occurred while contacting the oracle).*");
  }
};