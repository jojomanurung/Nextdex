import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Navbar() {
  const [clientWindowHeight, setClientWindowHeight] = useState(0);

  const [padding, setPadding] = useState(30);
  const [boxShadow, setBoxShadow] = useState(0);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScroll = () => {
    setClientWindowHeight(window.scrollY);
  };

  useEffect(() => {
    // Clamp at the threshold so the navbar settles on its collapsed values for
    // any scroll past it — including an instant jump from scroll restoration —
    // instead of freezing at whatever padding it last had.
    const backgroundTransparacyVar = Math.min(clientWindowHeight / 600, 0.52);
    const paddingVar = 2 - backgroundTransparacyVar * 3;
    const boxShadowVar = backgroundTransparacyVar * 0.1;
    setPadding(paddingVar);
    setBoxShadow(boxShadowVar);
  }, [clientWindowHeight]);

  return (
    <nav className="fixed top-0 left-0 right-0 w-full backdrop-blur-sm z-10">
      <div
        className="flex justify-center"
        style={{
          padding: `${padding}rem 0rem`,
          boxShadow: `rgb(0 0 0 / ${boxShadow}) 0px 0px 20px 6px`,
        }}
      >
        <Link href={"/"}>
          <Image
            src="/images/Pokemon.svg"
            alt="Nextdex"
            width={0}
            height={0}
            className="w-full h-auto max-w-36"
          />
        </Link>
      </div>
    </nav>
  );
}
