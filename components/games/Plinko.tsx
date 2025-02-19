import { DIFFICULTY_LEVELS } from "@/constants";
import { MiniState } from "@/types";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import ExitIcon from "@assets/images/exit_icon.png";
import BigNumber from "bignumber.js";
import seedrandom from "seedrandom";

const PYRAMID_ROWS = 9;
const DIFFICULTY_MULT = [
  [20, 5, 1.5, 0.4, 0, 0.4, 1.5, 5, 20],
  [40, 10, 0.4, 0.2, 0, 0.2, 0.4, 10, 40],
  [80, 20, 0.6, 0, 0, 0, 0.6, 20, 80],
  [250, 0.6, 0.4, 0, 0, 0, 0.4, 0.6, 250],
];
export default function Plinko({
  miniState,
  updateMiniGamePlayState,
}: {
  miniState: MiniState;
  updateMiniGamePlayState: (state: MiniState) => void;
}) {
  const difficultyIndex = useMemo(() => {
    return DIFFICULTY_LEVELS.indexOf(miniState.difficulty);
  }, [miniState.difficulty]);

  const [currentMultiplier, setCurrentMultiplier] = useState<number>(
    miniState.currentMult
  );

  const [pyramid, setPyramid] = useState(initializePyramid());
  const [dropping, setDropping] = useState(false);
  const initFormat = miniState.format ? parseInt(miniState.format) : 0;
  const [ballsRolled, setBallsRolled] = useState(initFormat);
  const [gameState, setGameState] = useState(miniState.state);

  function initializePyramid() {
    let pyramid = [];
    for (let i = 0; i < PYRAMID_ROWS; i++) {
      for (let j = 0; j < i + 1; j++) {
        pyramid.push(0);
      }
    }
    pyramid[0] = 1;
    return pyramid;
  }

  function findRowAndPosition(index: number) {
    let row = 0;
    let position = 0;
    row = Math.floor((Math.sqrt((PYRAMID_ROWS - 1) * index + 1) - 1) / 2);
    position = index - Math.floor((row * (row + 1)) / 2);
    return [row, position];
  }

  function getNextIndexes(index: number) {
    const [row, position] = findRowAndPosition(index);
    // Calculate the indices of the next possible pegs in the row below
    const left_path = index + row + 1;
    const right_path = index + row + 2;
    if (left_path >= pyramid.length || right_path >= pyramid.length) {
      return [-1, -1];
    }
    return [left_path, right_path];
  }

  function resetPlinko() {
    setPyramid(initializePyramid());
  }

  async function dropPlinko() {
    if (dropping || gameState == 2) return;
    let updatedGameState = 1;
    resetPlinko();
    setDropping(true);
    const updatedBallRolled = ballsRolled + 1;
    setBallsRolled(updatedBallRolled);
    async function dropPlinkoRow(idx: number): Promise<number> {
      const [left_path, right_path] = getNextIndexes(idx);
      let next_index = -1;
      if (left_path === -1 || right_path === -1) {
        return -1;
      }
      const updatedRNG = seedrandom(
        miniState.date + miniState.id + idx + updatedBallRolled.toString()
      );
      const rand = updatedRNG();
      if (rand < 0.5) {
        next_index = left_path;
      } else {
        next_index = right_path;
      }

      console.log("Next indexes: ", [left_path, right_path]);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(next_index);
        }, 200);
      });
    }

    let index = 0;
    for (let i = 0; i < PYRAMID_ROWS - 1; i++) {
      await dropPlinkoRow(index).then((nextIndex) => {
        console.log(index, nextIndex, pyramid.length);
        if (nextIndex >= pyramid.length || nextIndex < 0) {
          console.log("Next index out of pyramid bounds", nextIndex);
        }
        pyramid[index] = 0;
        pyramid[nextIndex] = 1;
        setPyramid([...pyramid]);
        index = nextIndex;
      });
    }
    // Calculate the final multiplier
    const [row, position] = findRowAndPosition(index);
    const currentBigMultiplier = new BigNumber(currentMultiplier);
    const newMultiplier = currentBigMultiplier.times(
      new BigNumber(DIFFICULTY_MULT[difficultyIndex][position])
    );
    if (newMultiplier.toNumber() < 0) {
      updatedGameState = 2;
    } else {
      updatedGameState = 1;
    }

    updateMiniGamePlayState({
      ...miniState,
      currentMult: newMultiplier.toNumber() < 0 ? 0 : newMultiplier.toNumber(),
      state: updatedGameState,
      format: updatedBallRolled.toString(),
    });
    setCurrentMultiplier(
      newMultiplier.toNumber() < 0 ? 0 : newMultiplier.toNumber()
    );
    setDropping(false);
  }

  function stop() {
    setGameState(2);
    updateMiniGamePlayState({
      ...miniState,
      state: 2,
    });
  }

  useEffect(()=>{
    if(gameState == 1 && currentMultiplier === 0){
      stop();
    }
  })

  return (
    <div>
      <h1>Plinko</h1>
      <div>Current Mult: </div>
      <div>{currentMultiplier}</div>
      <div className="flex flex-col items-center gap-2 p-2 border border-black">
        <div className="flex flex-row gap-4">
          <Image
            className={`w-4 h-4 ${pyramid[0] === 0 ? "opacity-30" : ""}`}
            src={ExitIcon}
            alt="Plinko_slot"
          />
        </div>
        <div className="flex flex-row gap-4">
          {pyramid.slice(1, 3).map((peg, index) => (
            <Image
              key={`peg-1-${index}`}
              className={`w-4 h-4 ${peg === 0 ? "opacity-30" : ""}`}
              src={ExitIcon}
              alt="Plinko_slot"
            />
          ))}
        </div>
        <div className="flex flex-row gap-4">
          {pyramid.slice(3, 6).map((peg, index) => (
            <Image
              key={`peg-2-${index}`}
              className={`w-4 h-4 ${peg === 0 ? "opacity-30" : ""}`}
              src={ExitIcon}
              alt="Plinko_slot"
            />
          ))}
        </div>
        <div className="flex flex-row gap-4">
          {pyramid.slice(6, 10).map((peg, index) => (
            <Image
              key={`peg-3-${index}`}
              className={`w-4 h-4 ${peg === 0 ? "opacity-30" : ""}`}
              src={ExitIcon}
              alt="Plinko_slot"
            />
          ))}
        </div>
        <div className="flex flex-row gap-4">
          {pyramid.slice(10, 15).map((peg, index) => (
            <Image
              key={`peg-3-${index}`}
              className={`w-4 h-4 ${peg === 0 ? "opacity-30" : ""}`}
              src={ExitIcon}
              alt="Plinko_slot"
            />
          ))}
        </div>
        <div className="flex flex-row gap-4">
          {pyramid.slice(15, 21).map((peg, index) => (
            <Image
              key={`peg-5-${index}`}
              className={`w-4 h-4 ${peg === 0 ? "opacity-30" : ""}`}
              src={ExitIcon}
              alt="Plinko_slot"
            />
          ))}
        </div>
        <div className="flex flex-row gap-4">
          {pyramid.slice(21, 28).map((peg, index) => (
            <Image
              key={`peg-6-${index}`}
              className={`w-4 h-4 ${peg === 0 ? "opacity-30" : ""}`}
              src={ExitIcon}
              alt="Plinko_slot"
            />
          ))}
        </div>
        <div className="flex flex-row gap-4">
          {pyramid.slice(28, 36).map((peg, index) => (
            <Image
              key={`peg-7-${index}`}
              className={`w-4 h-4 ${peg === 0 ? "opacity-30" : ""}`}
              src={ExitIcon}
              alt="Plinko_slot"
            />
          ))}
        </div>
        <div className="flex flex-row gap-4">
          {pyramid.slice(36).map((peg, index) => (
            <Image
              key={`peg-8-${index}`}
              className={`w-4 h-4 ${peg === 0 ? "opacity-30" : ""}`}
              src={ExitIcon}
              alt="Plinko_slot"
            />
          ))}
        </div>
        <div className="flex flex-row gap-4">
          {DIFFICULTY_MULT[difficultyIndex].map((mult, index) => (
            <div
              key={`mult-r-${index}`}
              className={`text-[10px] w-4 text-center font-DOS ${
                mult === 0 ? "text-red-500" : ""
              }`}
            >
              {mult}x
            </div>
          ))}
        </div>
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
        onClick={() => {
          dropPlinko();
        }}
      >
        Drop Plinko Chip
      </button>
    </div>
  );
}
