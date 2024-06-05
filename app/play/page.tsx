"use client";
import "keen-slider/keen-slider.min.css";
import Button from "@/components/Button";
import { useKeenSlider } from "keen-slider/react";
import Machine from "@/components/Machine";
import { getRollsToWin } from "@/utils/bonus";

import { genYieldMultiplier, genYieldProbabilities } from "@/utils/yields";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import seedrandom from "seedrandom";
import { KeenSliderInstance } from "keen-slider";
import CelebrationModel from "@/components/CelebrationModal";

const ALLOWED_BET_AMOUNTS = [1, 5, 10, 50, 100, 1000];

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

export default function Gamba() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  let userId = "randomUser";
  let debug = searchParams.get("hiddendebug") || false;

  //console.log(session);

  if (session && session.user && session.user.id) {
    userId = session.user.id;
  }

  const dt = useMemo(() => {
    const dateTime = new Date();
    return (
      dateTime.getDate().toString() +
      dateTime.getMonth().toString() +
      dateTime.getFullYear().toString()
    );
  }, []);

  const rand = seedrandom(dt);
  const randPos = seedrandom(userId || new Date().getTime().toString());
  const machineNumber = 5;

  const [machineRolls, setMachineRolls] = useState<number[]>(
    [...Array(machineNumber)].map(() => {
      return 0;
    })
  );

  const machineSettings = useMemo<number[][]>(
    () =>
      [...Array(machineNumber)]
        .map(() => {
          const multiplier = genYieldMultiplier(rand);
          const probability = genYieldProbabilities(rand, multiplier);
          return [probability, multiplier];
        })
        .sort(() => randPos() - 0.5),
    [rand, randPos]
  );

  const [machineSeeds, setMachineSeeds] = useState<string[]>(() => {
    return [...Array(machineNumber)].map((_, index) => {
      return (
        dt +
        (machineSettings[index][0] * 100).toFixed(0) +
        machineSettings[index][1].toString() +
        machineRolls[index]
      );
    });
  });

  const [modal, setModal] = useState<JSX.Element | null>(null);

  const [results, setResults] = useState<number[][]>(
    [...Array(machineNumber)].map(() => {
      return [];
    })
  );

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

  //if user is logged in, get user amount from server
  const [userAmt, setUserAmt] = useState<number>(1000);
  const [userWinAmt, setUserWinAmt] = useState<number>(0);
  //phase 0: game phase
  //phase 1: end phase
  const [userPhase, setUserPhase] = useState<number>(0);

  const [machineBetAmts, setMachineBetAmts] = useState<number[]>(
    [...Array(machineNumber)].map(() => {
      return ALLOWED_BET_AMOUNTS[0];
    })
  );

  const [machineMultKnown, setMachineMultKnown] = useState<boolean[]>(
    [...Array(machineNumber)].map((_, index) => {
      return results[index].some(
        (result) => result < machineSettings[index][0]
      );
    })
  );

  //if winning streak, increase base bet amount
  const [previousResult, setPreviousResult] = useState<boolean[]>(
    [...Array(machineNumber)].map(() => {
      return false;
    })
  );
  const [loyaltyStreaks, setLoyaltyStreaks] = useState<number[]>(
    [...Array(machineNumber)].map(() => {
      return 0;
    })
  );
  const [winStreak, setWinStreak] = useState<number[]>(
    [...Array(machineNumber)].map(() => {
      return 0;
    })
  );
  const [longestWinStreak, setLongestWinStreak] = useState<number[]>(
    [...Array(machineNumber)].map(() => {
      return 0;
    })
  );
  const [machineSelected, setMachineSelected] = useState<number>(0);

  //for debugging purposes
  function play1(machineSel: number) {
    if (userPhase > 0) return;
    setUserAmt((prev) => {
      return prev - 1;
    });
    const machinePressed = machineRolls[machineSel] + 1;
    setMachineSeeds((prev) => {
      const newSeeds = [...prev];
      newSeeds[machineSel] =
        dt +
        (machineSettings[machineSel][0] * 100).toFixed(0) +
        machineSettings[machineSel][1].toString() +
        machinePressed;
      return newSeeds;
    });

    setMachineRolls((prev) => {
      const newPresses = [...prev];
      newPresses[machineSel] = machinePressed;
      return newPresses;
    });

    if (machineSeeds[machineSel]) {
      const result = seedrandom(machineSeeds[machineSel])();
      setResults((prev) => {
        const newResults = [...prev];
        newResults[machineSel] = [...newResults[machineSel], result];
        return newResults;
      });
      if (result < machineSettings[machineSel][0]) {
        setUserWinAmt((prev) => {
          return prev + machineSettings[machineSelected][1];
        });
      }
    }
  }

  const getWins = (machineNum: number) => {
    return results[machineNum].filter(
      (result) => result < machineSettings[machineNum][0]
    ).length;
  };

  //for debugging purposes
  function play100(machineSel: number) {
    const tempMachinePress = machineRolls[machineSel];
    const tempResults: number[] = [];
    for (let i = 0; i < 100; i++) {
      setUserAmt((prev) => {
        return prev - 1;
      });
      const machinePressed = tempMachinePress + i;
      const machineSeed =
        dt +
        (machineSettings[machineSel][0] * 100).toFixed(0) +
        machineSettings[machineSel][1].toString() +
        machinePressed;

      if (machineSeeds[machineSel]) {
        const result = seedrandom(machineSeed)();
        tempResults.push(result);
      }
    }
    setMachineRolls((prev) => {
      const newPresses = [...prev];
      newPresses[machineSel] = tempMachinePress + 100;
      return newPresses;
    });
    setMachineSeeds((prev) => {
      const newSeeds = [...prev];
      newSeeds[machineSel] =
        dt +
        (machineSettings[machineSel][0] * 100).toFixed(0) +
        machineSettings[machineSel][1].toString() +
        (tempMachinePress + 100);
      return newSeeds;
    });
    setResults((prev) => {
      const newResults = [...prev];
      newResults[machineSel] = [...newResults[machineSel], ...tempResults];
      return newResults;
    });
  }

  function playBets(machineSel: number, betAmts: number): number | undefined {
    if (userPhase > 1 && userAmt < betAmts && userAmt > 0) return;
    //GET MACHINE PRESSES FIRST FROM SERVER TO PREVENT MULTI PRESS AND MULTI-TAB SIGN-IN
    setUserAmt((prev) => {
      return prev - betAmts;
    });

    const machineSeed =
      dt +
      (machineSettings[machineSel][0] * 100).toFixed(0) +
      machineSettings[machineSel][1].toString() +
      machineRolls[machineSel] +
      1;

    const result = seedrandom(machineSeed)();

    //TODO MAKE SURE TO GET MACHINE RESULTS FIRST FROM SERVER TO PREVENT RACE CRASH AND MATCHING WITH DB

    return result;
  }

  function appendResult(machineSel: number, result: number, betAmts: number) {
    let tempWins = getWins(machineSel);

    setMachineRolls((prev) => {
      const newPresses = [...prev];
      newPresses[machineSel] = machineRolls[machineSel] + 1;
      return newPresses;
    });

    setLoyaltyStreaks((prev) => {
      const newLoyaltyStreaks = new Array(machineNumber).fill(0);
      newLoyaltyStreaks[machineSel] = prev[machineSel] + 1;
      return newLoyaltyStreaks;
    });

    setResults((prev) => {
      const newResults = [...prev];
      newResults[machineSel] = [...newResults[machineSel], result];
      return newResults;
    });
    if (result < machineSettings[machineSel][0]) {
      setUserAmt((prev) => {
        return prev + machineSettings[machineSel][1] * betAmts;
      });
      const nextWinsBonus = getRollsToWin(
        machineSettings[machineSelected][1],
        machineSettings[machineSelected][0],
        tempWins
      );
      //   tempWins + 1,
      //   machineSettings[machineSelected][1],
      //   nextWinsBonus,
      //   tempWins + 1 >= nextWinsBonus.nextWins
      // );
      if (tempWins + 1 == nextWinsBonus.nextWins) {
        setUserAmt((prev) => {
          return prev + nextWinsBonus.bonus;
        });
      }
      tempWins += 1;
      if (previousResult) {
        setWinStreak((prev) => {
          const newWinStreak = [...prev];
          newWinStreak[machineSel] = newWinStreak[machineSel] + 1;
          return newWinStreak;
        });
      }
      if (winStreak > longestWinStreak) {
        setLongestWinStreak(winStreak);
      }
      setPreviousResult((prev) => {
        const newPreviousResult = [...prev];
        newPreviousResult[machineSel] = true;
        return newPreviousResult;
      });
      //add CelebrationModal for 5 seconds
      setModal(<CelebrationModel coinAmt={machineSettings[machineSel][1]} />);
      setTimeout(() => {
        setModal(null);
      }, 5000);
    } else {
      setWinStreak((prev) => {
        const newWinStreak = [...prev];
        newWinStreak[machineSel] = 0;
        return newWinStreak;
      });
      setPreviousResult((prev) => {
        const newPreviousResult = [...prev];
        newPreviousResult[machineSel] = false;
        return newPreviousResult;
      });
    }
  }

  function increaseBetAmt(machineNumber: number) {
    //increase to next amount based on ALLOWED_ROLL_AMOUNTS until the limit of rolls possible
    //return the highest possible roll amount if the user amount is less than the highest roll amount
    const maxRollsAmt =
      ALLOWED_BET_AMOUNTS[ALLOWED_BET_AMOUNTS.length - 1] > userAmt
        ? userAmt
        : ALLOWED_BET_AMOUNTS[ALLOWED_BET_AMOUNTS.length - 1];
    setMachineBetAmts((prev) => {
      const newBetAmts = [...prev];
      const rollAmtIndex = ALLOWED_BET_AMOUNTS.indexOf(prev[machineNumber]);
      //if index is not found, it must be the max roll amount
      if (rollAmtIndex === -1) {
        newBetAmts[machineNumber] = maxRollsAmt;
      } else if (
        rollAmtIndex + 1 < ALLOWED_BET_AMOUNTS.length &&
        ALLOWED_BET_AMOUNTS[rollAmtIndex + 1] < maxRollsAmt
      ) {
        newBetAmts[machineNumber] = ALLOWED_BET_AMOUNTS[rollAmtIndex + 1];
      } else {
        newBetAmts[machineNumber] = maxRollsAmt;
      }
      return newBetAmts;
    });
  }

  function decreaseBetAmt(machineNumber: number) {
    //decrease to next amount based on ALLOWED_ROLL_AMOUNTS
    setMachineBetAmts((prev) => {
      const newRollAmts = [...prev];
      const rollAmtIndex = ALLOWED_BET_AMOUNTS.indexOf(prev[machineNumber]);
      newRollAmts[machineNumber] =
        ALLOWED_BET_AMOUNTS[rollAmtIndex - 1 < 0 ? 0 : rollAmtIndex - 1];
      return newRollAmts;
    });
  }

  useEffect(() => {
    if (userAmt <= 0) {
      setUserPhase(1);
    }
  }, [userAmt]);

  useEffect(() => {
    for (let i = 0; i < machineNumber; i++) {
      if (machineBetAmts[i] > userAmt) {
        setMachineBetAmts((prev) => {
          const newRollAmts = [...prev];
          newRollAmts[i] = userAmt;
          return newRollAmts;
        });
      }
    }
  }, [machineBetAmts, userAmt]);

  useEffect(() => {
    results.map((result, index) => {
      if (machineMultKnown[index]) return;
      if (result.some((res) => res < machineSettings[index][0])) {
        setMachineMultKnown((prev) => {
          const newMultKnown = [...prev];
          newMultKnown[index] = true;
          return newMultKnown;
        });
      }
    });
  }, [machineMultKnown, machineSettings, results]);

  return machineSettings.length && machineSeeds.length ? (
    <div className="flex flex-col gap-5 items-center justify-center">
      {modal}
      {debug ? <div>User: {userId}</div> : null}
      <div className="flex flex-wrap gap-4">
        <div className="font-arcade text-[32px] mt-4 flex flex-wrap justify-center gap-2">
          <div>TOKENS:</div>
          <div>{userAmt}</div>
        </div>
        <div className="font-arcade text-[32px] mt-4 flex flex-wrap justify-center gap-2">
          <div>WIN TOKENS:</div>
          <div>{userWinAmt}</div>
        </div>
      </div>

      {userPhase < 1 ? (
        <div className="w-full mt-4">
          <div ref={sliderRef} className="keen-slider">
            {machineSeeds.map((seed, index) => {
              return (
                <div
                  key={index}
                  className="keen-slider__slide"
                  style={{
                    opacity: machineSelected === index ? 1 : 0.6,
                  }}
                >
                  <Machine
                    machineNum={index}
                    machineSettings={machineSettings[index]}
                    machineRolls={machineRolls[index]}
                    results={results[index]}
                    getWins={getWins}
                    playBets={playBets}
                    increaseBetAmt={increaseBetAmt}
                    decreaseBetAmt={decreaseBetAmt}
                    setMachineSelected={setMachineSelected}
                    machineBetAmt={machineBetAmts[index]}
                    machineMultKnown={machineMultKnown[index]}
                    loyaltyStreaks={loyaltyStreaks[index]}
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
      {userPhase == 0 ? (
        <Button
          onClick={() => {
            setUserPhase(1);
          }}
        >
          I&apos;LL STOP HERE
        </Button>
      ) : null}

      {debug && machineSelected >= 0 ? (
        <div className="flex flex-col gap-2 w-[80%] items-center justify-center">
          <div className="vintage-box">
            <div className="vintage-box-inner p-4 text-center font-arcade">
              Machine {machineSelected}
            </div>
          </div>
          {debug ? (
            <div>Yield Probability: {machineSettings[machineSelected][0]}</div>
          ) : null}

          {debug ? (
            <div>Yield Multiplier: {machineSettings[machineSelected][1]}</div>
          ) : null}
          {debug ? <div>Press: {machineRolls[machineSelected]}</div> : null}
          {debug ? <div>Seed: {machineSeeds[machineSelected]}</div> : null}
          {debug ? (
            <Button
              className="p-4 "
              onClick={() => {
                play100(machineSelected);
              }}
            >
              Play 100
            </Button>
          ) : null}
          <Button
            className="p-4 "
            onClick={() => {
              play1(machineSelected);
            }}
          >
            Press
          </Button>
          {debug ? (
            <div className="grid gap-2 grid-cols-5">
              {results[machineSelected].map((result, index) => {
                const win = result < machineSettings[machineSelected][0];
                return (
                  <div key={index}>
                    {win ? <strong>{result}</strong> : <span>{result}</span>}
                  </div>
                );
              })}
            </div>
          ) : null}
          <div>
            Win?:
            {results[machineSelected][machineRolls[machineSelected] - 1] <
            machineSettings[machineSelected][0]
              ? "Yes"
              : "No"}
          </div>
          <Button
            className="p-4"
            onClick={() => {
              setUserPhase(2);
            }}
          >
            Stop
          </Button>
        </div>
      ) : null}
    </div>
  ) : null;
}
