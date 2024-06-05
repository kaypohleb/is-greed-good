import seedrandom from "seedrandom";

export const YIELD_MULTIPLIERS = [2, 3, 4, 5, 10];
export const YIELD_MULTIPLIERS_PROBABILITIES: { [key: string]: number } = {
  2: 0.45,
  3: 0.3,
  4: 0.225,
  5: 0.18,
  10: 0.09,
};
export const PROBALITIES_DECIMAL_PLACES = 2;
const YIELD_VARIANCE = 2 / 3;
const AVG_YIELD_VARIANCE = 5 / 6;

export const WIN_COMBINATIONS = [
  [0, 0, 0],
  [1, 1, 1],
];

export const LOSS_COMBINATIONS = [
  [0, 1, 0],
  [0, 0, 1],
  [1, 0, 0],
  [1, 1, 0],
  [0, 1, 1],
  [1, 0, 1],
];

function getAverageYieldProbabilities(probabilities: {
  [key: string]: number;
}): {
  [key: string]: number;
} {
  const probabilitiesCopy = { ...probabilities };
  Object.keys(probabilitiesCopy).forEach((multiplier) => {
    const avg =
      YIELD_MULTIPLIERS_PROBABILITIES[multiplier] * AVG_YIELD_VARIANCE;
    probabilitiesCopy[multiplier] = avg;
  });
  return probabilitiesCopy;
}

//get average yield probabilities between min and max
export const AVERAGE_YIELD_PROBABILITIES = getAverageYieldProbabilities(
  YIELD_MULTIPLIERS_PROBABILITIES
);

export function yieldCalculator(multiplier: number, probability: number) {
  return multiplier * probability;
}

export function genYieldMultiplier(generator: seedrandom.PRNG) {
  const randomYieldFromList =
    (generator() * (YIELD_MULTIPLIERS.length - 1 + 1)) << 0;
  return YIELD_MULTIPLIERS[randomYieldFromList];
}

export function genYieldProbabilities(
  generator: seedrandom.PRNG,
  multiplier: number
) {
  const rng = generator();
  const max = YIELD_MULTIPLIERS_PROBABILITIES[multiplier.toString()];
  const min = max * YIELD_VARIANCE;
  return min + rng * (max - min);
}
