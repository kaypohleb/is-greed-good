import PlayStateProvider from "@/providers/PlayStateProvider";

export default function SessionLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { mode: string; difficulty: string };
}>) {
  return (
    <PlayStateProvider difficulty={params.difficulty} mode={params.mode}>
      {children}
    </PlayStateProvider>
  );
}
