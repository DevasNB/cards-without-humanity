export const SelectedRounds = {
  select: {
    id: true,
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
  // TODO: Check if this is correct
  orderBy: { createdAt: "asc" },
  take: 1,
} as const;
