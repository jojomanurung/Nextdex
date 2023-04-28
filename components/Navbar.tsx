import Image from "next/image";
import logo from "@dex/public/images/Pokemon.svg";
import { useEffect, useState } from "react";

export default function Navbar() {
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
    let backgroundTransparacyVar = clientWindowHeight / 600;

    if (backgroundTransparacyVar < 0.52) {
      let paddingVar = 2 - backgroundTransparacyVar * 3;
      let boxShadowVar = backgroundTransparacyVar * 0.1;
      setPadding(paddingVar);
      setBoxShadow(boxShadowVar);
    }
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
        <Image src={logo} alt="" height={50} />
      </div>
    </nav>
  );
}
