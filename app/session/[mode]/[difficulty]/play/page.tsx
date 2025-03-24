"use client";
import "keen-slider/keen-slider.min.css";
import Button from "@components/Button";
import { useKeenSlider } from "keen-slider/react";
import Machine from "@components/Machine";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import seedrandom from "seedrandom";
import { KeenSliderInstance } from "keen-slider";
import eventBus from "@/eventBus";
import { BetResult, MiniState } from "@/types";
import { usePlayStateContext } from "@providers/PlayStateProvider";
import {
  BASE_WEEK_REQ_BASED_DIFFICULTY,
  DAYS_OF_WEEK,
  DIFFICULTY_LEVELS,
  WEEK_REQ_MULTIPLIER,
  WEEK_REQ_MULTIPLIER_SCALING,
} from "@/constants";
import Window from "@components/Window";
import { Heist } from "@components/games/Heist";
import { CoinCross } from "@components/games/CoinCross";
import CoinBalloon from "@components/games/CoinBalloon";

const ResizePlugin = (slider: KeenSliderInstance) => {
  const observer = new ResizeObserver(function () {
    slider.update();
  });

  slider.on("created", () => {
    observer.observe(slider.container);
  });
  slider.on("destroyed", () => {
    observer.unobserve(slider.container);
  });
};

export default function Play({ params }: { params: { difficulty: string } }) {
  const { playState, forceUpdate } = usePlayStateContext();
  const searchParams = useSearchParams();

  let debug = searchParams.get("hiddendebug") || false;

  const [betAmtInput, setBetAmtInput] = useState(playState.betAmt || 1);
  const [resultLoading, setResultLoading] = useState(false);

  const [sliderRef, instanceRef] = useKeenSlider(
    {
      loop: false,
      slides: {
        perView: 1,
        spacing: 15,
        origin: "center",
      },
      breakpoints: {
        "(min-width: 768px)": {
          slides: {
            perView: 3,
            spacing: 15,
            origin: "center",
          },
        },
        "(min-width: 1280px)": {
          slides: {
            perView: 5,
            spacing: 15,
            origin: "center",
          },
        },
      },
      slideChanged() {
        console.log("slide changed");
      },
    },
    [ResizePlugin]
  );

  const weekRequirements = useMemo(() => {
    const week = Math.floor(playState.totalRolls / DAYS_OF_WEEK) + 1;
    const difficulty_index = DIFFICULTY_LEVELS.indexOf(playState.difficulty);
    return Math.floor(
      BASE_WEEK_REQ_BASED_DIFFICULTY[difficulty_index] +
        (week - 1) *
          (WEEK_REQ_MULTIPLIER[difficulty_index] +
            (week - 1) * WEEK_REQ_MULTIPLIER_SCALING[difficulty_index])
    );
  }, [playState.totalRolls, playState.difficulty]);

  function changeBetAmt(betAmt: number) {
    const updatedPlayState = { ...playState };
    let updatedBetAmt = 0;
    if (isNaN(betAmt) || betAmt == undefined) {
      updatedBetAmt = 1;
    } else {
      if (betAmt > playState.userAmt) {
        updatedBetAmt = playState.userAmt;
      } else if (betAmt <= 0) {
        updatedBetAmt = 1;
      } else {
        updatedBetAmt = betAmt;
      }
    }
    updatedPlayState.betAmt = updatedBetAmt;
    updatedPlayState.curMiniGame.currentBet = updatedBetAmt;

    setBetAmtInput(updatedBetAmt);
    forceUpdate(updatedPlayState);
  }

  function playBets(machineSel: number, betAmts: number): number | undefined {
    if (
      playState.userPhase == 0 &&
      playState.userAmt < betAmts &&
      playState.userAmt > 0 &&
      !resultLoading
    )
      return;

    const updatedMachineSeed =
      playState.date +
      (playState.machineSettings[machineSel][0] * 100).toFixed(0) +
      playState.machineSettings[machineSel][1].toString() +
      playState.machineRolls[machineSel] +
      1;

    const result = seedrandom(updatedMachineSeed)();
    setResultLoading(true);
    return result;
  }

  function appendResult(machineSel: number, result: number, betAmts: number) {
    const updatedPlayState = { ...playState };
    updatedPlayState.machineSelected = machineSel;
    updatedPlayState.userAmt -= betAmts;

    updatedPlayState.totalRolls += 1;
    updatedPlayState.machineRolls[machineSel] += 1;
    updatedPlayState.machineSeeds[machineSel] =
      updatedPlayState.date +
      (updatedPlayState.machineSettings[machineSel][0] * 100).toFixed(0) +
      updatedPlayState.machineSettings[machineSel][1].toString() +
      updatedPlayState.machineRolls[machineSel];

    updatedPlayState.loyaltyStreaks = updatedPlayState.loyaltyStreaks.map(
      (streak, index) => {
        if (index === machineSel) {
          return streak + 1;
        }
        return streak;
      }
    );

    const betResult: BetResult = {
      bet: betAmts,
      result: result,
    };

    updatedPlayState.betResults[machineSel].push(betResult);
    if (result < updatedPlayState.machineSettings[machineSel][0]) {
      updatedPlayState.userAmt +=
        betAmts * updatedPlayState.machineSettings[machineSel][1];
      // add rolls to win bonus
      // const nextWinsBonus = getRollsToWin(
      //   updatedPlayState.machineSettings[machineSel][1],
      //   updatedPlayState.machineSettings[machineSel][0],
      //   tempWins
      // );
      // if (tempWins + 1 == nextWinsBonus.nextWins) {
      //   updatedPlayState.userAmt += nextWinsBonus.bonus;
      // }
    }

    if (updatedPlayState.userAmt <= 0) {
      updatedPlayState.userPhase = 2;
    } else {
      if (
        updatedPlayState.totalRolls !== 0 &&
        updatedPlayState.totalRolls % DAYS_OF_WEEK == 0 &&
        updatedPlayState.userPhase == 0
      ) {
        console.log("week end");
        const updatedBetAmt = updatedPlayState.userAmt - weekRequirements;
        updatedPlayState.userAmt = updatedBetAmt;
        updatedPlayState.betAmt = updatedPlayState.userAmt;
        updatedPlayState.curMiniGame.currentBet = updatedPlayState.userAmt;

        if (updatedPlayState.userAmt <= 0) {
          updatedPlayState.userPhase = 2;
        } else {
          updatedPlayState.userPhase = 1;
        }
        setBetAmtInput(updatedBetAmt);
      }
    }

    forceUpdate(updatedPlayState);
    setResultLoading(false);
    if (result < updatedPlayState.machineSettings[machineSel][0]) {
      eventBus.next({
        type: "celebrate",
        data: `${updatedPlayState.machineSettings[machineSel][1] * betAmts}`,
      });
    }
  }

  function returnToMachine() {
    const updatedPlayState = { ...playState };
    if (playState.curMiniGame.currentMult > 0) {
      const wonAmt = Math.round(
        playState.curMiniGame.currentMult * playState.curMiniGame.currentBet
      );
      updatedPlayState.userAmt += wonAmt;
      eventBus.next({
        type: "celebrate",
        data: `x${playState.curMiniGame.currentMult} = ${wonAmt}`,
      });
    }
    updatedPlayState.userPhase = 0;
    forceUpdate(updatedPlayState);
  }

  useEffect(() => {
    if (params.difficulty && playState.difficulty !== params.difficulty) {
      forceUpdate({ ...playState, difficulty: params.difficulty });
    }
  }, [params.difficulty, playState, forceUpdate]);

  useEffect(() => {
    if (playState.curMiniGame.state == 2) {
      forceUpdate({
        ...playState,
        userPhase: 1,
        curMiniGame: {
          ...playState.curMiniGame,
          game: "",
          state: 0,
          currentMult: 0,
        },
      });
    }
  });

  useEffect(() => {
    if (playState.betAmt > playState.userAmt) {
      const updatedPlayState = { ...playState };
      updatedPlayState.betAmt = playState.userAmt;
      forceUpdate(updatedPlayState);
    }
  }, [playState, forceUpdate]);

  function updateMiniGamePlayState(state: MiniState) {
    forceUpdate({ ...playState, curMiniGame: state });
  }

  return playState ? (
    <div className="flex flex-col gap-5 items-center justify-center">
      {debug ? <div>User: {playState.id}</div> : null}
      {debug ? <div>Difficulty: {playState.difficulty}</div> : null}
      <div className="flex flex-col gap-1">
        <div className="font-arcade text-[24px] mt-4 flex flex-wrap justify-center gap-2 border-b-4 border-b-silver">
          <div>Week</div>
          <div>{Math.floor(playState.totalRolls / DAYS_OF_WEEK) + 1}</div>
        </div>
        <div className="font-arcade text-[16px] p-2 mt-4 flex flex-wrap justify-center gap-2 border-2 border-b-silver">
          <div>Week Requirements</div>
          <div>{weekRequirements}</div>
        </div>
        {playState.userPhase == 0 ? (
          <div className="font-arcade text-[24px] mt-4 flex flex-wrap justify-center gap-2 items-center">
            <div>Rolls Left </div>
            <div className="border-4 border-dashed p-2 border-silver">{5 - Math.floor(playState.totalRolls % DAYS_OF_WEEK)}</div>
          </div>
        ) : null}
        <div className="font-arcade text-[24px] mt-4 flex flex-wrap justify-center gap-2">
          <div>{playState.userAmt} TOKENS</div>
        </div>
      </div>
      {/* Normal Day */}
      {playState.userPhase == 0 ? (
        <div className="md:w-full mt-4 w-4/5">
          <div ref={sliderRef} className="keen-slider ">
            {playState.machineSeeds.map((seed, index) => {
              return (
                <div
                  key={index}
                  className="keen-slider__slide"
                  style={{
                    opacity: playState.machineSelected === index ? 1 : 0.6,
                  }}
                >
                  <Machine
                    machineNum={index}
                    machineSettings={playState.machineSettings[index]}
                    machineRolls={playState.machineRolls[index]}
                    results={playState.betResults[index]}
                    playBets={playBets}
                    machineBetAmt={playState.betAmt}
                    loyaltyStreaks={playState.loyaltyStreaks[index]}
                    debug={debug}
                    seed={seed}
                    appendResult={appendResult}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      {/* Week End */}
      {playState.userPhase == 1 && playState.curMiniGame ? (
        <Window title={playState.curMiniGame.game}>
          {playState.curMiniGame.game == "HEIST" ? (
            <Heist
              miniState={playState.curMiniGame}
              updateMiniGamePlayState={updateMiniGamePlayState}
            />
          ) : null}
          {playState.curMiniGame.game == "COINCROSS" ? (
            <CoinCross
              miniState={playState.curMiniGame}
              updateMiniGamePlayState={updateMiniGamePlayState}
            />
          ) : null}
          {playState.curMiniGame.game == "COINBALLOON" ? (
            <CoinBalloon
              miniState={playState.curMiniGame}
              updateMiniGamePlayState={updateMiniGamePlayState}
            />
          ) : null}
          <Button onClick={returnToMachine}>RETURN</Button>
        </Window>
      ) : null}
      {/* End Game */}
      {playState.userPhase == 2 ? (
        <Button
          onClick={() => {
            forceUpdate({ ...playState, userPhase: 2 });
          }}
        >
          I&apos;LL STOP HERE
        </Button>
      ) : null}
      <input
        className="w-[80px] text-black text-center border-2 px-2 border-black"
        type="number"
        min="1"
        value={betAmtInput}
        max={playState.userAmt}
        onChange={(e) => {
          changeBetAmt(parseInt(e.target.value));
        }}
      />
      <Button
        onClick={() => {
          changeBetAmt(playState.userAmt);
        }}
      >
        ALL IN
      </Button>
    </div>
  ) : null;
}
