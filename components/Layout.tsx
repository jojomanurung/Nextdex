import { ReactNode } from "react";
import { VT323 } from "next/font/google";
import Navbar from "./Navbar";
import Head from "next/head";

type LayoutProps = {
  children: ReactNode;
};

const font = VT323({weight: "400", subsets: ['latin']});

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>Pokemon | Nextdex</title>
      </Head>
      <Navbar />
      <main className={`${font.className} bg-gray-50 mt-[114px]`}>{children}</main>
    </>
  );
}
