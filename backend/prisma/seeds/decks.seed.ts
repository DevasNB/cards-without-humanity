// prisma/seed/deck.seed.ts
import { PrismaClient } from "@prisma/client";

export async function seedDecks(prisma: PrismaClient): Promise<any[]> {
  console.log("Seeding decks and cards...");

  // --- Create Base Game Deck ---
  const baseDeck = await prisma.deck.create({
    data: {
      isPublic: true,
      name: "Base Game",
      promptCards: {
        create: [
          { content: "What is my secret power?", pick: 1 },
          { content: "I got 99 problems but ____ ain't one.", pick: 1 },
          { content: "What ended my last relationship?", pick: 1 },
          { content: "What makes life worth living?", pick: 1 },
          { content: "That's a cute baby, but it's no ____.", pick: 1 },
          { content: "What's the best way to get over a breakup?", pick: 1 },
          { content: "My love life is best described as ____.", pick: 1 },
          { content: "What is Batman's guilty pleasure?", pick: 1 },
          { content: "What is the most uncomfortable thing to wear?", pick: 1 },
          { content: "I drink to forget ____.", pick: 1 },
          {
            content: "In the new Disney movie, Elsa falls in love with ____.",
            pick: 1,
          },
          {
            content: "What's the secret to a long and happy marriage?",
            pick: 1,
          },
          { content: "Why did the chicken cross the road?", pick: 1 },
          { content: "What did I bring back from my trip to Vegas?", pick: 2 }, // Example of a pick 2 card
        ],
      },
      answerCards: {
        create: [
          { content: "A tiny horse." },
          { content: "The patriarchy." },
          { content: "My crippling debt." },
          { content: "Being fat and happy." },
          { content: "A bag of meth." },
          { content: "Shoving a pineapple up your butt." },
          { content: "An army of ninjas." },
          { content: "Two midgets and a bucket." },
          { content: "The ghost of my ex." },
          { content: "A healthy relationship with my mother." },
          { content: "A sense of impending doom." },
          { content: "Farting so loud you wake up the neighbors." },
          { content: "The sweet embrace of death." },
          { content: "A literal mountain of cocaine." },
          { content: "The inexplicable feeling of joy." },
          { content: "A bucket of fried chicken." },
          { content: "Losing my virginity." },
          { content: "My imaginary girlfriend." },
          { content: "A commitment to never growing up." },
          { content: "A sex change operation." },
          { content: "A time-traveling wizard." },
          { content: "My surprisingly small penis." },
        ],
      },
    },
  });

  console.log(`Created deck: ${baseDeck.name} with cards.`);

  // --- Create another simple deck for variety (optional) ---
  const memesDeck = await prisma.deck.create({
    data: {
      isPublic: true,
      name: "Fresh Memes Expansion",
      promptCards: {
        create: [
          { content: "Doge is famous for ____.", pick: 1 },
          { content: "My favorite reaction GIF is ____.", pick: 1 },
        ],
      },
      answerCards: {
        create: [
          { content: "Much wow, very meme." },
          { content: "A crying Jordan face." },
          { content: "A distressed unga bunga." },
          { content: "That one with the distracted boyfriend." },
        ],
      },
    },
  });

  console.log(`Created deck: ${memesDeck.name} with cards.`);

  return [baseDeck, memesDeck];
}
