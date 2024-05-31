"use client";

import Button from "@/components/Button";
import EmblaCarousel from "@/components/EmblaCarousel";
import { genYieldMultiplier, genYieldProbabilities } from "@/utils/yields";
import { EmblaOptionsType } from "embla-carousel";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import seedrandom from "seedrandom";

const OPTIONS: EmblaOptionsType = { loop: true };
const PHASES = ["Exploration", "Results"];
const BASE_BET = 100;
const INCREMENT_BET = 100;
const MAX_BET = 10000;
const BONUS_TOKENS: { [key: string]: number } = {
  500: 100,
  1000: 300,
  4000: 1000,
};

export default function Gamba() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  let userId = "hello";
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

  const [machinePresses, setMachinePresses] = useState<number[]>(
    [...Array(machineNumber)].map(() => {
      return 0;
    })
  );

  const machineSettings = useMemo<number[][]>(
    () =>
      [...Array(machineNumber)]
        .map(() => {
          return [genYieldProbabilities(rand) * 0.7, genYieldMultiplier(rand)];
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
        machinePresses[index]
      );
    });
  });

  const [results, setResults] = useState<number[][]>(
    [...Array(machineNumber)].map(() => {
      return [];
    })
  );

  //if user is logged in, get user amount from server
  const [userAmt, setUserAmt] = useState<number>(1000);
  //phase 0: exploration phase
  //phase 1: end phase
  const [userPhase, setUserPhase] = useState<number>(0);
  const [machineBetAmts, setMachineBetAmts] = useState<number[]>(
    [...Array(machineNumber)].map(() => {
      return BASE_BET;
    })
  );

  const [totalMachineBetAmts, setTotalMachineBetAmts] = useState<number[]>(
    [...Array(machineNumber)].map(() => {
      return 0;
    })
  );

  const [bonusClaimed, setBonusClaimed] = useState<boolean[][]>(
    [...Array(machineNumber)].map((_, index) => {
      return Object.keys(BONUS_TOKENS).map((base, idx) => {
        return totalMachineBetAmts[index] >= parseInt(base);
      });
    })
  );

  //if winning streak, increase base bet amount
  const [previousResult, setPreviousResult] = useState<boolean>(false);
  const [winStreak, setWinStreak] = useState<number>(0);
  const [longestWinStreak, setLongestWinStreak] = useState<number>(0);
  //grant bonus yield if exploitation phase
  //grant bonus tokens if amount of bet tokens on it 3 tiers 100, 250, 500
  const [machineSelected, setMachineSelected] = useState<number>(0);

  //for debugging purposes
  function play1(machineSelected: number) {
    if (userPhase > 0) return;
    setUserAmt((prev) => {
      return prev - 1;
    });
    setTotalMachineBetAmts((prev) => {
      const newTotalBets = [...prev];
      newTotalBets[machineSelected] = newTotalBets[machineSelected] + 1;
      return newTotalBets;
    });
    //TODO make sure to get machine press as a request FIRST FROM SERVER TO PREVENT MULTI PRESS AND MULTI-TAB SIGN-IN
    const machinePressed = machinePresses[machineSelected] + 1;
    setMachineSeeds((prev) => {
      const newSeeds = [...prev];
      newSeeds[machineSelected] =
        dt +
        (machineSettings[machineSelected][0] * 100).toFixed(0) +
        machineSettings[machineSelected][1].toString() +
        machinePressed;
      return newSeeds;
    });

    setMachinePresses((prev) => {
      const newPresses = [...prev];
      newPresses[machineSelected] = machinePressed;
      return newPresses;
    });

    if (machineSeeds[machineSelected]) {
      const result = seedrandom(machineSeeds[machineSelected])();
      setResults((prev) => {
        const newResults = [...prev];
        newResults[machineSelected] = [...newResults[machineSelected], result];
        return newResults;
      });
      if (result < machineSettings[machineSelected][0]) {
        setUserAmt((prev) => {
          return prev + machineSettings[machineSelected][1];
        });
      }
    }
  }

  //for debugging purposes
  function play100(machineSelected: number) {
    const tempMachinePress = machinePresses[machineSelected];
    setTotalMachineBetAmts((prev) => {
      const newTotalBets = [...prev];
      newTotalBets[machineSelected] = newTotalBets[machineSelected] + 100;
      return newTotalBets;
    });
    const tempResults: number[] = [];
    for (let i = 0; i < 100; i++) {
      setUserAmt((prev) => {
        return prev - 1;
      });
      const machinePressed = tempMachinePress + i;
      const machineSeed =
        dt +
        (machineSettings[machineSelected][0] * 100).toFixed(0) +
        machineSettings[machineSelected][1].toString() +
        machinePressed;

      if (machineSeeds[machineSelected]) {
        const result = seedrandom(machineSeed)();
        tempResults.push(result);
      }
    }
    setMachinePresses((prev) => {
      const newPresses = [...prev];
      newPresses[machineSelected] = tempMachinePress + 100;
      return newPresses;
    });
    setMachineSeeds((prev) => {
      const newSeeds = [...prev];
      newSeeds[machineSelected] =
        dt +
        (machineSettings[machineSelected][0] * 100).toFixed(0) +
        machineSettings[machineSelected][1].toString() +
        (tempMachinePress + 100);
      return newSeeds;
    });
    setResults((prev) => {
      const newResults = [...prev];
      newResults[machineSelected] = [
        ...newResults[machineSelected],
        ...tempResults,
      ];
      return newResults;
    });
  }

  function playBet(machineSelected: number, betAmt: number) {
    if (userPhase > 1 && userAmt < betAmt && userAmt > 0) return;
    setUserAmt((prev) => {
      return prev - betAmt;
    });
    setTotalMachineBetAmts((prev) => {
      const newTotalBets = [...prev];
      newTotalBets[machineSelected] = newTotalBets[machineSelected] + betAmt;
      return newTotalBets;
    });
    //GET MACHINE PRESSES FIRST FROM SERVER TO PREVENT MULTI PRESS AND MULTI-TAB SIGN-IN
    const machinePressed = machinePresses[machineSelected] + 1;
    setMachineSeeds((prev) => {
      const newSeeds = [...prev];
      newSeeds[machineSelected] =
        dt +
        (machineSettings[machineSelected][0] * 100).toFixed(0) +
        machineSettings[machineSelected][1].toString() +
        machinePressed;
      return newSeeds;
    });

    setMachinePresses((prev) => {
      const newPresses = [...prev];
      newPresses[machineSelected] = machinePressed;
      return newPresses;
    });

    if (machineSeeds[machineSelected]) {
      const result = seedrandom(machineSeeds[machineSelected])();
      setResults((prev) => {
        const newResults = [...prev];
        newResults[machineSelected] = [...newResults[machineSelected], result];
        return newResults;
      });
      if (result < machineSettings[machineSelected][0]) {
        setUserAmt((prev) => {
          return prev + machineSettings[machineSelected][1] * betAmt;
        });
        setWinStreak((prev) => {
          return prev + 1;
        });
        if (winStreak > longestWinStreak) {
          setLongestWinStreak(winStreak);
        }
        setPreviousResult(true);
      } else {
        setWinStreak(0);
        setPreviousResult(false);
      }
    }
    //give bonus tokens
    Object.keys(BONUS_TOKENS).map((base, idx) => {
      const bonusBase = parseInt(base);
      if (
        totalMachineBetAmts[machineSelected] + betAmt >= bonusBase &&
        !bonusClaimed[machineSelected][idx]
      ) {
        setUserAmt((prev) => {
          return prev + BONUS_TOKENS[base];
        });
        setBonusClaimed((prev) => {
          const newBonusClaimed = [...prev];
          newBonusClaimed[machineSelected][idx] = true;
          return newBonusClaimed;
        });
      }
    });
  }

  function increaseBetAmt(machineNumber: number) {
    setMachineBetAmts((prev) => {
      const newBets = [...prev];
      const nextBet = newBets[machineNumber] + INCREMENT_BET;
      if (nextBet > MAX_BET) {
        newBets[machineNumber] = MAX_BET;
      } else if (nextBet > userAmt && nextBet < userAmt) {
        newBets[machineNumber] = userAmt;
      } else {
        newBets[machineNumber] = nextBet;
      }
      return newBets;
    });
  }

  function decreaseBetAmt(machineNumber: number) {
    setMachineBetAmts((prev) => {
      const newBets = [...prev];
      const nextBet = newBets[machineNumber] - INCREMENT_BET;
      if (nextBet < BASE_BET) {
        newBets[machineNumber] = BASE_BET;
      } else {
        newBets[machineNumber] = newBets[machineNumber] - INCREMENT_BET;
      }

      return newBets;
    });
  }

  useEffect(() => {
    if (userAmt <= 0) {
      setUserPhase(1);
    }
  }, [userAmt]);

  useEffect(() => {
    if (machineBetAmts.some((bet) => bet > userAmt)) {
      setMachineBetAmts((prev) => {
        return prev.map((bet) => {
          return bet > userAmt ? userAmt : bet;
        });
      });
    }
  }, [machineBetAmts, userAmt]);

  return machineSettings.length && machineSeeds.length ? (
    <div className="flex flex-col gap-5 items-center justify-center">
      {debug ? <div>User: {userId}</div> : null}
      <div className="font-arcade text-[32px] mt-4 flex flex-wrap justify-center gap-2">
        <div>TOKENS:</div>
        <div>{userAmt}</div>
      </div>
      {userPhase < 1 ? (
        <div className="w-full mt-4">
          <EmblaCarousel options={OPTIONS}>
            <div className="embla__container flex items-center justify-center">
              {machineSeeds.map((seed, index) => {
                return (
                  <div key={index} className="embla__slide">
                    <div className="vintage-box mb-2">
                      <div className="vintage-box-inner flex flex-col gap-2 items-center p-4 font-ms">
                        <div className="flex justify-between w-full">
                          <Button
                            onClick={() => {
                              decreaseBetAmt(index);
                            }}
                          >
                            -
                          </Button>
                          <Button
                            onClick={() => {
                              playBet(index, machineBetAmts[index]);
                            }}
                          >
                            BET {machineBetAmts[index]}
                          </Button>
                          <Button
                            onClick={() => {
                              increaseBetAmt(index);
                            }}
                          >
                            +
                          </Button>
                        </div>
                        <div className="font-arcade text-black text-[20px]">
                          Machine {index}
                        </div>

                        <div>Total Bet Amount:</div>
                        <div className="font-arcade w-full text-center text-[32px]">
                          {totalMachineBetAmts[index]}
                        </div>

                        <div className="w-full flex flex-col items-center justify-center gap-1">
                          <div className="font-arcade">BONUS</div>
                          {bonusClaimed[index].map((claimed, idx) => {
                            return (
                              <div
                                key={idx}
                                className="w-full text-center p-2 uppercase border-2 border-black"
                                style={{
                                  backgroundColor: claimed ? "black" : "white",
                                  color: claimed ? "white" : "black",
                                }}
                              >
                                {claimed
                                  ? "Claimed"
                                  : Object.entries(BONUS_TOKENS)[idx].join(
                                      ": +"
                                    )}
                              </div>
                            );
                          })}
                        </div>
                        {debug ? (
                          <div>
                            Yield Probability:{" "}
                            {(machineSettings[index][0] * 100).toFixed(2)}
                          </div>
                        ) : null}
                        {debug ? (
                          <div>
                            Yield Multiplier: {machineSettings[index][1]}
                          </div>
                        ) : null}
                        {debug ? <div>Seed: {seed}</div> : null}
                        {debug ? (
                          <div>
                            Wins:{" "}
                            {
                              results[index].filter(
                                (result) => result < machineSettings[index][0]
                              ).length
                            }
                          </div>
                        ) : null}

                        <div className="flex flex-col gap-2 w-full items-center justify-center">
                          <div>Your Win Rate:</div>
                          <div className="font-arcade w-full text-center text-[32px]">
                            {machinePresses[index] !== 0
                              ? (
                                  (results[index].filter(
                                    (result) =>
                                      result < machineSettings[index][0]
                                  ).length /
                                    machinePresses[index]) *
                                  100
                                ).toFixed(2) + "%"
                              : 0}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 w-full items-center justify-center pb-4">
                          <div>Number of Bets: </div>
                          <div className="font-arcade w-full text-center text-[32px]">
                            {machinePresses[index]}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </EmblaCarousel>
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
          {debug ? <div>Press: {machinePresses[machineSelected]}</div> : null}
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
            {results[machineSelected][machinePresses[machineSelected] - 1] <
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
