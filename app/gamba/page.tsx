"use client";

import { genYieldMultiplier, genYieldProbabilities } from "@/utils/yields";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import seedrandom from "seedrandom";

export default function Gamba() {
  const { data: session } = useSession();
  let userId = "hello"; //get userid
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
  const [machineSeeds,setMachineSeeds] = useState<string[]>(() => {
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
      return [0];
    })
  );

  const [machineSelected, setMachineSelected] = useState<number>(0);

  function test100(machineSelected: number){
    const tempMachinePress = machinePresses[machineSelected];
    const tempMachineSeed = machineSeeds[machineSelected];
    const tempResults: number[] = [];
    for(let i = 0; i < 100; i++){
      const machinePressed = tempMachinePress + i;
      const machineSeed =
          dt +
          (machineSettings[machineSelected][0] * 100).toFixed(0) +
          machineSettings[machineSelected][1].toString() +
          machinePressed
      
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
      newSeeds[machineSelected] = dt +
      (machineSettings[machineSelected][0] * 100).toFixed(0) +
      machineSettings[machineSelected][1].toString() + (tempMachinePress + 100);
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

  //create a new machine with seed of date + mult + yield + userId
  //record number of each time machine is pressed
  //add to seed num of times machine is pressed to retain same rng for each roll even after refresh
  return machineSettings.length && machineSeeds.length ? (
    <div className="flex flex-col gap-5">
      <div>User: {userId}</div>
      <div className="flex gap-2">
        {machineSeeds.map((seed, index) => {
          return (
            <div key={index}>
              <button
                onClick={() => {
                  setMachineSelected(index);
                }}
                className="px-3 py-2 bg-black"
              >
                Machine {index}
              </button>
              <div>
                Yield Probability: {(machineSettings[index][0] * 100).toFixed(2)}
              </div>
              <div>Yield Multiplier: {machineSettings[index][1]}</div>
              <div>Seed: {seed}</div>
              <div>
                AVG Win rate:
                {machinePresses[index] !== 0
                  ? (results[index].filter(
                      (result) => result < machineSettings[index][0]
                    ).length / machinePresses[index] * 100).toFixed(2) + "%"
                  : 0}
              </div>
              <div>Presses: {machinePresses[index]}</div>
            </div>
          );
        })}
      </div>
      {machineSelected >= 0 ? (
        <div className="flex gap-2">
          <div className="flex flex-col gap-2">
            <div className="px-3 py-2 bg-black">Machine {machineSelected}</div>

            <div>Seed: {machineSeeds[machineSelected]}</div>
            <button
              className="p-4 bg-black"
              onClick={() => {
              test100(machineSelected);
              }}
            >
              Test 100
            </button>
            <button
              className="p-4 bg-black"
              onClick={() => {
                //GET MACHINE PRESSES FIRST FROM SERVER TO PREVENT MULTI PRESS AND MULTI-TAB SIGN-IN
                
                const machinePressed = machinePresses[machineSelected] + 1;
                setMachineSeeds((prev) => {
                  const newSeeds = [...prev];
                  newSeeds[machineSelected] =
                    dt +
                    (machineSettings[machineSelected][0] * 100).toFixed(0) +
                    machineSettings[machineSelected][1].toString() +
                    machinePressed
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
            </button>
            <div>
              Win?:
              {results[machineSelected][machinePresses[machineSelected]] <
              machineSettings[machineSelected][0]
                ? "Yes"
                : "No"}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  ) : null;
}
