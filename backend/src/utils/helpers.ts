export function shuffle<T>(newArray: T[]): T[] {
  const array = [...newArray];
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export function fisherYatesShuffle<T>(needed: number, answerCards: T[]): T[] {
  const chosenIds = [];

  const pool = [...answerCards]; // shallow copy

  for (let i = 0; i < needed; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    chosenIds.push(pool[idx]);
    pool.splice(idx, 1);
  }

  return chosenIds;
}

export function randomElement<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)];
}
