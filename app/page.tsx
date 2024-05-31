import { useSession } from "next-auth/react";
import LinkButton from "@components/LinkButton";
import TutorialWindow from "@components/TutorialWindow";
import Window from "@components/Window";
import FallingSpriteBackground from "@components/FallingSpriteBackground";
export default function Home() {
  return (
    <main className="relative text-black w-full h-screen-nav flex flex-col items-center justify-center coinbg gap-4">
      <FallingSpriteBackground
        zIndex={-1}
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
          <div className="text-[64px] font-arcade">is greed good?</div>
          <div className="text-[16px] font-ms max-w-[640px]">
            As part of our human nature, greed & restraint play key roles in our
            decision-making. With every choice having both uncertainties and
            outcomes, it becomes more and more difficult to surmise how we make
            them. Some attribute it to experience, some to a
            &lsquo;hunch&lsquo;, some to data analytics or even just pure luck.
            According to a simple lottery-choice experiment by Holt & Laury
            (2002), risk aversion was a key component which considers both
            personal gains & risks in the form of probabilities & payoffs.
            <br />
            <br /> I think the multi-armed bandit problem can help test how good
            we are at decision-making. This is a popular problem in Computer
            Science where to model a person acquiring new knowledge as well as
            optimizing decisions based on existing knowledge.
          </div>
          <LinkButton href="/play">Play Now</LinkButton>
        </div>
      </Window>
    </main>
  );
}
