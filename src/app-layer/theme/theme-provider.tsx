"use client";

import * as React from "react";
import { setCookie } from "@shared/lib/cookie";

type TThemeType = "dark" | "light" | "default";

const COOKIE_THEME_KEY = "theme";
const ThemeContext = React.createContext<{
  themeType: TThemeType;
  toggleTheme: () => void;
  isMounted: boolean;
} | null>(null);

type TProviderProps = React.PropsWithChildren<{
  initialTheme: string;
}>;

export function ThemeProvider({ children, initialTheme }: TProviderProps) {
  const [themeType, setThemeType] = React.useState<TThemeType>(
    initialTheme === "dark" || initialTheme === "light"
      ? initialTheme
      : "default",
  );
  const [isMounted, setIsMounted] = React.useState<boolean>(false);

  React.useEffect(() => {
    setIsMounted(true);

    if (themeType !== "default") return;

    const isDefaultDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const bodyThemeData = document.body.dataset.theme;

    if (bodyThemeData && bodyThemeData.length !== 0) {
      setThemeType(bodyThemeData as TThemeType);
    } else if (isDefaultDark) {
      setThemeType("dark");
    }
  }, [themeType]);

  React.useEffect(() => {
    if (themeType !== "default" && document.body.dataset.theme !== themeType) {
      document.body.dataset.theme = themeType;
      setCookie(COOKIE_THEME_KEY, themeType);
    }
  }, [themeType]);

  const toggleTheme = () => {
    setThemeType((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "light";

      return "dark";
    });
  };

  const normalizeTheme = (): "dark" | "light" => {
    if (!isMounted) return "light";
    if (themeType === "default") return "light";

    return themeType;
  };

  return (
    <ThemeContext.Provider
      value={{ themeType: normalizeTheme(), toggleTheme, isMounted }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeContext };
export type { TThemeType };
