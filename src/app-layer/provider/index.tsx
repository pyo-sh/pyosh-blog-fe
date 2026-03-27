"use client";

import { PropsWithChildren, useEffect } from "react";
import { QueryProvider } from "@app-layer/provider/query-provider";
import { ToastProvider } from "@app-layer/provider/toast-provider";
import { ThemeProvider } from "@app-layer/theme";
import { Header } from "@widgets/header";

interface IProps extends PropsWithChildren {
  initialTheme: string;
}

export default function Providers({ children, initialTheme }: IProps) {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("[Unhandled Rejection]", {
        reason: event.reason,
        timestamp: new Date().toISOString(),
      });
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  return (
    <QueryProvider>
      <ThemeProvider initialTheme={initialTheme}>
        <Header />
        {children}
        <ToastProvider />
      </ThemeProvider>
    </QueryProvider>
  );
}
