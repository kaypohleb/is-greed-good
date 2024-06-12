import { BetResult } from "@/types";

const getWins = (betResults: BetResult[], threshold: number) => {
  return betResults.filter((result) => result.result < threshold).length;
};

export default getWins;
