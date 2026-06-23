import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="sticky top-0 left-0 right-0 w-full backdrop-blur-sm z-10">
      <div className="flex justify-center py-2">
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
