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
const BASE_BET = 100;
const PHASES = ["GAME", "RESULTS"];
const ALLOWED_ROLL_AMOUNTS = [1, 5, 10, 100];
const BONUS_TOKENS_AFTER_ROLLS: { [key: string]: number } = {
  10: 100,
  50: 300,
  200: 1000,
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
          let probability = genYieldProbabilities(rand);
          switch (multiplier) {
            case 2:
              probability *= 0.5;
              break;
            case 3:
              probability *= 0.3;
              break;
            case 4:
              probability *= 0.1;
              break;
            case 5:
              probability *= 0.05;
              break;
            case 10:
              probability *= 0.01;
              break;
          }
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

  const [results, setResults] = useState<number[][]>(
    [...Array(machineNumber)].map(() => {
      return [];
    })
  );

  //if user is logged in, get user amount from server
  const [userAmt, setUserAmt] = useState<number>(1000);
  //phase 0: game phase
  //phase 1: end phase
  const [userPhase, setUserPhase] = useState<number>(0);

  const [machineRollAmts, setMachineRollAmts] = useState<number[]>(
    [...Array(machineNumber)].map(() => {
      return ALLOWED_ROLL_AMOUNTS[0];
    })
  );

  const [bonusClaimed, setBonusClaimed] = useState<boolean[][]>(
    [...Array(machineNumber)].map((_, index) => {
      return Object.keys(BONUS_TOKENS_AFTER_ROLLS).map((base, idx) => {
        return machineRollAmts[index] >= parseInt(base);
      });
    })
  );

  //if winning streak, increase base bet amount
  const [previousResult, setPreviousResult] = useState<boolean>(false);
  const [winStreak, setWinStreak] = useState<number>(0);
  const [longestWinStreak, setLongestWinStreak] = useState<number>(0);
  //grant bonus tokens if amount of bet tokens on it 3 tiers 100, 250, 500
  const [machineSelected, setMachineSelected] = useState<number>(0);
  const [lastestRollsResults, setLatestRollsResults] = useState<boolean[]>([]);

  //for debugging purposes
  function play1(machineSelected: number) {
    if (userPhase > 0) return;
    setUserAmt((prev) => {
      return prev - 1;
    });
    //TODO make sure to get machine press as a request FIRST FROM SERVER TO PREVENT MULTI PRESS AND MULTI-TAB SIGN-IN
    const machinePressed = machineRolls[machineSelected] + 1;
    setMachineSeeds((prev) => {
      const newSeeds = [...prev];
      newSeeds[machineSelected] =
        dt +
        (machineSettings[machineSelected][0] * 100).toFixed(0) +
        machineSettings[machineSelected][1].toString() +
        machinePressed;
      return newSeeds;
    });

    setMachineRolls((prev) => {
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
    const tempMachinePress = machineRolls[machineSelected];
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
    setMachineRolls((prev) => {
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

  function playRolls(machineSelected: number, rollAmts: number) {
    const tempMachinePress = machineRolls[machineSelected];
    const tempResults: number[] = [];
    if (userPhase > 1 && userAmt < rollAmts * BASE_BET && userAmt > 0) return;
    //GET MACHINE PRESSES FIRST FROM SERVER TO PREVENT MULTI PRESS AND MULTI-TAB SIGN-IN
    for (let i = 0; i < rollAmts; i++) {
      setUserAmt((prev) => {
        return prev - BASE_BET;
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
        if (result < machineSettings[machineSelected][0]) {
          setUserAmt((prev) => {
            return prev + machineSettings[machineSelected][1] * BASE_BET;
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
    }
    setMachineRolls((prev) => {
      const newPresses = [...prev];
      newPresses[machineSelected] = tempMachinePress + rollAmts;
      return newPresses;
    });
    setMachineSeeds((prev) => {
      const newSeeds = [...prev];
      newSeeds[machineSelected] =
        dt +
        (machineSettings[machineSelected][0] * 100).toFixed(0) +
        machineSettings[machineSelected][1].toString() +
        (tempMachinePress + rollAmts);
      return newSeeds;
    });
    console.log(tempResults);
    //TODO MAKE SURE TO GET MACHINE RESULTS FIRST FROM SERVER TO PREVENT RACE CRASH AND MATCHING WITH DB
    setResults((prev) => {
      const newResults = [...prev];
      newResults[machineSelected] = [
        ...newResults[machineSelected],
        ...tempResults,
      ];
      return newResults;
    });

    //give bonus tokens only when using not switched
    Object.keys(BONUS_TOKENS_AFTER_ROLLS).map((base, idx) => {
      const bonusBase = parseInt(base);
      if (
        machineRolls[machineSelected] + rollAmts >= bonusBase &&
        !bonusClaimed[machineSelected][idx]
      ) {
        setUserAmt((prev) => {
          return prev + BONUS_TOKENS_AFTER_ROLLS[base];
        });
        setBonusClaimed((prev) => {
          const newBonusClaimed = [...prev];
          newBonusClaimed[machineSelected][idx] = true;
          return newBonusClaimed;
        });
      }
    });
  }

  function increaseRollAmt(machineNumber: number) {
    //increase to next amount based on ALLOWED_ROLL_AMOUNTS until the limit of rolls possible
    //return the highest possible roll amount if the user amount is less than the highest roll amount
    const maxRollsAmt =
      ALLOWED_ROLL_AMOUNTS[ALLOWED_ROLL_AMOUNTS.length - 1] > userAmt / BASE_BET
        ? userAmt / BASE_BET
        : ALLOWED_ROLL_AMOUNTS[ALLOWED_ROLL_AMOUNTS.length - 1];
    console.log(maxRollsAmt);
    setMachineRollAmts((prev) => {
      const newRollAmts = [...prev];
      const rollAmtIndex = ALLOWED_ROLL_AMOUNTS.indexOf(prev[machineNumber]);
      //if index is not found, it must be the max roll amount
      if (rollAmtIndex === -1) {
        newRollAmts[machineNumber] = maxRollsAmt;
      } else if (
        rollAmtIndex + 1 < ALLOWED_ROLL_AMOUNTS.length &&
        ALLOWED_ROLL_AMOUNTS[rollAmtIndex + 1] < maxRollsAmt
      ) {
        newRollAmts[machineNumber] = ALLOWED_ROLL_AMOUNTS[rollAmtIndex + 1];
      } else {
        newRollAmts[machineNumber] = maxRollsAmt;
      }
      return newRollAmts;
    });
  }

  function decreaseRollAmt(machineNumber: number) {
    //decrease to next amount based on ALLOWED_ROLL_AMOUNTS
    setMachineRollAmts((prev) => {
      const newRollAmts = [...prev];
      const rollAmtIndex = ALLOWED_ROLL_AMOUNTS.indexOf(prev[machineNumber]);
      newRollAmts[machineNumber] =
        ALLOWED_ROLL_AMOUNTS[rollAmtIndex - 1 < 0 ? 0 : rollAmtIndex - 1];
      return newRollAmts;
    });
  }

  useEffect(() => {
    if (userAmt <= 0) {
      setUserPhase(1);
    }
  }, [userAmt]);

  useEffect(() => {
    if (machineRollAmts.some((bet) => bet > userAmt)) {
      setMachineRollAmts((prev) => {
        return prev.map((bet) => {
          return bet > userAmt ? userAmt : bet;
        });
      });
    }
  }, [machineRollAmts, userAmt]);

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
                              decreaseRollAmt(index);
                            }}
                          >
                            -
                          </Button>
                          <Button
                            onClick={() => {
                              playRolls(index, machineRollAmts[index]);
                            }}
                          >
                            ROLL {machineRollAmts[index]}
                          </Button>
                          <Button
                            onClick={() => {
                              increaseRollAmt(index);
                            }}
                          >
                            +
                          </Button>
                        </div>
                        <div className="font-arcade text-black text-[20px]">
                          Machine {index}
                        </div>

                        <div className="w-full flex flex-col items-center justify-center gap-1">
                          <div className="">ROLLS: BONUS TOKENS</div>
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
                                  : Object.entries(BONUS_TOKENS_AFTER_ROLLS)[
                                      idx
                                    ].join(": +")}
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
                        <div className="flex flex-col gap-2 w-full items-center justify-center pb-4">
                          <div>Number of Rolls: </div>
                          <div className="font-arcade w-full text-center text-[32px]">
                            {machineRolls[index]}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 w-full items-center justify-center">
                          <div>Your Win Rate:</div>
                          <div className="font-arcade w-full text-center text-[32px]">
                            {machineRolls[index] !== 0
                              ? (
                                  (results[index].filter(
                                    (result) =>
                                      result < machineSettings[index][0]
                                  ).length /
                                    machineRolls[index]) *
                                  100
                                ).toFixed(2) + "%"
                              : 0}
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
