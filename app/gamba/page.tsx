"use client";

import { genYieldMultiplier, genYieldProbabilities } from "@/utils/yields";
import { useState } from "react";
import seedrandom from "seedrandom";

export default function Gamba() {
  const dt = new Date().getDate().toString();
  const rand = seedrandom(dt);
  const userId =  "hello"; //get userid

  const machineNumber = 5;
  const [machineSettings, setMachineSettings] = useState<number[][]>([...Array(machineNumber)].map(() => {
    return [genYieldProbabilities(rand), genYieldMultiplier(rand)];
  }));
  const [machineSeeds, setMachineSeeds] = useState<string[]>(
    [...Array(machineNumber)].map((_, index) => {
      return (
        dt.toString() +
        (machineSettings[index][0] + machineSettings[index][1]).toString() +
        userId
      );
    })
  );
  const [machinePresses, setMachinePresses] = useState<number[]>([...Array(machineNumber)].map(() => {
    return 0;
  }));
  const [results, setResults] = useState<number[]>([...Array(machineNumber)].map(() => {
    return 0;
  }));
  const [testResults, setTestResults] = useState<number[][]>([...Array(machineNumber)].map(() => {
    return [];
  }));
  //create a new machine with seed of date + mult + yield + userId
  //record number of each time machine is pressed
  //add to seed num of times machine is pressed to retain same rng for each roll even after refresh
  return machineSettings.length && machineSeeds.length ? (
    <div className="flex flex-col">
      {machineSeeds.map((seed, index) => {
        return (
          <div key={index}>
            <br></br>
            <div>Machine {index}</div>
            <div>Yield Probability: {machineSettings[index][0]}</div>
            <div>Yield Multiplier: {machineSettings[index][1]}</div>
            <div>Seed: {seed}</div>
            <button className="p-4 bg-black" onClick={
              () => {
                const testResults: number[] = [];
                for (let i = 0; i < 100; i++) {
                  const result = seedrandom(seed + i)();
                  testResults.push(result);
                }
                setTestResults((prev) => {
                  const newTestResults = [...prev];
                  newTestResults[index] = testResults;
                  return newTestResults;
                });
              }
            
            }>Test 100</button>
    
            <div> AVG win rate: {testResults[index].filter((result)=> result < machineSettings[index][0]).length / 100} </div>
            <div>Presses: {machinePresses[index]}</div>
            <button
              className="p-4 bg-black"
              onClick={() => {
                //GET MACHINE PRESSES FIRST FROM SERVER TO PREVENT MULTI PRESS AND MULTI-TAB SIGN-IN
                setMachinePresses((prev) => {
                  const newPresses = [...prev];
                  newPresses[index] = newPresses[index] + 1;
                  return newPresses;
                });
                setMachineSeeds((prev) => {
                  const newSeeds = [...prev];
                  newSeeds[index] = newSeeds[index] + machinePresses[index];
                  return newSeeds;
                });
                if (machineSeeds[index]) {
                  const result = seedrandom(machineSeeds[index])();
                  setResults((prev) => {
                    const newResults = [...prev];
                    newResults[index] = result;
                    return newResults;
                  });
                }
              }}
            >
              Press
            </button>
            <div>Latest Result: {results[index]}</div>
            <div>Win?: {results[index] < machineSettings[index][0] ? "Yes" : "No"}</div>
          </div>
        );
      })}
    </div>
  ) : null;
}

function getUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}