"use client";
import "keen-slider/keen-slider.min.css";
import Button from "@/components/Button";
import { useKeenSlider } from "keen-slider/react";
import Machine from "@/components/Machine";
import { getRollsToWin } from "@/utils/bonus";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import seedrandom from "seedrandom";
import { KeenSliderInstance } from "keen-slider";
import eventBus from "@/eventBus";
import { BetResult, MiniState } from "@/types";
import { usePlayStateContext } from "@/providers/PlayStateProvider";
import { DAYS_OF_WEEK, DIFFICULTY_LEVELS, MACHINE_NUMBER } from "@/constants";
import getWins from "@/utils/getWins";
import { Heist } from "@/components/games/Heist";

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
    let tempWins =
      getWins(
        playState.betResults[machineSel],
        playState.machineSettings[machineSel][0]
      ) || 0;
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
      const nextWinsBonus = getRollsToWin(
        updatedPlayState.machineSettings[machineSel][1],
        updatedPlayState.machineSettings[machineSel][0],
        tempWins
      );
      if (tempWins + 1 == nextWinsBonus.nextWins) {
        updatedPlayState.userAmt += nextWinsBonus.bonus;
      }
    }
    forceUpdate(updatedPlayState);
    setResultLoading(false);
    if (result < updatedPlayState.machineSettings[machineSel][0]) {
      eventBus.next({
        type: "celebrate",
        data: `${updatedPlayState.machineSettings[machineSel][1] * betAmts}`,
      });
    } else {
      // check if user has lost all tokens
      if (updatedPlayState.userAmt <= 0) {
        forceUpdate({ ...updatedPlayState, userPhase: 2 });
      }
    }
    // check if user has played of a week
    console.log(updatedPlayState.totalRolls % DAYS_OF_WEEK);
    if (
      updatedPlayState.totalRolls !== 0 &&
      updatedPlayState.totalRolls % DAYS_OF_WEEK == 0
    ) {
      console.log("week end");
      forceUpdate({ ...updatedPlayState, userPhase: 1 });
    }
  }

  useEffect(() => {
    if (params.difficulty && playState.difficulty !== params.difficulty) {
      forceUpdate({ ...playState, difficulty: params.difficulty });
    }
  }, [params.difficulty, playState, forceUpdate]);

  useEffect(() => {
    for (let i = 0; i < MACHINE_NUMBER; i++) {
      if (playState.betAmts[i] > playState.userAmt) {
        const updatedPlayState = { ...playState };
        updatedPlayState.betAmts[i] = playState.userAmt;
        forceUpdate(updatedPlayState);
      }
    }
  }, [playState, forceUpdate]);

  function updateMiniGamePlayState(state: MiniState) {
    forceUpdate({ ...playState, curMiniGame: state });
  }

  function renderMiniGame(gameId: string) {
    switch (gameId) {
      case "HEIST":
        return (
          <Heist
            miniState={playState.curMiniGame}
            updateMiniGamePlayState={updateMiniGamePlayState}
          />
        );
      default:
        return (
          <Heist
            miniState={playState.curMiniGame}
            updateMiniGamePlayState={updateMiniGamePlayState}
          />
        );
    }
  }

  return playState ? (
    <div className="flex flex-col gap-5 items-center justify-center">
      {debug ? <div>User: {playState.id}</div> : null}
      {debug ? <div>Difficulty: {playState.difficulty}</div> : null}
      <div className="flex flex-col gap-1">
        <div className="font-arcade text-[24px] mt-4 flex flex-wrap justify-center gap-2">
          <div>Week</div>
          <div>{Math.floor(playState.totalRolls / 5) + 1}</div>
        </div>
        {playState.userPhase == 0 ? (
          <div className="font-arcade text-[24px] mt-4 flex flex-wrap justify-center gap-2">
            <div>Rolls to next week </div>
            <div>{5 - Math.floor(playState.totalRolls % 5)}</div>
          </div>
        ) : null}
        <div className="font-arcade text-[24px] mt-4 flex flex-wrap justify-center gap-2">
          <div>TOKENS:</div>
          <div>{playState.userAmt}</div>
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
                    machineBetAmt={playState.betAmts[index]}
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
      {playState.userPhase == 1
        ? renderMiniGame(playState.curMiniGame.id)
        : null}
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
    </div>
  ) : null;
}
