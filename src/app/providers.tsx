"use client";

import { PropsWithChildren } from "react";
import { Global } from "@emotion/react";
import PageLayout from "@components/PageLayout";
import { ToggleThemeProvider } from "@hooks/useToggleTheme";
import { globalTheme } from "@styles/globalTheme";

type Props = PropsWithChildren<{
  initialTheme: string;
}>;

export default function Providers({ children, initialTheme }: Props) {
  return (
    <ToggleThemeProvider initialTheme={initialTheme}>
      <Global styles={globalTheme} />
      <PageLayout>{children}</PageLayout>
    </ToggleThemeProvider>
  );
}
