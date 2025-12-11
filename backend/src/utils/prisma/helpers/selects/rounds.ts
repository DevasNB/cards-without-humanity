export const SelectedRounds = {
  select: {
    id: true,
    roundNumber: true,
    status: true,
    czar: {
      select: {
        id: true,
        user: { select: { id: true, user: true } },
        _count: { select: { winningRounds: true } },
      },
    },
    promptCard: true,
    picks: true,
  },
  orderBy: { roundNumber: "asc" },
  take: 1,
} as const;
