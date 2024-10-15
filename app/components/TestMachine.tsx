"use client";
import { Dispatch, SetStateAction, useState } from "react";
import seedrandom from "seedrandom";
import Image from "next/image";
import TickCoin from "@assets/images/tick-coin.gif";
import CrossCoin from "@assets/images/cross-coin.gif";
import VendingBaseImage from "@assets/images/vending-1.png";
import VendingBaseImage2 from "@assets/images/vending-2.png";
import anime, { set } from "animejs";

export default function GambaMachine({
  dt,
  machineSettings,
  machineSeeds,
  setMachineSeeds,
  machinePresses,
  setMachinePresses,
  machineSelected,
  results,
  setResults,
}: {
  dt: string;
  machineSettings: number[][];
  machineSeeds: string[];
  setMachineSeeds: Dispatch<SetStateAction<string[]>>;
  machinePresses: number[];
  setMachinePresses: Dispatch<SetStateAction<number[]>>;
  machineSelected: number;
  results: number[][];
  setResults: Dispatch<SetStateAction<number[][]>>;
}) {
  const [latestResult, setLatestResult] = useState<boolean | null>(
    results[machineSelected][results[machineSelected].length - 1] <
      machineSettings[machineSelected][0] || null
  );
  function test100(machineSelected: number) {
    const tempMachinePress = machinePresses[machineSelected];
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

  function bet(amt: number) {
    //GET MACHINE PRESSES FIRST FROM SERVER TO PREVENT MULTI PRESS AND MULTI-TAB SIGN-IN
    if (latestResult) return;
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
      const condition = result < machineSettings[machineSelected][0];
      setLatestResult(condition);
      if (condition) {
        anime({
          targets: "#tick-coin",
          translateY: {
            value: "-100%",
            duration: 500,
            easing: "easeInOutSine",
          },
          easing: "easeInOutSine",
          complete: () => {
            anime({
              targets: "#tick-coin",
              translateY: "0%",
              duration: 500,
              easing: "easeInOutSine",
            });
          },
        });
      } else {
        anime({
          targets: "#cross-coin",
          translateY: {
            value: "-100%",
            duration: 500,
            easing: "easeInOutSine",
          },
          easing: "easeInOutSine",
          complete: () => {
            anime({
              targets: "#cross-coin",
              translateY: "0%",
              duration: 500,
              easing: "easeInOutSine",
            });
          },
        });
      }
      setResults((prev) => {
        const newResults = [...prev];
        newResults[machineSelected] = [...newResults[machineSelected], result];
        return newResults;
      });
      setLatestResult(null);
    }
  }
  return (
    <div className="w-full h-full">
      <div className="px-3 py-2 bg-black text-white">
        Machine {machineSelected}
      </div>

      <div>Seed: {machineSeeds[machineSelected]}</div>
      <button
        className="p-4 bg-black text-white"
        onClick={() => {
          test100(machineSelected);
        }}
      >
        Test 100
      </button>
      <button className="p-4 bg-black text-white" onClick={() => bet(0)}>
        Press
      </button>
      <div>
        Win?:
        {latestResult ? "Yes" : "No"}
      </div>
      <div className="relative w-[360px] h-[360px]">
        <Image
          className="absolute bottom-0 left-0 z-20 object-contain"
          src={VendingBaseImage2}
          fill={true}
          alt="vending_base_2"
        />
        <div className="w-1/2 h-1/2 absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/3 z-20">
          <Image
            id="tick-coin"
            className="object-contain"
            src={TickCoin}
            fill={true}
            alt="result_icon"
          />
        </div>
        <div className="w-1/2 h-1/2 absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/3 z-20">
          <Image
            id="cross-coin"
            className="object-contain"
            src={CrossCoin}
            fill={true}
            alt="result_icon"
          />
        </div>
        <Image
          className="absolute bottom-0 left-0 z-0 object-contain"
          src={VendingBaseImage}
          fill={true}
          alt="vending_base_1"
        />
      </div>
      <div>
        AVG Win Rate:
        {machinePresses[machineSelected] !== 0
          ? (
              (results[machineSelected].filter(
                (result) => result < machineSettings[machineSelected][0]
              ).length /
                machinePresses[machineSelected]) *
              100
            ).toFixed(2) + "%"
          : 0}
      </div>
      <div>Presses: {machinePresses[machineSelected]}</div>
      <div>
        Results:
        {results[machineSelected].map((result, index) => (
          <div key={index}>
            {result < machineSettings[machineSelected][0] ? "Y" : "N"}
          </div>
        ))}
      </div>
    </div>
  );
}
