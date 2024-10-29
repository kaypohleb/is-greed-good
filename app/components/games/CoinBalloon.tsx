// Inflate the Balloon : Hold the purple button to inflate the balloon. The more it inflates, the higher the multiplier increases.

import { MiniState } from "@/types";
import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import seedrandom from "seedrandom";
import { DIFFICULTY_LEVELS } from "@/constants";

const BALLOON_BASE_MULTIPLIER = [1.0, 1.1, 1.2, 1.5];
const BALLOON_BASE_SIZE = 36;
const BALLOON_MAX_SIZE = 120;
const BALLOON_SIZE_INCREMENT = 1;

// Cash Out Your Winnings : Release the button to cash out your winnings before the balloon bursts. If you wait too long, the balloon explodes, and you lose your bet.
export default function CoinBalloon({
  miniState,
  updateMiniGamePlayState,
}: {
  miniState: MiniState;
  updateMiniGamePlayState: (newState: MiniState) => void;
}) {
  const [currentMiniGameState, setCurrentMiniGameState] = useState(miniState);

  const [balloonSize, setBalloonSize] = useState(
    miniState.format
      ? parseInt(miniState.format)
      : BALLOON_BASE_MULTIPLIER[DIFFICULTY_LEVELS.indexOf(miniState.difficulty)]
  );

  const [startingBet, setStartingBet] = useState();
  const [allowInflate, setAllowInflate] = useState(false);
  const [isInflating, setIsInflating] = useState(false);

  function inflateHandler() {
    setCurrentMiniGameState({
      ...currentMiniGameState,
      state: 1,
    });
    setAllowInflate(true);
    setIsInflating(true);
  }

  function stopInflateHandler() {
    setAllowInflate(false);
  }

  useEffect(() => {
    if (currentMiniGameState.state == 1 && allowInflate && isInflating) {
      setIsInflating(false);
      const rand = seedrandom(
        miniState.date + miniState.id + balloonSize.toString()
      )();
      if (rand < 0.15) {
        setAllowInflate(false);
        setCurrentMiniGameState({
          ...currentMiniGameState,
          currentMult: 0,
          updated: new Date().toISOString(),
        });
      } else {
        setBalloonSize((prev) => prev + 5);
        setCurrentMiniGameState({
          ...currentMiniGameState,
          currentMult: new BigNumber(currentMiniGameState.currentMult)
            .plus(0.1)
            .toNumber(),
          updated: new Date().toISOString(),
        });
      }
    }
    const inflateTimeout = setTimeout(() => {
      setIsInflating(true);
    }, 500);

    return () => clearTimeout(inflateTimeout);
  }, [
    allowInflate,
    balloonSize,
    currentMiniGameState,
    currentMiniGameState.state,
    isInflating,
    miniState.date,
    miniState.id,
  ]);

  useEffect(() => {
    if (currentMiniGameState.state == 1 && !allowInflate) {
      setCurrentMiniGameState({
        ...currentMiniGameState,
        state: 2,
        updated: new Date().toISOString(),
      });
    }
  }, [allowInflate, currentMiniGameState]);

  return (
    <div>
      <h1>Coin Balloon</h1>
      <h2>State: {currentMiniGameState.state}</h2>
      {startingBet ? <h2>Starting Bet: {startingBet}</h2> : null}
      <h2>Multiplier: {currentMiniGameState.currentMult}</h2>
      {currentMiniGameState.state == 0 ? <div>Play</div> : null}
      <div className="flex items-center justify-center flex-col h-[100px] border-2 border-black ">
        <div
          className="balloon"
          style={{
            width: 33 + balloonSize,
            height: 33 + balloonSize,
            transition: "width 250ms, height 250ms",
          }}
        ></div>
        <div className="balloonbutt"></div>
      </div>
      <button onClick={inflateHandler}>Inflate the Balloon</button>
      <button onClick={stopInflateHandler}>Cash Out</button>
    </div>
  );
}
