import type { Metadata } from "next";
import { cookies } from "next/headers";
import "@app-layer/style/index.css";
import Providers from "@app-layer/provider";

export const metadata: Metadata = {
  title: "Pyosh Blog",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.json",
  other: {
    "msapplication-TileColor": "#BB86FC",
    "msapplication-TileImage": "/mstile-150x150",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6200EE",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const themeType = cookieStore.get("theme")?.value ?? "";

  return (
    <html lang="ko">
      <body data-theme={themeType}>
        <div className="w-full h-full">
          <Providers initialTheme={themeType}>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
