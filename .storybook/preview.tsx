import { useState } from "react";
import type { Preview } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { initialize, mswLoader } from "msw-storybook-addon";
import { ToastProvider } from "@app-layer/provider/toast-provider";
import { ThemeProvider } from "@app-layer/theme";
import "../src/app-layer/style/index.css";

initialize({ onUnhandledRequest: "bypass" });

const preview: Preview = {
  decorators: [
    (Story) => {
      const [queryClient] = useState(
        () =>
          new QueryClient({
            defaultOptions: {
              queries: { retry: false, staleTime: Infinity },
            },
          }),
      );
      const initialTheme =
        typeof document === "undefined"
          ? ""
          : (document.documentElement.dataset.theme ?? "");

      return (
        <QueryClientProvider client={queryClient}>
          <ThemeProvider initialTheme={initialTheme}>
            <div
              className="min-h-screen bg-background-1 text-text-1 transition-theme"
              style={{
                fontFamily: '"Gothic A1", ui-sans-serif, system-ui, sans-serif',
              }}
            >
              <Story />
              <ToastProvider />
            </div>
          </ThemeProvider>
        </QueryClientProvider>
      );
    },
    withThemeByDataAttribute({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
      parentSelector: "html",
      attributeName: "data-theme",
    }),
  ],
  loaders: [mswLoader],
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
        query: {},
      },
    },
    viewport: {
      defaultViewport: "desktop",
      viewports: {
        mobile: { name: "Mobile", styles: { width: "375px", height: "812px" } },
        desktop: {
          name: "Desktop",
          styles: { width: "1280px", height: "800px" },
        },
      },
    },
  },
};

export default preview;
