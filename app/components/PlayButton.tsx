"use client";
import { DIFFICULTY_LEVELS } from "@/constants";
import { useState } from "react";
import LinkButton from "./LinkButton";
import Button from "./Button";

export default function PlayButton(
  {
    mode,
  }
  :{
    mode: string
  }
) {
  const [difficultyDrawerOpen, setDifficultyDrawerOpen] = useState(false);
  const debug = false
  return difficultyDrawerOpen ? (
    <div className="flex gap-1 flex-wrap items-center justify-center">
      {DIFFICULTY_LEVELS.map((difficulty, index) => (
        <LinkButton
          key={index}
          href={`/session/${mode}/${difficulty}/play${debug ? "?hiddendebug=true" : ""}`}
        >
          {difficulty}
        </LinkButton>
      ))}
    </div>
  ) : (
    <Button onClick={() => setDifficultyDrawerOpen(true)}>Play Now</Button>
  );
}
