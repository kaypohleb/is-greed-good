import { MiniState } from "@/types";

export const initializeMiniState = (
  userId: string,
  difficulty: string,
  game: string,
  mode: string
): MiniState => {
  const dateTime = new Date();
  const dt =
    dateTime.getDate().toString() +
    dateTime.getMonth().toString() +
    dateTime.getFullYear().toString() +
    (mode !== "DAILY")
      ? dateTime.getHours().toString() +
        dateTime.getMinutes().toString() +
        dateTime.getSeconds().toString()
      : "";

  return {
    id: userId,
    game: game,
    mode: mode,
    currentBet: 1,
    difficulty: difficulty,
    date: dt,
    updated: dateTime.toISOString(),
    state: 0,
    currentMult: 1,
    format: "",
  };
};
