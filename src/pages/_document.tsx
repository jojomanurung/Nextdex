import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" data-scroll-behavior="smooth">
      <Head />
      <body className="bg-slate-900/90 text-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
