import { MiniState } from "@/types";

export const initializeMiniState = (userId: string, difficulty: string, game: string): MiniState => {
  const dateTime = new Date();
  const dt =
    dateTime.getDate().toString() +
    dateTime.getMonth().toString() +
    dateTime.getFullYear().toString();

  return {
    id: userId,
    game: game,
    difficulty: difficulty,
    date: dt,
    updated: dateTime.toISOString(),
    state: 0,
    currentMult: 1,
    format: "",
  };
};
