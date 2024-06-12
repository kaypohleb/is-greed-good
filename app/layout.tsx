import type { Metadata } from "next";
import "./globals.css";
import CoinLogo from "@assets/images/coin.png";
import Providers from "./providers/Providers";
import GoogleSignInButton from "./components/SignInButton";
import SoundIcon from "@assets/images/sound.png";
import PrivacyIcon from "@assets/images/privacy.png";
import Image from "next/image";
import Link from "next/link";
import Modal from "./components/Modal";

export const metadata: Metadata = {
  title: "is greed good",
  description: "Created by @kaypohleb as a experimental project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="crt w-[100vw] h-[100vh]">
        <Providers>
          <nav className="flex gap-4 py-[6px] px-2 items-center justify-between bg-silver border-b-2 border-black font-arcade shadow-md">
            <a href="/">
              <Image src={CoinLogo} width={32} alt="coin_logo" />
            </a>
            <div className="flex items-center justify-center gap-2 hover">
              <GoogleSignInButton />
              <div className="side-navbar text-[16px] font-ms py-1 px-2 flex items-center justify-center gap-2">
                <Image
                  src={SoundIcon}
                  alt="sound_icon"
                  width={16}
                  height={16}
                />
                <Link href="/privacy">
                  <Image
                    src={PrivacyIcon}
                    alt="privacy_icon"
                    width={16}
                    height={16}
                  />
                </Link>
                {new Date().toLocaleDateString()}
              </div>
            </div>
            <Modal/>
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  );
}
