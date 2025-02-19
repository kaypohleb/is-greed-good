"use client";
import DummyImage from "@assets/images/dummy_320x320_ffffff_cccccc.png";
import ImageLinkButton from "../../components/ImageLinkButton";
import { DIFFICULTY_LEVELS } from "@/constants";
import { useState } from "react";
import Button from "../../components/Button";
export default function GameMenu() {
  const [difficulty, setDifficulty] = useState(DIFFICULTY_LEVELS[0]);
  return (
    <div className="relative text-black w-full h-screen-nav flex flex-col items-center justify-center gap-4">
      <div className="text-center uppercase font-arcade text-[24px]">Select Difficulty</div>
      
      <div className="flex flex-row flex-wrap gap-1">
        {DIFFICULTY_LEVELS.map((diff) => {
          return (
            <Button key={`button-${diff}`} onClick={() => setDifficulty(diff)}>
              {diff}
            </Button>
          );
        })}
      </div>
      <div className="text-center font-arcade">{difficulty}</div>
      <div className="flex flex-row gap-4 flex-wrap">
        <ImageLinkButton
          src={DummyImage}
          href={`/games/HEIST/DAILY/${difficulty}/`}
          caption={"Heist"}
        />
        <ImageLinkButton
          src={DummyImage}
          href={`/games/COINCROSS/DAILY/${difficulty}`}
          caption={"CoinCross"}
        />
        <ImageLinkButton
          src={DummyImage}
          href={`/games/COINBALLOON/DAILY/${difficulty}`}
          caption={"CoinFlip"}
        />
        <ImageLinkButton
          src={DummyImage}
          href={`/games/PLINKO/DAILY/${difficulty}`}
          caption={"Plinko"}
          />
      </div>
    </div>
  );
}
