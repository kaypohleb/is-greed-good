import seedrandom from "seedrandom";
import { genYieldMultiplier, genYieldProbabilities } from "./yields";
import { ALLOWED_BET_AMOUNTS, MACHINE_NUMBER } from "@/constants";
import { PlayState } from "@/types";

export const initializePlayState = (userId: string): PlayState => {
  const dateTime = new Date();
  const dt =
    dateTime.getDate().toString() +
    dateTime.getMonth().toString() +
    dateTime.getFullYear().toString();
  const rand = seedrandom(dt);
  const randPos = seedrandom(dt + userId);
  const freshSettings: number[][] = [...Array(MACHINE_NUMBER)]
    .map(() => {
      const multiplier = genYieldMultiplier(rand);
      const probability = genYieldProbabilities(rand, multiplier);
      return [probability, multiplier];
    })
    .sort(() => randPos() - 0.5);
  const freshSeeds: string[] = [...Array(MACHINE_NUMBER)].map((_, idx) => {
    return (
      dt +
      (freshSettings[idx][0] * 100).toFixed(0) +
      freshSettings[idx][1].toString() +
      0
    );
  });

  return {
    id: userId,
    userPhase: 0,
    userAmt: 1000,
    date: "",
    updated: "",
    betAmts: [...Array(MACHINE_NUMBER)].map(() => {
      return ALLOWED_BET_AMOUNTS[0];
    }),
    loyaltyStreaks: [...Array(MACHINE_NUMBER)].map(() => {
      return 0;
    }),
    machineSelected: 0,
    machineSettings: freshSettings,
    machineSeeds: freshSeeds,
    machineRolls: [...Array(MACHINE_NUMBER)].map(() => 0),
    betResults: [...Array(MACHINE_NUMBER)].map(() => []),
    greedStreak: [],
    luckiestStreak: [],
  };
};
