import { Global } from "@emotion/react";
import Head from "next/head";
import type { AppContext, AppProps } from "next/app";
import PageLayout from "@components/PageLayout";
import { COOKIE_THEME_KEY } from "@constants/cookieKey";
import { ToggleThemeProvider } from "@hooks/useToggleTheme";
import { globalTheme } from "@styles/globalTheme";
import { getCookieValue } from "@utils/cookie";
import "@styles/css/index.css";

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Pyosh Blog</title>
      </Head>
      <ToggleThemeProvider>
        <Global styles={globalTheme} />
        <PageLayout>
          <Component {...pageProps} />
        </PageLayout>
      </ToggleThemeProvider>
    </>
  );
}

// Used getInitialProps because it needs in all pages
App.getInitialProps = function (context: AppContext) {
  const { ctx } = context;
  let themeType: string | null = "";

  if (ctx?.req?.headers?.cookie) {
    themeType = getCookieValue(ctx.req.headers.cookie, COOKIE_THEME_KEY);
  }

  return {
    props: {
      theme: themeType,
    },
  };
};

export default App;
