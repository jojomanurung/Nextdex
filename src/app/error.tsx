"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { StatusScreen } from "@components/common/StatusScreen";
import { Button, buttonVariants } from "@components/ui/button";
import { cn } from "@lib/utils";

// App Router error boundary — the rough equivalent of the old 500 page. Catches
// unexpected runtime errors thrown while rendering a route (bad data that isn't
// a clean notFound()). Must be a Client Component; `reset` retries the segment.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    document.title = "500 · Something went wrong | Nextdex";
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      code="500"
      title="Something went wrong"
      description={
        <>
          Our server used Self-Destruct &mdash; that&rsquo;s on us, not you. Give
          it a moment and try again.
        </>
      }
      image={{
        src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/101.png",
        alt: "Electrode about to self-destruct",
      }}
      glow="#fb7185"
      actions={
        <>
          <Button
            type="button"
            size="lg"
            onClick={() => reset()}
            className="rounded-full px-5"
          >
            <RotateCcw />
            Try again
          </Button>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-full px-5",
            )}
          >
            <ArrowLeft />
            Back to the Pokédex
          </Link>
        </>
      }
    />
  );
}
