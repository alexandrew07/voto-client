import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

import { MantineProvider } from "@mantine/core";

import Layout from "@/components/Layout";
import Session from "@/components/Session";
import { Notifications } from "@mantine/notifications";
import { DefaultSeo } from "next-seo";
import { useRouter } from "next/router";
import { Provider } from "react-redux";
import SEO from "../../next-seo.config";
import store from "../store";
import logo from "/public/voto-logo.png";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const isExcludedRoute =
    router.pathname === "/" ||
    router.pathname === "/organisation/register" ||
    router.pathname === "/organisation/login" ||
    router.pathname === "/voter/login" ||
    router.pathname === "/organisation/voters/[id]/register" ||
    router.pathname === "/organisation/voters/[id]/verify" ||
    router.pathname === "/organisation/candidates/[id]/create";

  return (
    <>
      <Head>
        <link rel="shortcut icon" href={logo.src} type="image/x-icon" />
      </Head>
      <DefaultSeo {...SEO} />

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{ fontFamily: "Public Sans, sans-serif" }}
      >
        <Provider store={store}>
          <Notifications />
          <Session>
            {isExcludedRoute ? (
              <>
                <Component {...pageProps} />
              </>
            ) : (
              <Layout>
                <Component {...pageProps} />
              </Layout>
            )}
          </Session>
        </Provider>
      </MantineProvider>
    </>
  );
}
