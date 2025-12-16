export interface Message {
  role: 'user' | 'model';
  content: string;
  analysis?: string; // Hidden thought process
}

export interface SessionMetadata {
  id: string;
  name: string;
  roughProfile: string;
  updatedAt: number;
}

export interface SavedState extends SessionMetadata {
  apiKey: string;
  messages: Message[];
  step: 'SETUP' | 'INTERVIEW' | 'RESULT';
}

export interface InterviewState {
  messages: Message[];
  isComplete: boolean;
  roughProfile: string;
  characterName: string;
}

export interface ProfileData {
  markdown: string;
}
