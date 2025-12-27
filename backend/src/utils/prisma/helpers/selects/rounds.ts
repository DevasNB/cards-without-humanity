export const SelectedRounds = {
  select: {
    id: true,
    createdAt: true,
    endsAt: true,
    status: true,
    czar: {
      select: {
        id: true,
        user: { select: { id: true, user: true } },
        _count: { select: { winningRounds: true } },
      },
    },
    promptCard: true,
    picks: {
      select: {
        id: true,
        playerId: true,
        cardId: true,
        isWinner: true,
        answerCard: {
          select: {
            content: true,
          },
        },
      },
    },
    winner: {
      select: {
        id: true,
        user: {
          select: {
            id: true,
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    },
  },
  // TODO: Check if this is correct
  orderBy: { createdAt: "asc" },
  take: 1,
} as const;
