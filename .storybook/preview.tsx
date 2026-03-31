import { useEffect, useState } from "react";
import type { Preview } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { initialize, mswLoader } from "msw-storybook-addon";
import { ToastProvider } from "@app-layer/provider/toast-provider";
import { clearCsrfToken } from "@shared/api";
import { ThemeProvider } from "@app-layer/theme";
import "../src/app-layer/style/index.css";

initialize({ onUnhandledRequest: "bypass" });

function StoryProviders({
  storyId,
  children,
}: {
  storyId: string;
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: 0 },
        },
      }),
  );
  const initialTheme =
    typeof document === "undefined"
      ? ""
      : (document.documentElement.dataset.theme ?? "");

  useEffect(() => {
    clearCsrfToken();
  }, [storyId]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider initialTheme={initialTheme}>
        <div
          className="min-h-screen bg-background-1 text-text-1 transition-theme"
          style={{
            fontFamily: '"Gothic A1", ui-sans-serif, system-ui, sans-serif',
          }}
        >
          {children}
          <ToastProvider />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const preview: Preview = {
  decorators: [
    (Story, context) => {
      return (
        <StoryProviders key={context.id} storyId={context.id}>
          <Story />
        </StoryProviders>
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
