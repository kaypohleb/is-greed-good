import PlayStateProvider from "@/providers/PlayStateProvider";

export default function SessionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PlayStateProvider>{children}</PlayStateProvider>;
}
