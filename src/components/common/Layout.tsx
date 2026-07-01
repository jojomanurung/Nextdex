import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Navbar } from "./Navbar";
import { Insights } from "./Insights";

type LayoutProps = {
  children: ReactNode;
};

const font = Inter({ weight: "400", subsets: ["latin"] });

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <Navbar />
      <main className={`${font.className} px-3 md:px-7 lg:px-auto pb-10`}>
        {children}
        <Insights />
      </main>
    </>
  );
}
