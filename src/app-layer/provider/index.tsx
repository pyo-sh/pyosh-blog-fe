"use client";

import { PropsWithChildren } from "react";
import { ThemeProvider } from "@app-layer/theme";
import { Footer } from "@widgets/footer";
import { Header } from "@widgets/header";

interface IProps extends PropsWithChildren {
  initialTheme: string;
}

export default function Providers({ children, initialTheme }: IProps) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <Header />
      {children}
      <Footer />
    </ThemeProvider>
  );
}
