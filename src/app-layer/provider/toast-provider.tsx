"use client";

import { Toaster } from "sonner";
import { useTheme } from "@app-layer/theme";

export function ToastProvider() {
  const { themeType } = useTheme();
  const sonnerTheme = themeType === "default" ? "system" : themeType;

  return (
    <Toaster
      position="top-right"
      duration={3000}
      visibleToasts={3}
      theme={sonnerTheme}
      closeButton
    />
  );
}
