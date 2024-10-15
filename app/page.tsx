import LinkButton from "@components/LinkButton";
import TutorialWindow from "@components/TutorialWindow";
import Window from "@components/Window";
import FallingSpriteBackground from "@components/FallingSpriteBackground";
import PlayButton from "./components/PlayButton";


export default function Home() {

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
      <Window title="">
        <div className="flex flex-col items-center justify-center coinbg gap-4 p-4">
          <div className="text-[64px] font-arcade text-center border-black border p-2">BEATING <br/>THE HOUSE</div>
          <div className="font-ms max-w-[640px] text-[14px]">
            Use your wit, luck and skill to beat the house with every choice having both uncertainties and
            outcomes.
          </div>
          <PlayButton />
          <LinkButton href="/games">Try MiniGames</LinkButton>
        </div>
      </Window>
    </main>
  );
}
