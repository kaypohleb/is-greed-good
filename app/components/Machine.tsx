"use client";
import Button from "@/components/Button";
import { BetResult } from "@/types";
import { getRollsToWin } from "@/utils/bonus";
import { WIN_COMBINATIONS, LOSS_COMBINATIONS } from "@/utils/yields";
import { useRef, useState } from "react";
import { usePlayStateContext } from "@/providers/PlayStateProvider";
import Window from "./Window";
import getWins from "@/utils/getWins";
import FillButton from "./FillButton";

const NUM_OF_ICONS = 10;
const ICON_HEIGHT = 72;
const TIME_PER_ICON = 25;

const Machine = ({
  machineNum,
  machineSettings,
  machineBetAmt,
  machineRolls,
  results,
  loyaltyStreaks,
  seed,
  debug,
  playBets,
  appendResult,
}: {
  machineNum: number;
  machineSettings: number[];
  machineBetAmt: number;
  machineRolls: number;
  results: BetResult[];
  loyaltyStreaks: number;
  seed: string;
  debug: string | boolean;
  playBets: (index: number, betAmt: number) => number | undefined;
  appendResult: (machineSel: number, result: number, betAmts: number) => void;
}) => {
  const reel1Ref = useRef<HTMLDivElement>(null);
  const reel2Ref = useRef<HTMLDivElement>(null);
  const reel3Ref = useRef<HTMLDivElement>(null);
  const [indexes, setIndexes] = useState([0, 0, 0]);
  const darkAgentIndex = [0, 2, 4, 6, 8];
  const lightAgentIndex = [1, 3, 5, 7, 9];
  const [rolling, setRolling] = useState(false);


  function getRandomWinTargets() {
    const winCombinations =
      WIN_COMBINATIONS[Math.floor(Math.random() * WIN_COMBINATIONS.length)];
    const winTargets = [0, 0, 0];
    winCombinations.forEach((win, i) => {
      win === 0
        ? (winTargets[i] =
            darkAgentIndex[Math.floor(Math.random() * darkAgentIndex.length)])
        : (winTargets[i] =
            lightAgentIndex[
              Math.floor(Math.random() * lightAgentIndex.length)
            ]);
    });
    return winTargets;
  }

  function getRandomLossTargets() {
    const lossCombinations =
      LOSS_COMBINATIONS[Math.floor(Math.random() * LOSS_COMBINATIONS.length)];
    const lossTargets = [0, 0, 0];
    lossCombinations.map((loss, i) => {
      loss === 0
        ? (lossTargets[i] =
            darkAgentIndex[Math.floor(Math.random() * darkAgentIndex.length)])
        : (lossTargets[i] =
            lightAgentIndex[
              Math.floor(Math.random() * lightAgentIndex.length)
            ]);
    });
    return lossTargets;
  }

  function roll(
    door: HTMLDivElement,
    offset = 0,
    target: number
  ): Promise<number> {
    const style = getComputedStyle(door);
    const backgroundPositionY = parseInt(style.backgroundPositionY);
    const currentIndex = backgroundPositionY / ICON_HEIGHT;
    const delta = target - currentIndex + (offset + 2) * NUM_OF_ICONS;
    //console.log("current", currentIndex, target, offset, delta);
    return new Promise((resolve, reject) => {
      // Target background position
      const targetBackgroundPositionY =
        backgroundPositionY + delta * ICON_HEIGHT;
      // Normalized background position, for reset
      const normTargetBackgroundPositionY =
        targetBackgroundPositionY % (NUM_OF_ICONS * ICON_HEIGHT);
      // console.log(
      //   "target",
      //   target,
      //   delta,
      //   targetBackgroundPositionY,
      //   normTargetBackgroundPositionY
      // );
      // Delay animation with timeout, for some reason a delay in the animation property causes stutter
      const currentRoll = setTimeout(() => {
        // Set transition properties ==> https://cubic-bezier.com/#.41,-0.01,.63,1.09

        door.style.transition = `background-position-y ${
          (9 + 1 * delta) * TIME_PER_ICON
        }ms cubic-bezier(.41,-0.01,.63,1.09)`;
        // Set background position
        door.style.backgroundPositionY = `${
          backgroundPositionY + delta * ICON_HEIGHT
        }px`;
      }, offset * 75);

      // After animation
      setTimeout(() => {
        // Reset position, so that it doesn't get higher without limit
        door.style.transition = `none`;
        door.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;
        // Resolve this promise
        resolve(delta % NUM_OF_ICONS);
      }, (9 + 1 * delta) * TIME_PER_ICON + offset * 75);
    });
  }

  function rollAll(result: number) {
    let targets = null;
    if (result < machineSettings[0]) {
      targets = getRandomWinTargets();
      //console.log("win", targets);
    } else {
      targets = getRandomLossTargets();
      //console.log("loss", targets);
    }

    const reelsList = [reel1Ref, reel2Ref, reel3Ref];

    // When all reels done animating (all promises solve)]
    Promise
      // Activate each reel, must convert NodeList to Array for this with spread operator
      .all(
        reelsList.map((reel, i) => {
          if (reel.current) {
            return roll(reel.current, i, targets[i]);
          }
          return 0;
        })
      )
      .then((deltas) => {
        // add up indexes
        const updatedIndexes = [...indexes];
        deltas.forEach(
          (delta, i) =>
            (updatedIndexes[i] = (updatedIndexes[i] + delta) % NUM_OF_ICONS)
        );
        setIndexes(updatedIndexes);
        //console.log(machineNum, indexes, targets, result, machineBetAmt);
        appendResult(machineNum, result, machineBetAmt);
        setRolling(false);
      });
  }

  return (
    <Window title={`Machine ${machineNum}`}>
      <div className="flex flex-col gap-2 items-center font-ms">
        <div className="relative flex w-[216px] bg-white border-2 border-black">
          <div ref={reel1Ref} className="reel"></div>
          <div ref={reel2Ref} className="reel"></div>
          <div ref={reel3Ref} className="reel"></div>
        </div>
        <div className="flex justify-between w-full">
        
          <FillButton
            disabled={rolling}
            onClick={() => {
              const result = playBets(machineNum, machineBetAmt);
              if (typeof result === "number") {
                rollAll(result);
              }
            }}
          >
            SPIN
          </FillButton>
          {/* TODO add a percentage verticle drag slider for setting amount*/}
          
        </div>
        
          
        <div className="font-arcade text-black text-[20px]">
          Machine {machineNum}
        </div>

        {/* <div className="flex flex-col gap-2 w-full items-center justify-center">
          <div>WINS to Bonus TOKENS</div>
          <div className="w-full text-center p-2 uppercase border-2 border-black bg-white">
            {getRollsToWin(
              machineSettings[1],
              machineSettings[0],
              getWins(results, machineSettings[0])
            ).nextWins - getWins(results, machineSettings[0])}
            : +
            {
              getRollsToWin(
                machineSettings[1],
                machineSettings[0],
                getWins(results, machineSettings[0])
              ).bonus
            }
          </div>
        </div> */}
        {debug ? (
          <div>Yield Probability: {(machineSettings[0] * 100).toFixed(2)}</div>
        ) : null}
        {debug ||
        results.some((result) => result.result < machineSettings[0]) ? (
          <div>Multiplier: {machineSettings[1]}</div>
        ) : null}
        {debug ? <div>Seed: {seed}</div> : null}
        {debug ? <div>Wins: {getWins(results, machineSettings[0])}</div> : null}
        <div className="flex flex-col gap-2 w-full items-center justify-center pb-4">
          <div>Number of Rolls: </div>
          <div className="font-arcade w-full text-center text-[32px]">
            {machineRolls}
          </div>
        </div>
        {/* <div className="flex flex-col gap-2 w-full items-center justify-center">
          <div>Loyalty</div>
          <div className="font-arcade w-full text-center text-[32px]">
            {loyaltyStreaks}
          </div>
        </div> */}

        <div className="flex flex-col gap-2 w-full items-center justify-center">
          <div>Your Win Rate:</div>
          <div className="font-arcade w-full text-center text-[32px]">
            {machineRolls !== 0
              ? (
                  (results.filter(
                    (result) => result.result < machineSettings[0]
                  ).length /
                    machineRolls) *
                  100
                ).toFixed(2) + "%"
              : 0}
          </div>
        </div>
      </div>
    </Window>
  );
};

Machine.displayName = "Machine";
export default Machine;
