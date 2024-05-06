import { PROBALITIES_DECIMAL_PLACES, YIELD_MULTIPLIERS } from "../constants";
import seedrandom from "seedrandom";

export function genYieldMultiplier(generator: seedrandom.PRNG) {
  const randomYieldFromList = (generator() * (YIELD_MULTIPLIERS.length - 1 + 1)) << 0;
  return YIELD_MULTIPLIERS[randomYieldFromList];
}

export function genYieldProbabilities(generator: seedrandom.PRNG) {
  return generator();
}
