const STARTING_BONUS_CLAIM_BASE = 2;
export function getRollsToWin(
  multiplier: number,
  probability: number,
  currentWins: number
): {
  nextWins: number;
  bonus: number;
} {
  let nextWins = 0;
  if (currentWins < Math.pow(STARTING_BONUS_CLAIM_BASE, 3)) {
    nextWins = Math.pow(STARTING_BONUS_CLAIM_BASE, 3);
  } else {
    nextWins = Math.pow(Math.floor(Math.cbrt(currentWins)) + 1, 3);
  }
  //console.log(probability * multiplier * multiplier);
  const avgRollsRequired = 1 / (probability * multiplier);
  const bonus = Math.floor(avgRollsRequired * nextWins * (0.5 - probability));
  return { nextWins, bonus };
}
