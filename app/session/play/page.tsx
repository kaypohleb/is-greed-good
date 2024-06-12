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
import { BetResult } from "@/types";
import { usePlayStateContext } from "@/providers/PlayStateProvider";
import { MACHINE_NUMBER } from "@/constants";
import getWins from "@/utils/getWins";

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
export default function Play() {
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
      playState.userPhase > 1 &&
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

    //updatedPlayState.greedStreak += 1;
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
    }
  }

  useEffect(() => {
    if (playState.userAmt <= 0) {
      forceUpdate({ ...playState, userPhase: 2 });
    }
  }, [playState, forceUpdate]);

  useEffect(() => {
    for (let i = 0; i < MACHINE_NUMBER; i++) {
      if (playState.betAmts[i] > playState.userAmt) {
        const updatedPlayState = { ...playState };
        updatedPlayState.betAmts[i] = playState.userAmt;
        forceUpdate(updatedPlayState);
      }
    }
  }, [playState, forceUpdate]);

  return playState ? (
    <div className="flex flex-col gap-5 items-center justify-center">
      {debug ? <div>User: {playState.id}</div> : null}
      <div className="flex flex-wrap gap-4">
        <div className="font-arcade text-[32px] mt-4 flex flex-wrap justify-center gap-2">
          <div>TOKENS:</div>
          <div>{playState.userAmt}</div>
        </div>
      </div>

      {playState.userPhase < 1 ? (
        <div className="w-full mt-4">
          <div ref={sliderRef} className="keen-slider">
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
      {playState.userPhase < 2 ? (
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
