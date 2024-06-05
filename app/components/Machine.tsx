"use client";
import Button from "@/components/Button";
import { getRollsToWin } from "@/utils/bonus";
import { WIN_COMBINATIONS, LOSS_COMBINATIONS } from "@/utils/yields";
import { set } from "animejs";
import { useRef, useState } from "react";

export default function Machine({
  machineNum,
  machineSettings,
  machineBetAmt,
  machineRolls,
  machineMultKnown,
  results,
  loyaltyStreaks,
  seed,
  debug,
  decreaseBetAmt,
  increaseBetAmt,
  setMachineSelected,
  playBets,
  appendResult,
  getWins,
}: {
  machineNum: number;
  machineSettings: number[];
  machineBetAmt: number;
  machineRolls: number;
  machineMultKnown: boolean;
  results: number[];
  loyaltyStreaks: number;
  seed: string;
  debug: string | boolean;
  decreaseBetAmt: (index: number) => void;
  increaseBetAmt: (index: number) => void;
  setMachineSelected: (index: number) => void;
  playBets: (index: number, betAmt: number) => number | undefined;
  appendResult: (machineSel: number, result: number, betAmts: number) => void;
  getWins: (index: number) => number;
}) {
  const numIcons = 10;
  const icon_height = 48;
  const time_per_icon = 100;
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
    target: number | null = null
  ): Promise<number> {
    let delta = (offset + 2) * numIcons + Math.floor(Math.random() * numIcons);
    const style = getComputedStyle(door);
    const backgroundPositionY = parseInt(style.backgroundPositionY);
    if (target) {
      const currentIndex = backgroundPositionY / icon_height;
      delta = target - currentIndex + (offset + 2) * numIcons;
    }
    return new Promise((resolve, reject) => {
      // Target background position
      const targetBackgroundPositionY =
        backgroundPositionY + delta * icon_height;
      // Normalized background position, for reset
      const normTargetBackgroundPositionY =
        targetBackgroundPositionY % (numIcons * icon_height);
      console.log(
        "target",
        target,
        delta,
        targetBackgroundPositionY,
        normTargetBackgroundPositionY
      );
      // Delay animation with timeout, for some reason a delay in the animation property causes stutter
      setTimeout(() => {
        // Set transition properties ==> https://cubic-bezier.com/#.41,-0.01,.63,1.09

        door.style.transition = `background-position-y ${
          (9 + 1 * delta) * time_per_icon
        }ms cubic-bezier(.41,-0.01,.63,1.09)`;
        // Set background position
        door.style.backgroundPositionY = `${
          backgroundPositionY + delta * icon_height
        }px`;
      }, offset * 150);

      // After animation
      setTimeout(() => {
        // Reset position, so that it doesn't get higher without limit
        door.style.transition = `none`;
        door.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;
        // Resolve this promise
        resolve(delta % numIcons);
      }, (9 + 1 * delta) * time_per_icon + offset * 150);
    });
  }

  function rollAll(result: number) {
    setRolling(true);
    let targets = null;
    if (result < machineSettings[0]) {
      targets = getRandomWinTargets();
      console.log("win", targets);
    } else {
      targets = getRandomLossTargets();
      console.log("loss", targets);
    }

    const reelsList = [reel1Ref, reel2Ref, reel3Ref];
    // rig the outcome for every 3rd roll, if targets is set to null, the outcome will not get rigged by the roll function
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
            (updatedIndexes[i] = (updatedIndexes[i] + delta) % numIcons)
        );
        setIndexes(updatedIndexes);
        console.log(machineNum, indexes, targets, result, machineBetAmt);
        appendResult(machineNum, result, machineBetAmt);
        setRolling(false);
      });
  }

  return (
    <div className="vintage-box mb-2">
      <div className="vintage-box-inner flex flex-col gap-2 items-center p-4 font-ms">
        <div className="relative flex w-[144px] border-2 border-black">
          <div ref={reel1Ref} className="reel"></div>
          <div ref={reel2Ref} className="reel"></div>
          <div ref={reel3Ref} className="reel"></div>
        </div>
        <div className="flex justify-between w-full">
          <Button
            onClick={() => {
              decreaseBetAmt(machineNum);
            }}
          >
            -
          </Button>
          <Button
            onClick={() => {
              if (rolling) return;
              setMachineSelected(machineNum);
              const result = playBets(machineNum, machineBetAmt);
              if (typeof result === "number") {
                rollAll(result);
              }
            }}
          >
            Bet {machineBetAmt}
          </Button>
          <Button
            onClick={() => {
              increaseBetAmt(machineNum);
            }}
          >
            +
          </Button>
        </div>
        <div className="font-arcade text-black text-[20px]">
          Machine {machineNum}
        </div>

        <div className="flex flex-col gap-2 w-full items-center justify-center">
          <div>WINS to Bonus TOKENS</div>
          <div className="w-full text-center p-2 uppercase border-2 border-black bg-white">
            {getRollsToWin(
              machineSettings[1],
              machineSettings[0],
              getWins(machineNum)
            ).nextWins - getWins(machineNum)}
            : +
            {
              getRollsToWin(
                machineSettings[1],
                machineSettings[0],
                getWins(machineNum)
              ).bonus
            }
          </div>
        </div>
        {debug ? (
          <div>Yield Probability: {(machineSettings[0] * 100).toFixed(2)}</div>
        ) : null}
        {debug || machineMultKnown ? (
          <div>Multiplier: {machineSettings[1]}</div>
        ) : null}
        {debug ? <div>Seed: {seed}</div> : null}
        {debug ? <div>Wins: {getWins(machineNum)}</div> : null}
        <div className="flex flex-col gap-2 w-full items-center justify-center pb-4">
          <div>Number of Rolls: </div>
          <div className="font-arcade w-full text-center text-[32px]">
            {machineRolls}
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full items-center justify-center">
          <div>Loyalty</div>
          <div className="font-arcade w-full text-center text-[32px]">
            {loyaltyStreaks}
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full items-center justify-center">
          <div>Your Win Rate:</div>
          <div className="font-arcade w-full text-center text-[32px]">
            {machineRolls !== 0
              ? (
                  (results.filter((result) => result < machineSettings[0])
                    .length /
                    machineRolls) *
                  100
                ).toFixed(2) + "%"
              : 0}
          </div>
        </div>
      </div>
    </div>
  );
}
