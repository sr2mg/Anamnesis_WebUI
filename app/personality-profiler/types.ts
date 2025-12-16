export interface Message {
  role: 'user' | 'model';
  content: string;
  analysis?: string; // Hidden thought process
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
