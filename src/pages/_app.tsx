import "@dex/styles/globals.css";
import type { AppProps } from "next/app";
import { Layout } from "@dex/components/Layout";
import { PokemonListProvider } from "@dex/context/PokemonListContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PokemonListProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </PokemonListProvider>
  );
}
