import Image from "next/image";
import { ReactNode } from "react";

type StatusScreenProps = {
  /** The catalogue code, set at display scale in the mono voice ("404" / "500"). */
  code: string;
  title: string;
  description: ReactNode;
  image: { src: string; alt: string };
  /** Status-color halo behind the mascot (hex): rose for error, sky for lost. */
  glow: string;
  /** Pill actions rendered at the foot. */
  actions: ReactNode;
};

export function StatusScreen({
  code,
  title,
  description,
  image,
  glow,
  actions,
}: StatusScreenProps) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center py-16 text-center">
      <div className="relative h-52 w-52 sm:h-60 sm:w-60">
        {/* Status halo — the mascot's mood, behind the art. */}
        <div
          aria-hidden
          className="absolute inset-8 rounded-full opacity-25 blur-3xl dark:opacity-40"
          style={{ backgroundColor: glow }}
        />
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="240px"
          priority
          placeholder="blur"
          blurDataURL="/images/placeholder.png"
          className="object-contain drop-shadow-[0_10px_30px_rgb(0_0_0/0.20)]"
        />
      </div>

      <p className="mt-2 font-mono text-6xl font-medium leading-none tabular-nums text-foreground sm:text-7xl">
        {code}
      </p>
      <h1 className="mt-5 text-balance font-display text-2xl font-semibold text-foreground sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
        {description}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {actions}
      </div>
    </div>
  );
}
