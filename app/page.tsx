"use client";
import LinkButton from "@components/LinkButton";
import Window from "@components/Window";
import FallingSpriteBackground from "@components/FallingSpriteBackground";
import { DIFFICULTY_LEVELS, GAME_MODE } from "./constants";
import { useState } from "react";
import Button from "@components/Button";

export default function Home() {
  const [curGameMode, setCurGameMode] = useState("");
  const [difficultyDrawerOpen, setDifficultyDrawerOpen] = useState(false);
  return (
    <main className="relative text-black w-full h-screen-nav flex flex-col items-center justify-center coinbg gap-4">
      <FallingSpriteBackground
        zIndex={-3}
        spriteXSize={160}
        spriteYSize={160}
        numberOfSprites={16}
        acceleration={0.01}
        displayXSize={48}
        displayYSize={48}
        startingYPos={0}
      />
      <Window title="" float>
        <div className="flex flex-col items-center justify-center coinbg gap-4 p-4">
          <div className="text-[64px] font-arcade text-center border-black border py-2 px-4">
            BEATING <br />
            THE HOUSE
          </div>
          <div className="font-ms max-w-[640px] text-[14px]">
            Use your wit, luck and skill to beat the house with every choice
            having both uncertainties and outcomes.
            <br />
            Luck may roll the slots, but effort controls the outcome.
          </div>
          <div className="flex gap-4 ">
            {!difficultyDrawerOpen &&
              GAME_MODE.map((mode, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center border-1"
                >
                  <Button
                    onClick={() => {
                      setCurGameMode(mode);
                      setDifficultyDrawerOpen(true);
                    }}
                  >
                    {mode}
                  </Button>
                </div>
              ))}
            {difficultyDrawerOpen && (
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="text-[16px] font-arcade">{curGameMode}</div>
              <div className="flex gap-1 flex-wrap items-center justify-center">
                {DIFFICULTY_LEVELS.map((difficulty, index) => (
                  <LinkButton
                    key={index}
                    href={`/session/${curGameMode}/${difficulty}/play`}
                  >
                    {difficulty}
                  </LinkButton>
                ))}
              </div>
              </div>
            )}
          </div>
          
          <hr />
          <LinkButton href="/games">Try MiniGames</LinkButton>
        </div>
        <footer className="w-full h-12 flex gap-6 flex-wrap items-center justify-between py-2 px-4 font-ms">
          <a 
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://buymeacoffee.com/kaypohleb"
            target="_blank"
            rel="noopener noreferrer"
          >
            Buy me a coffee
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://kaypohleb.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            made by Caleb Foo
          </a>
        </footer>
      </Window>
    </main>
  );
}
