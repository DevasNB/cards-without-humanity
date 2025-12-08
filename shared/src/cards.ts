export interface DeckResponse {
    id: string;
}

export interface PromptCard {
    id: string;
    text: string;
    pick: number;
}

export interface AnswerCard {
    id: string;
    text: string;
}