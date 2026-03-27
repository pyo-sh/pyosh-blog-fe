"use client";

import { PropsWithChildren } from "react";
import { QueryProvider } from "@app-layer/provider/query-provider";
import { ToastProvider } from "@app-layer/provider/toast-provider";
import { ThemeProvider } from "@app-layer/theme";
import { Footer } from "@widgets/footer";
import { Header } from "@widgets/header";

interface IProps extends PropsWithChildren {
  initialTheme: string;
}

export default function Providers({ children, initialTheme }: IProps) {
  return (
    <QueryProvider>
      <ThemeProvider initialTheme={initialTheme}>
        <Header />
        {children}
        <Footer />
        <ToastProvider />
      </ThemeProvider>
    </QueryProvider>
  );
}
