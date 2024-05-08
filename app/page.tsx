import LinkButton from "./components/LinkButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      
      <div className="font-black text-[125px]">IS GREED Good?</div>
      <div>
        Many a time, people have lived and died by the coin -- the coin that is
        the root of all evil. But is it really? Is greed really the root of all
        evil? Or can it only wielded by the talented
      </div>
      <LinkButton href="/gamba" variant="solid" color="cyan">Try Now</LinkButton>
    </main>
  );
}
