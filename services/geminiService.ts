import { GoogleGenAI } from "@google/genai";
import { DrawnCard, SpreadDefinition, UserProfile, ReadingLog } from "../types";

export const streamTarotReading = async (
  user: UserProfile | null,
  question: string,
  spread: SpreadDefinition,
  cards: DrawnCard[],
  onChunk: (text: string) => void,
  onComplete?: (fullText: string) => void
) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    onChunk("Error: API Key is missing. Please check your configuration.");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  // 1. FORMAT CURRENT CARDS
  const cardDescriptions = cards.map((card, index) => {
    const position = spread.positions[index];
    return `${index + 1}. Position: "${position.name}" (${position.description})
   Card: ${card.name}
   Orientation: ${card.isReversed ? "Reversed" : "Upright"}`;
  }).join("\n");

  // 2. BUILD SOUL PROFILE CONTEXT
  let userContext = "Querent: Anonymous Traveler.";
  let styleInstruction = "Style: Mystical yet accessible.";

  if (user) {
    userContext = `Querent Name: ${user.name}`;
    if (user.age) userContext += `\nQuerent Age: ${user.age}`;
    
    if (user.soulProfile) {
        userContext += `
\n*** SOUL PROFILE (DEEP CONTEXT) ***
- Core Values: ${user.soulProfile.coreValues}
- Deepest Fear: ${user.soulProfile.deepestFear}
- Current Goal: ${user.soulProfile.currentGoal}
- Current Struggle: ${user.soulProfile.struggle}
- Decision Style: ${user.soulProfile.decisionStyle}
*INSTRUCTION*: Use this profile. If they fear '${user.soulProfile.deepestFear}', interpret the cards gently around that fear. If their goal is '${user.soulProfile.currentGoal}', relate the cards to that outcome.
`;
    }

    if (user.preferences) {
        const { style, skepticism, verbosity } = user.preferences;
        styleInstruction = `
*** AI PERSONA SETTINGS ***
- Archetype Style: ${style} (If 'Psychological', use Jungian terms. If 'Esoteric', use Magick/Astrology terms. If 'Balanced', mix both).
- Skepticism Level: ${skepticism} (If 'Analytical', be grounded. If 'Believer', be fully immersed).
- Verbosity: ${verbosity}.
`;
    }

    // 3. INJECT LONG-TERM MEMORY
    if (user.history && user.history.length > 0) {
        const pastReadings = user.history.slice(0, 3).map(h => 
            `- Date: ${new Date(h.date).toLocaleDateString()}. Q: "${h.question}". Summary: ${h.summary}`
        ).join("\n");
        
        userContext += `
\n*** LONG-TERM MEMORY (PAST READINGS) ***
The user has asked these questions recently:
${pastReadings}
*INSTRUCTION*: Look for patterns. If they keep asking about the same topic, mention it. Example: "I notice you are still concerned about [Topic]..." or "Unlike your last reading about [Topic]..."
`;
    }
  }

  const prompt = `
${userContext}
${styleInstruction}

*** CURRENT SESSION ***
User Question: "${question}"
Spread Type: ${spread.name}

Cards Drawn:
${cardDescriptions}

*** SYSTEM INSTRUCTIONS ***
You are Arcanum, an evolved AI Oracle.
1. **Synthesize**: Don't just list card meanings. Weave a narrative using the Soul Profile and History.
2. **Memory**: Explicitly reference their Soul Profile or Past Readings if relevant. (e.g., "This card challenges your fear of [Fear]...").
3. **Format**: Use Markdown. 
   - Start with "### The Vision". 
   - Then "### The Cards". 
   - End with "### The Guidance".
4. **Tone**: Empathetic, deep, profound.
`;

  let fullResponse = "";

  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a keeper of ancient wisdom and modern psychology.",
        temperature: 1.0, 
      },
    });

    for await (const chunk of response) {
        if (chunk.text) {
            fullResponse += chunk.text;
            onChunk(chunk.text);
        }
    }
    
    if (onComplete) onComplete(fullResponse);

  } catch (error) {
    console.error("Gemini API Error:", error);
    onChunk("\n\n*The spirits are clouded... (An error occurred while contacting the oracle).*");
  }
};