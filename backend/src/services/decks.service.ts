import prisma from "../utils/prisma";
import { ListedDeck } from "../types/decks";
export class DecksService {
  /**
   * Lists all Decks in the database.
   * @returns A promise that resolves to an array of all decks in the database.
   */
  public async listDecks(): Promise<ListedDeck[]> {
    const decks = await prisma.deck.findMany({
      where: {
        isPublic: true,
      },
      select: {
        id: true,
        name: true,
        isPublic: true,
        description: true,
        promptCards: {
          select: {
            id: true,
            content: true,
            pick: true,
          },
        },
        answerCards: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    });

    // Map the decks to a response
    const DecksListResponse: ListedDeck[] = decks.map((deck) => ({
      id: deck.id,
      name: deck.name,
      description: deck.description ?? "",
      isPublic: deck.isPublic,
      totalCards: deck.promptCards.length + deck.answerCards.length,
      promptCards: deck.promptCards.map((promptCard) => ({
        id: promptCard.id,
        content: promptCard.content,
        totalBlankAnswers: promptCard.pick,
      })),
      answerCards: deck.answerCards.map((answerCard) => ({
        id: answerCard.id,
        content: answerCard.content,
      })),
    }));
    console.log(DecksListResponse);
    return DecksListResponse;
  }
}
