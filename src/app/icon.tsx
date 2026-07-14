import { ImageResponse } from "next/og";
import { Pokeball } from "@components/common/Pokeball";

// Favicon generated from the same Pokeball the navbar wordmark uses (one source
// of truth). The chip + heavier stroke give it presence at 16px.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b112097",
          borderRadius: 7,
        }}
      >
        <Pokeball accent="#5B8CFF" strokeWidth={2.5} size={32} />
      </div>
    ),
    size,
  );
}
