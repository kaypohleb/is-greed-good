"use client";
import { DIFFICULTY_LEVELS } from "@/constants";
//base win rate = 1.1 increase by 0.1 for each successful clear
//if hit mine lose all money bet
//choose when to stop
// bonus 0.5 for every star found (max 5)
//if clear all buckets except mines  get bonus

import { MiniState, PlayState } from "@/types";
import BigNumber from "bignumber.js";
import Image from "next/image";
import { useEffect, useState } from "react";
import seedrandom from "seedrandom";
import StarImage from "@assets/images/Star-1.png";
import { set } from "animejs";

//game constants
const HEIST_NUM_ROWS = 4;
const HEIST_NUM_COLS = 4;
const HEIST_BASE_MULTIPLIER = 1.0;

//difficulty-based constants
const HEIST_NUM_MINES = [2, 3, 4, 5];
const HEIST_NUM_STARS = [1, 3, 4, 5];
const HEIST_MULTIPLIER_INCREMENT = [0.1, 0.2, 0.3, 0.4];
const HEIST_BONUS = [0.5, 1, 1.5, 2, 2.5];
const HEIST_MAX_BONUS = [5, 10, 15, 50, 100];

export function Heist({
  miniState,
  updateMiniGamePlayState,
}: {
  miniState: MiniState;
  updateMiniGamePlayState: (newState: MiniState) => void;
}) {
  const rand = seedrandom(miniState.date + miniState.id);
  const [currentMiniGameState, setCurrentMiniGameState] =
    useState<MiniState>(miniState);
  const [grid, setGrid] = useState<number[][]>(
    currentMiniGameState.format === ""
      ? initializeMineGrid()
      : parseGridString(currentMiniGameState.format)
  );
  const gridCSS = `grid grid-cols-4 grid-rows-4 gap-1`;

  //0 = empty, 1 = thief, 2 = coin (+3 to any = collected)
  function initializeMineGrid() {
    console.log("initializeMineGrid");
    let grid = [];
    for (let i = 0; i < HEIST_NUM_ROWS; i++) {
      let row = [];
      for (let j = 0; j < HEIST_NUM_COLS; j++) {
        row.push(0);
      }
      grid.push(row);
    }
    //make a array of availble position in (x,y) format
    let availablePos = [];
    for (let i = 0; i < HEIST_NUM_ROWS; i++) {
      for (let j = 0; j < HEIST_NUM_COLS; j++) {
        availablePos.push([i, j]);
      }
    }
    let minesPlaced = 0;
    const difficultyIndex = DIFFICULTY_LEVELS.indexOf(miniState.difficulty);
    while (minesPlaced < HEIST_NUM_MINES[difficultyIndex]) {
      let pos = availablePos[Math.floor(rand() * availablePos.length)];
      grid[pos[0]][pos[1]] = 1;
      minesPlaced++;
    }
    let starPlaced = 0;
    while (starPlaced < HEIST_NUM_STARS[difficultyIndex]) {
      let pos = availablePos[Math.floor(rand() * availablePos.length)];
      grid[pos[0]][pos[1]] = 2;
      starPlaced++;
    }
    const updatedMiniGame: MiniState = {
      ...currentMiniGameState,
      format: gridToString(grid),
      updated: new Date().toISOString(),
    };
    //force update to playstate
    setCurrentMiniGameState(updatedMiniGame);
    return grid;
  }

  function parseGridString(gridString: string) {
    let grid = [];
    for (let i = 0; i < HEIST_NUM_ROWS; i++) {
      let row = [];
      for (let j = 0; j < HEIST_NUM_COLS; j++) {
        row.push(parseInt(gridString[i * HEIST_NUM_COLS + j]));
      }
      grid.push(row);
    }
    return grid;
  }

  function gridToString(grid: number[][]) {
    return grid.map((row) => row.join("")).join("");
  }

  function selectBox(row: number, col: number) {
    if (currentMiniGameState.state === 2) return;
    let updatedState = currentMiniGameState.state;
    let updatedMult = currentMiniGameState.currentMult;
    if (grid[row][col] >= 3) return;
    if (grid[row][col] === 1) {
      // thief
      updatedMult = 0;
      updatedState = 2;
    } else if (grid[row][col] === 2) {
      // star
      const updatedBigNumber = new BigNumber(updatedMult);
      updatedMult = updatedBigNumber
        .plus(HEIST_BONUS[DIFFICULTY_LEVELS.indexOf(miniState.difficulty)])
        .toNumber();
    } else {
      // empty
      const updatedBigNumber = new BigNumber(updatedMult);
      updatedMult = updatedBigNumber
        .plus(
          HEIST_MULTIPLIER_INCREMENT[
            DIFFICULTY_LEVELS.indexOf(miniState.difficulty)
          ]
        )
        .toNumber();
    }
    grid[row][col] += 3;
    console.log(updatedMult);
    setGrid([...grid]);
    const gridString = gridToString(grid);
    const updatedMiniGame: MiniState = {
      ...currentMiniGameState,
      state: updatedState,
      currentMult: updatedMult,
      format: gridString,
    };
    setCurrentMiniGameState(updatedMiniGame);
    //force update to playstate
    updateMiniGamePlayState(updatedMiniGame);
  }

  useEffect(() => {
    //check if all non-thief cells are collected
    if (grid.map((row) => row.every((cell) => cell >= 3)).every((val) => val)) {
      let updatedMiniGame: MiniState = {
        ...currentMiniGameState,
        state: 2,
        currentMult:
          currentMiniGameState.currentMult +
          HEIST_MAX_BONUS[DIFFICULTY_LEVELS.indexOf(miniState.difficulty)],
      };
      updateMiniGamePlayState(updatedMiniGame);
    }
  }, [
    currentMiniGameState,
    grid,
    miniState.difficulty,
    updateMiniGamePlayState,
  ]);

  useEffect(() => {
    //update playstate if mismatch with curMiniGame
    if (miniState.format !== gridToString(grid)) {
      const updatedMiniGame: MiniState = {
        ...currentMiniGameState,
        format: gridToString(grid),
        updated: new Date().toISOString(),
      };
      updateMiniGamePlayState(updatedMiniGame);
    }
  }, [miniState.format, grid, currentMiniGameState, updateMiniGamePlayState]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-fit">
      <div>Heist</div>
      <div>Current Multiplier : {currentMiniGameState.currentMult}</div>
      <div className="flex">
        <Image
          src={StarImage}
          alt="StarImage"
          height={36}
          className="m-[12px]"
        />
        <span>= BONUS</span>
      </div>
      <div>Thief = Game Over</div>
      <div className={gridCSS}>
        {[...Array(HEIST_NUM_ROWS)].map((_, row) => {
          return [...Array(HEIST_NUM_COLS)].map((_, col) => {
            return (
              <div
                key={`${row}-${col}`}
                onClick={() => selectBox(row, col)}
                className="border-2 border-black  h-12 w-12 flex items-center justify-center rounded-sm"
              >
                {grid[row][col] >= 3
                  ? "F"
                  : grid[row][col] === 1
                  ? "T"
                  : grid[row][col] === 2
                  ? "S"
                  : ""}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}
