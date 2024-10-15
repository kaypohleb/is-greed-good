import seedrandom from "seedrandom";
import { genYieldMultiplier, genYieldProbabilities } from "./yields";
import { MACHINE_NUMBER, MINIGAMES } from "@/constants";
import { PlayState } from "@/types";

export const initializePlayState = (
  userId: string,
  difficulty: string
): PlayState => {
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
  const randomMiniGame = MINIGAMES[Math.floor(rand() * MINIGAMES.length)];

  return {
    id: userId,
    userPhase: 0,
    difficulty: difficulty,
    userAmt: 100,
    totalRolls: 0,
    date: dt,
    updated: dateTime.toISOString(),
    betAmts: [...Array(MACHINE_NUMBER)].map(() => {
      return 1;
    }),
    loyaltyStreaks: [...Array(MACHINE_NUMBER)].map(() => {
      return 0;
    }),
    machineSelected: 0,
    machineSettings: freshSettings,
    machineSeeds: freshSeeds,
    machineRolls: [...Array(MACHINE_NUMBER)].map(() => 0),
    betResults: [...Array(MACHINE_NUMBER)].map(() => []),
    luckiestStreak: [],
    curMiniGame: {
      id: userId,
      game: randomMiniGame,
      difficulty: difficulty,
      date: dt,
      updated: dateTime.toISOString(),
      state: 0,
      currentMult: 1,
      format: "",
    },
  };
};
