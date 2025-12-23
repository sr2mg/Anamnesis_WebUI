'use server';

import { GoogleGenAI } from '@google/genai';
import { anamnesis_doc } from '../personality-profiler/anamnesis_doc';
import { Message } from '../personality-profiler/types';

export async function chatWithCharacter(
    apiKey: string,
    history: Message[],
    characterProfile: string,
    userMessage: string
): Promise<string> {
    if (!apiKey) {
        throw new Error('API Key is required');
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `
${anamnesis_doc}

---
Character Profile:
${characterProfile}

---
You are acting as the character described above.
Respond to the user's input based on your personality, cognitive dynamics, and narrative identity defined in the profile.
Maintain the tone and behavioral patterns specified.
`;

    const contents = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));

    contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
    });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            config: {
                systemInstruction: systemPrompt,
            },
            contents: contents,
        });

        return response.text || "...";
    } catch (error) {
        console.error('Talk API Error:', error);
        throw new Error('Failed to generate response.');
    }
}

interface CharacterInput {
    name: string;
    profile: string;
}

export async function generateGroupConversation(
    apiKey: string,
    characters: CharacterInput[],
    situation: string,
    theme: string
): Promise<string> {
    if (!apiKey) {
        throw new Error('API Key is required');
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format character profiles for the prompt
    const charactersPrompt = characters.map(c => `
[[CHARACTER: ${c.name}]]
${c.profile}
`).join('\n\n');

    const systemPrompt = `
${anamnesis_doc}

You are a scriptwriter for a psychological drama.
Your task is to generate a dialogue between multiple characters based on their detailed psychological profiles.

---
${charactersPrompt}

---
SITUATION: ${situation}
THEME: ${theme}

---
INSTRUCTIONS:
1. Generate a dialogue script involving the characters listed above.
2. Adhere strictly to each character's "Deep Personality Architecture" (Cognitive Dynamics, Narrative Identity, Behavioral Patterns).
3. The conversation should feel organic, tense, or harmonious depending on the synergy between their personalities.
4. Use the following format for the script:
   **Character Name**: "Dialogue..."
   (Action/Internal state if necessary)

5. Aim for a "Digital Clinical Brutalism" vibe if applicable, or simply high-fidelity psychological realism.
6. The output should be ONLY the dialogue script in Markdown format.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            config: {
                systemInstruction: systemPrompt,
            },
            contents: [{
                role: 'user',
                parts: [{ text: `Generate the conversation between ${characters.map(c => c.name).join(' and ')}.` }]
            }],
        });

        return response.text || "...";
    } catch (error) {
        console.error('Group Talk API Error:', error);
        throw new Error('Failed to generate group conversation.');
    }
}

