import {
  useState,
  useContext,
  createContext,
  PropsWithChildren,
  useEffect,
} from "react";
import { ThemeProvider } from "@emotion/react";
import { COOKIE_THEME_KEY } from "@constants/cookieKey";
import { theme } from "@src/styles/theme";
import { setCookie } from "@utils/cookie";

type TThemeType = "dark" | "light" | "default";

const ToggleThemeContext = createContext<{
  themeType: TThemeType;
  toggleTheme: () => void;
  isMounted: boolean;
} | null>(null);

type TProviderProps = PropsWithChildren<{
  initialTheme?: string;
}>;

export function ToggleThemeProvider({
  children,
  initialTheme,
}: TProviderProps) {
  const [themeType, setThemeType] = useState<TThemeType>(
    initialTheme === "dark" || initialTheme === "light"
      ? initialTheme
      : "default",
  );
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (themeType !== "default" && document.body.dataset.theme !== themeType) {
      document.body.dataset.theme = themeType;
      setCookie(COOKIE_THEME_KEY, themeType);
    }
  }, [themeType]);

  const toggleTheme = () => {
    setThemeType((prev) => {
      if (prev === "light") {
        return "dark";
      }
      if (prev === "dark") {
        return "light";
      }

      return "dark";
    });
  };

  const normalizeTheme = () => {
    if (!isMounted) {
      return "light";
    }
    if (themeType === "default") {
      return "light";
    }

    return themeType;
  };

  return (
    <ToggleThemeContext.Provider
      value={{ themeType: normalizeTheme(), toggleTheme, isMounted }}
    >
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ToggleThemeContext.Provider>
  );
}

const useToggleTheme = () => {
  const value = useContext(ToggleThemeContext);
  if (!value) {
    throw new Error("Cannot find Toggle Theme Context");
  }

  return value;
};

export default useToggleTheme;
