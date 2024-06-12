"use client";
import Button from "@/components/Button";
import { BetResult } from "@/types";
import { getRollsToWin } from "@/utils/bonus";
import { WIN_COMBINATIONS, LOSS_COMBINATIONS } from "@/utils/yields";
import { use, useRef, useState } from "react";
import { usePlayStateContext } from "@/providers/PlayStateProvider";
import { ALLOWED_BET_AMOUNTS } from "@/constants";
import getWins from "@/utils/getWins";

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
  const { playState, forceUpdate, forcedGet, updatePlayState } =
    usePlayStateContext();

  const numIcons = 10;
  const iconHeight = 96;
  const timePerIcon = 50;
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
    const currentIndex = backgroundPositionY / iconHeight;
    const delta = target - currentIndex + (offset + 2) * numIcons;
    console.log("current", currentIndex, target, offset, delta);
    return new Promise((resolve, reject) => {
      // Target background position
      const targetBackgroundPositionY =
        backgroundPositionY + delta * iconHeight;
      // Normalized background position, for reset
      const normTargetBackgroundPositionY =
        targetBackgroundPositionY % (numIcons * iconHeight);
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
          (9 + 1 * delta) * timePerIcon
        }ms cubic-bezier(.41,-0.01,.63,1.09)`;
        // Set background position
        door.style.backgroundPositionY = `${
          backgroundPositionY + delta * iconHeight
        }px`;
      }, offset * 75);

      // After animation
      setTimeout(() => {
        // Reset position, so that it doesn't get higher without limit
        door.style.transition = `none`;
        door.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;
        // Resolve this promise
        resolve(delta % numIcons);
      }, (9 + 1 * delta) * timePerIcon + offset * 75);
    });
  }

  function rollAll(result: number) {
    setRolling(true);
    let targets = null;
    if (result < machineSettings[0]) {
      targets = getRandomWinTargets();
      //console.log("win", targets);
    } else {
      targets = getRandomLossTargets();
      //console.log("loss", targets);
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

  function increaseBetAmt(machineNumber: number) {
    //increase to next amount based on ALLOWED_ROLL_AMOUNTS until the limit of rolls possible
    //return the highest possible roll amount if the user amount is less than the highest roll amount
    const updatedPlayState = { ...playState };
    const maxRollsAmt =
      ALLOWED_BET_AMOUNTS[ALLOWED_BET_AMOUNTS.length - 1] > playState.userAmt
        ? playState.userAmt
        : ALLOWED_BET_AMOUNTS[ALLOWED_BET_AMOUNTS.length - 1];

    const rollAmtIndex = ALLOWED_BET_AMOUNTS.indexOf(
      playState.betAmts[machineNumber]
    );
    //if index is not found, it must be the max roll amount
    if (rollAmtIndex === -1) {
      updatedPlayState.betAmts[machineNumber] = maxRollsAmt;
    } else if (
      rollAmtIndex + 1 < ALLOWED_BET_AMOUNTS.length &&
      ALLOWED_BET_AMOUNTS[rollAmtIndex + 1] < maxRollsAmt
    ) {
      updatedPlayState.betAmts[machineNumber] =
        ALLOWED_BET_AMOUNTS[rollAmtIndex + 1];
    } else {
      updatedPlayState.betAmts[machineNumber] = maxRollsAmt;
    }
    forceUpdate(updatedPlayState);
  }

  function decreaseBetAmt(machineNumber: number) {
    //decrease to next amount based on ALLOWED_ROLL_AMOUNTS
    const updatedPlayState = { ...playState };
    const rollAmtIndex = ALLOWED_BET_AMOUNTS.indexOf(
      playState.betAmts[machineNumber]
    );
    if (rollAmtIndex > 0) {
      updatedPlayState.betAmts[machineNumber] =
        ALLOWED_BET_AMOUNTS[rollAmtIndex - 1];
    } else {
      updatedPlayState.betAmts[machineNumber] = ALLOWED_BET_AMOUNTS[0];
    }
    forceUpdate(updatedPlayState);
  }

  return (
    <div className="vintage-box mb-2">
      <div className="vintage-box-inner flex flex-col gap-2 items-center p-4 font-ms">
        <div className="relative flex w-[288px] bg-white border-2 border-black">
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
        </div>
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
    </div>
  );
};

Machine.displayName = "Machine";
export default Machine;
