import Button from "../Button";
import { MiniState } from "@/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import AgentCrossImage from "@assets/images/AgentCross.png";
import { DIFFICULTY_LEVELS } from "@/constants";
import seedrandom from "seedrandom";
import BigNumber from "bignumber.js";

const SHOWN_ROADS = 4;
const TOTAL_ROADS = 6;
const ROAD_WIDTH = 72;
const ROAD_HEIGHT = 72;
const COINCROSS_PROBABILITY = [0.04, 0.12, 0.2, 0.4];
const COINCROSS_STARTING_MULTIPLIERS = [1.0, 1.09, 1.2, 1.6];
const COINCROSS_STARTING_SCALING_FACTOR = [1.02, 1.14, 1.26, 1.72];
const COINCROSS_SCALING_FACTOR_INCREMENT = [0.008, 0.016, 0.024, 0.05];
const TIME_PER_ROAD = 75;

export function CoinCross({
  miniState,
  updateMiniGamePlayState,
}: {
  miniState: MiniState;
  updateMiniGamePlayState: (newState: MiniState) => void;
}) {
  const agentRef = useRef<HTMLImageElement>(null);
  const roadRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const difficultyIndex = useMemo(() => {
    return DIFFICULTY_LEVELS.indexOf(miniState.difficulty);
  }, [miniState.difficulty]);

  const [currentMultiplier, setCurrentMultiplier] = useState<number>(
    miniState.currentMult
  );
  const [hide, setHide] = useState(false);
  const [crossing, setCrossing] = useState(false);
  const [gameState, setGameState] = useState(miniState.state);
  const initFormat = miniState.format ? parseInt(miniState.format) : 0;
  const [roadCrossed, setRoadCrossed] = useState(initFormat);
  const [personMoved, setPersonMoved] = useState(false);
  const notBase = useMemo(() => (roadCrossed > 0 ? 1 : 0), [roadCrossed]);

  const getMultiplier = useCallback(
    (n: number) => {
      const a = new BigNumber(COINCROSS_STARTING_MULTIPLIERS[difficultyIndex]);
      const r0 = new BigNumber(
        COINCROSS_STARTING_SCALING_FACTOR[difficultyIndex]
      ); // Initial scaling factor
      const k = new BigNumber(
        COINCROSS_SCALING_FACTOR_INCREMENT[difficultyIndex]
      ); // Growth rate of scaling factor

      let result = new BigNumber(1); // To store the product of scaling factors

      // Calculate the product of (r0 + k * i) for i = 0 to n - 1
      for (let i = 0; i < n; i++) {
        const scalingFactor = r0.plus(k.multipliedBy(i)); // r0 + k * i
        result = result.multipliedBy(scalingFactor); // Multiply the scaling factors
      }

      // Multiply the result by the base number a
      return a.multipliedBy(result);
    },
    [difficultyIndex]
  );

  const getMultipliers = useMemo(() => {
    const multipliers = [];
    for (let i = 0; i < SHOWN_ROADS; i++) {
      multipliers.push(getMultiplier(roadCrossed + i - notBase).toNumber());
    }
    return multipliers;
  }, [getMultiplier, roadCrossed, notBase]);

  function moveRoad(road: HTMLDivElement): Promise<String> {
    return new Promise((resolve) => {
      const style = getComputedStyle(road);
      const backgroundPositionX = parseInt(style.backgroundPositionX);
      const targetBackgroundPositionX = backgroundPositionX - 1 * ROAD_WIDTH;
      const normTargetBackgroundPositionX =
        targetBackgroundPositionX % (TOTAL_ROADS * ROAD_WIDTH);

      setTimeout(() => {
        road.style.transition = `background-position-x ${
          (5 + 1) * TIME_PER_ROAD
        }ms cubic-bezier(0.65, 0, 0.35, 1)`;
        // Set background position
        road.style.backgroundPositionX = `${targetBackgroundPositionX}px`;
      }, TIME_PER_ROAD);

      // After animation
      setTimeout(() => {
        // Reset position, so that it doesn't get higher without limit
        road.style.transition = `none`;
        road.style.backgroundPositionX = `${normTargetBackgroundPositionX}px`;
        resolve("done");
      }, (5 + 1) * TIME_PER_ROAD + 75);
    });
  }

  function result(truck: HTMLDivElement): Promise<Boolean> {
    const style = getComputedStyle(truck);
    const backgroundPositionY = parseInt(style.backgroundPositionY);
    const updatedRNG = seedrandom(
      miniState.date + miniState.id + roadCrossed.toString()
    );
    const result = updatedRNG();
    if (result > COINCROSS_PROBABILITY[difficultyIndex]) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          setTimeout(() => {
            if (!roadRef.current) return;
            // Reset position, so that it doesn't get higher without limit
            truck.style.transition = `none`;
            truck.style.backgroundPositionY = `-72px`;
            // Resolve this promise
            resolve(true);
          }, (5 + 1) * TIME_PER_ROAD + 75 * 3);
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        const targetBackgroundPositionY = backgroundPositionY + 1 * ROAD_HEIGHT;
        setTimeout(() => {
          truck.style.transition = `background-position-y ${
            (5 + 1) * TIME_PER_ROAD
          }ms cubic-bezier(0.65, 0, 0.35, 1)`;
          // Set background position
          truck.style.backgroundPositionY = `${targetBackgroundPositionY}px`;
        }, TIME_PER_ROAD);

        // After animation
        setTimeout(() => {
          if (!roadRef.current) return;
          // Reset position, so that it doesn't get higher without limit
          truck.style.transition = `none`;
          truck.style.backgroundPositionY = `-72px`;
          // Resolve this promise
          resolve(false);
        }, (5 + 1) * TIME_PER_ROAD + 75 * 3);
      });
    }
  }

  function movePerson(agent: HTMLDivElement): Promise<String> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const style = getComputedStyle(agent);
        const left = parseInt(style.left);
        const targetPositionX = left + 1 * ROAD_WIDTH;
        agent.style.transition = `left ${
          (5 + 1) * TIME_PER_ROAD
        }ms cubic-bezier(0.65, 0, 0.35, 1)`;
        // Set background position
        agent.style.left = `${targetPositionX}px`;
        resolve("done");
      }, TIME_PER_ROAD);
    });
  }

  function move() {
    if (crossing || gameState == 2) return;
    setCrossing(true);
    if (roadCrossed == 0) {
      if (agentRef.current) {
        setPersonMoved(true);
        movePerson(agentRef.current).then((res) => {
          if (res === "done" && resultRef.current) {
            result(resultRef.current).then((res: Boolean) => {
              resolveResult(res);
              setCrossing(false);
            });
          }
        });
      }
    } else {
      if (roadRef.current) {
        moveRoad(roadRef.current).then((res) => {
          if (res === "done" && resultRef.current) {
            result(resultRef.current).then((res) => {
              resolveResult(res);
              setCrossing(false);
            });
          }
        });
      }
    }
  }

  function stop(){
    setGameState(2);
    updateMiniGamePlayState({
      ...miniState,
      state: 2,
      format: roadCrossed.toString(),
    });
  }

  function resolveResult(res: Boolean) {
    if (res) {
      const updatedMult = getMultiplier(roadCrossed + 1)
        .toNumber()
        .toFixed(2);
      setCurrentMultiplier(parseFloat(updatedMult));
      setRoadCrossed(roadCrossed + 1);
      setGameState(1);
      updateMiniGamePlayState({
        ...miniState,
        currentMult: parseFloat(updatedMult),
        state: 1,
        format: (roadCrossed + 1).toString(),
      });
    } else {
      setCurrentMultiplier(0);
      setGameState(2);
      updateMiniGamePlayState({
        ...miniState,
        currentMult: 0,
        state: 2,
        format: roadCrossed.toString(),
      });
    }
  }

  useEffect(() => {
    if (miniState.state === 1 && !personMoved && roadCrossed > 0) {
      setPersonMoved(true);
      setCrossing(true);
      if (agentRef.current) {
        movePerson(agentRef.current).then((res) => {
          if (res === "done" && resultRef.current) {
            setCrossing(false);
          }
        });
      }
    }
  }, [miniState.state, personMoved, roadCrossed]);

  return (
    <div className="w-[288px] flex flex-col">
      {/* Infinite road with stops */}
      <div>Road Crossed: {roadCrossed}</div>
      <div>Game State: {gameState}</div>
      <div>Current Mult: </div>
      <div>{currentMultiplier}</div>
      <div className="relative h-[72px] w-full">
        <div ref={agentRef} className="absolute top-0 left-0 z-10">
          {gameState !== 2 ? (
            <Image
              src={AgentCrossImage}
              alt="AgentCross"
              height={48}
              className="m-[12px]"
            />
          ) : null}
        </div>
        <div className="absolute top-0 left-0 w-[288px] bg-white border-2 border-black overflow-hidden">
          <div ref={roadRef} className="road"></div>
        </div>
        <div className="absolute top-0 left-[72px] z-20">
          <div ref={resultRef} className="roadResult"></div>
        </div>
      </div>
      {hide ? null : (
        <div className="w-full flex-row flex items-stretch justify-center ">
          {getMultipliers.map((mult, i) => (
            <div key={`mult-${i}`} className="flex-1 justify-center">
              {mult.toFixed(2)}
            </div>
          ))}
        </div>
      )}
      <Button onClick={move}>MOVE</Button>
      <Button onClick={stop}>STOP</Button>
    </div>
  );
}
