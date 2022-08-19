import { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider} from "@mantine/core";
import {RouterTransition} from "../components/RouterTransition";
import Scaffold from "../components/Scaffold";
import ColorProvider from "../components/ColorContext";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <title>NetKnife</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="A collection of network-related tools" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <RouterTransition />
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          fontFamily: 'Inter, sans-serif',
          headings: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
          },
          fontFamilyMonospace: 'IBM Plex Mono, monospace',
          primaryColor: 'cyan',
          components: {
            Anchor: {
              styles: (theme) => ({
                root: {
                  textDecoration: 'underline',
                  textUnderlinePosition: 'under',
                  color: theme.black,
                },
              }),
            },
          },
        }}
      >
        <ColorProvider>
          <Scaffold>
            <Component {...pageProps} />
          </Scaffold>
        </ColorProvider>
      </MantineProvider>
    </>
  );
}
