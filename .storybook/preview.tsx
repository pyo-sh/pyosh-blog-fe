import { useState } from "react";
import type { Preview } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { initialize, mswLoader } from "msw-storybook-addon";
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
      return (
        <QueryClientProvider client={queryClient}>
          <div
            className="min-h-screen bg-background-1 text-text-1 transition-theme"
            style={{
              fontFamily: '"Gothic A1", ui-sans-serif, system-ui, sans-serif',
            }}
          >
            <div className="mx-auto w-full max-w-[96rem] px-4 py-6 md:px-6">
              <Story />
            </div>
          </div>
        </QueryClientProvider>
      );
    },
    withThemeByDataAttribute({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
      parentSelector: "body",
      attributeName: "data-theme",
    }),
  ],
  loaders: [mswLoader],
  parameters: {
    layout: "fullscreen",
    viewport: {
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
