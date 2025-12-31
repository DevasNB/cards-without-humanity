export interface DeckResponse {
  id: string;
}

export interface ListedDeck {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  totalCards: number;
  promptCards: SimplifiedPromptCard[];
  answerCards: SimplifiedAnswerCard[];
}

export interface SimplifiedPromptCard {
  id: string;
  content: string;
  totalBlankAnswers: number;
}

export interface SimplifiedAnswerCard {
  id: string;
  content: string;
}
