import MiniStateProvider from "@/providers/MiniStateProvider";

export default function SessionLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { game: string; mode: string; difficulty: string };
}>) {
  return (
    <MiniStateProvider
      difficulty={params.difficulty}
      game={params.game}
      mode={params.mode}
    >
      {children}
    </MiniStateProvider>
  );
}
