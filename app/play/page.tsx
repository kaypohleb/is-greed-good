"use client";

import Button from "@/components/Button";
import EmblaCarousel from "@/components/EmblaCarousel";
import { genYieldMultiplier, genYieldProbabilities } from "@/utils/yields";
import { EmblaOptionsType } from "embla-carousel";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import seedrandom from "seedrandom";

const OPTIONS: EmblaOptionsType = { loop: true };

export default function Gamba() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  let userId = "hello";
  let debug = searchParams.get("hiddendebug") || false;

  console.log(session);

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
          return [genYieldProbabilities(rand), genYieldMultiplier(rand)];
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

  const [machineSelected, setMachineSelected] = useState<number>(0);

  function test100(machineSelected: number) {
    const tempMachinePress = machinePresses[machineSelected];
    const tempMachineSeed = machineSeeds[machineSelected];
    const tempResults: number[] = [];
    for (let i = 0; i < 100; i++) {
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

  return machineSettings.length && machineSeeds.length ? (
    <div className="flex flex-col gap-5 items-center justify-center">
      {debug ? <div>User: {userId}</div> : null}
      <div className="w-full mt-4">
        <EmblaCarousel options={OPTIONS}>
          <div className="embla__container flex items-center">
            {machineSeeds.map((seed, index) => {
              return (
                <div key={index} className="embla__slide">
                  <div className="vintage-box">
                    <div className="vintage-box-inner flex flex-col gap-2 items-start p-4 font-ms">
                      <Button
                        className="w-full"
                        onClick={() => {
                          setMachineSelected(index);
                        }}
                      >
                        PICK
                      </Button>

                      <div className="font-arcade text-black text-[20px]">
                        Machine {index}
                      </div>
                      {debug ? (
                        <div>
                          Yield Probability:{" "}
                          {(machineSettings[index][0] * 100).toFixed(2)}
                        </div>
                      ) : null}

                      {debug ? (
                        <div>Yield Multiplier: {machineSettings[index][1]}</div>
                      ) : null}
                      {debug ? <div>Seed: {seed}</div> : null}
                      {debug ? <div>Wins: {results[index].filter(
                                  (result) => result < machineSettings[index][0]
                                ).length}</div> : null}
                      <div className="flex flex-col gap-2 w-full items-center justify-center">
                        <div>Your Win Rate:</div>
                        <div className="font-arcade w-full text-center text-[32px]">
                          {machinePresses[index] !== 0
                            ? (
                                (results[index].filter(
                                  (result) => result < machineSettings[index][0]
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
      {machineSelected >= 0 ? (
        <div className="flex flex-col gap-2 w-[80%] items-center justify-center">
          <div className="vintage-box">
            <div className="vintage-box-inner p-4 text-center font-arcade">
              Machine {machineSelected}
            </div>
          </div>
          {debug ? <div>Seed: {machineSeeds[machineSelected]}</div> : null}
          {debug ? (
            <Button
              className="p-4 "
              onClick={() => {
                test100(machineSelected);
              }}
            >
              Test 100
            </Button>
          ) : null}
          <Button
            className="p-4 "
            onClick={() => {
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
                  newResults[machineSelected] = [
                    ...newResults[machineSelected],
                    result,
                  ];
                  return newResults;
                });
              }
            }}
          >
            Press
          </Button>
          <div>
            Win?:
            {results[machineSelected][machinePresses[machineSelected]] <
            machineSettings[machineSelected][0]
              ? "Yes"
              : "No"}
          </div>
        </div>
      ) : null}
    </div>
  ) : null;
}
