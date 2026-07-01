import { ReactNode } from "react";
import Head from "next/head";
import { Inter } from "next/font/google";
import { Navbar } from "./Navbar";
import { SpeedInsights } from "@vercel/speed-insights/next";

type LayoutProps = {
  children: ReactNode;
};

const font = Inter({ weight: "400", subsets: ["latin"] });

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>Pokemon | Nextdex</title>
      </Head>
      <Navbar />
      <main className={`${font.className} px-3 md:px-7 lg:px-auto pb-10`}>
        {children}
        <SpeedInsights />
      </main>
    </>
  );
}
