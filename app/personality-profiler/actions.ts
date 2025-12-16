'use server';

import { GoogleGenAI } from '@google/genai';
import { INTERVIEWER_SYSTEM_PROMPT, GENERATOR_SYSTEM_PROMPT } from './prompts';
import { Message } from './types';
import { anamnesis_doc } from './anamnesis_doc';
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// We won't store the API key on the server in a real env variable for this user-centric approach if they want to pass it in.
// However, the `GoogleGenAI` client needs to be initialized with it.
// The user plan says "API Key will be managed via local storage".
// Server Actions cannot read LocalStorage directly. The client must pass the key.


const responseSchema = z.object({
  analysis: z.string().describe("Internal psychological analysis of the user's input, hypothesis testing, and strategy formulation."),
  reply: z.string().describe("The direct response to the user, acting as the interviewer."),
  is_finished: z.union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'string') {
        return val.trim().toLowerCase() === 'true';
      }
      return val;
    })
    .describe("Set to true when the interview is finished.")
});

export async function continueInterview(
  apiKey: string,
  history: Message[],
  latestUserMessage: string
): Promise<{ analysis: string; reply: string }> {
  if (!apiKey) {
    throw new Error('API Key is required');
  }

  const ai = new GoogleGenAI({ apiKey });

  // Format history for Gemini
  // Gemini expects: { role: 'user' | 'model', parts: [{ text: string }] }
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  // Add the latest user message
  contents.push({
    role: 'user',
    parts: [{ text: latestUserMessage }]
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro', // Using the user-specified model
      config: {
        systemInstruction: INTERVIEWER_SYSTEM_PROMPT(anamnesis_doc),
        responseMimeType: "application/json",
        responseJsonSchema: zodToJsonSchema(responseSchema as any),
      },
      contents: contents,
    });

    const text = response.text;
    if (!text) return { analysis: "", reply: "I'm having trouble thinking of a response. Please try again." };

    try {
      const parsed = responseSchema.parse(JSON.parse(text));
      return { analysis: parsed.analysis, reply: parsed.reply };
    } catch (e) {
      console.error("JSON Parse Error:", e);
      return { analysis: "", reply: text || "Error parsing response." };
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate response from Gemini.');
  }
}

export async function generateFinalProfile(
  apiKey: string,
  history: Message[]
): Promise<string> {
  if (!apiKey) {
    throw new Error('API Key is required');
  }

  const ai = new GoogleGenAI({ apiKey });

  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  // Add a final strict instruction to generate the profile now
  contents.push({
    role: 'user',
    parts: [{ text: "アーキテクチャプロフィールをいままでの会話から作って下さい" }]
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      config: {
        systemInstruction: GENERATOR_SYSTEM_PROMPT(anamnesis_doc),
      },
      contents: contents,
    });

    const text = response.text;
    return text || "Failed to generate profile.";
  } catch (error) {
    console.error('Profile Generation Error:', error);
    throw new Error('Failed to generate final profile.');
  }
}
