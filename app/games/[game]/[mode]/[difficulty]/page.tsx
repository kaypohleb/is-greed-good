"use client";
import { Heist } from "../../../../components/games/Heist";
import Window from "@/components/Window";
import { CoinCross } from "../../../../components/games/CoinCross";
import CoinBalloon from "../../../../components/games/CoinBalloon";
import { useMiniStateContext } from "@/providers/MiniStateProvider";

export default function MiniGame({
  params,
}: {
  params: {
    game: string;
    mode: string;
    difficulty: string;
  };
}) {
  //HEIST/COINFLIP/COINCROSS
  const { miniState, forceUpdate } = useMiniStateContext();

  return (
    <div className="relative text-black w-full h-screen-nav flex flex-col items-center justify-center gap-4">
      {params.game === "HEIST" && miniState ? (
        <Window title={"Heist"}>
          <Heist
            miniState={miniState}
            updateMiniGamePlayState={forceUpdate}
          />
        </Window>
      ) : null}
      {params.game === "COINCROSS" ? (
        <Window title={"CoinCross"}>
          <CoinCross
            miniState={miniState}
            updateMiniGamePlayState={forceUpdate}
          />
        </Window>
      ) : null}
      {params.game === "COINBALLOON" ? (
        <CoinBalloon
          miniState={miniState}
          updateMiniGamePlayState={forceUpdate}
        />
      ) : null}
    </div>
  );
}
