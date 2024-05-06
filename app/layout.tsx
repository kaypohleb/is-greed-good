import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const loginId = cookieStore.get("gambaId");
  const authToken = cookieStore.get("authToken");

  if (loginId && authToken) {
    console.log("Logged in");
  }else{
    console.log("Not logged in");
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav>
          <a href="/">Home</a>
          <a href="/gamba">Gamba</a>
          <a href="/login">Login</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
