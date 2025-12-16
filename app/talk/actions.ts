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
