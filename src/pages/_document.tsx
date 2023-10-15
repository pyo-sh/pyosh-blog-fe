import { Html, Head, Main, NextScript, DocumentProps } from "next/document";

function Document(props: DocumentProps) {
  const themeType = props?.__NEXT_DATA__?.props?.props?.theme ?? "";

  return (
    <Html lang="ko">
      <Head>
        <meta charSet="UTF-8" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="apple-touch-icon"
          sizes="256x256"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-chrome-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/android-chrome-512x512.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#BB86FC" />
        <meta name="msapplication-TileImage" content="/mstile-150x150" />
        <meta name="theme-color" content="#6200EE" />
      </Head>
      <body data-theme={themeType}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export default Document;
