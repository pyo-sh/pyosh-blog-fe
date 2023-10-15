import { css } from "@emotion/react";
import { TRANSITION_THEME } from "./transition";
import { theme, themeCSSVariables } from "@styles/theme";

export const globalTheme = css`
  body {
    ${themeCSSVariables.light}
    color: ${theme.text1};
    background-color: ${theme.background1};
    ${TRANSITION_THEME}
  }

  body::-webkit-scrollbar {
    width: 12px;
    background-color: ${theme.border3};
  }
  body::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: ${theme.text1};
  }

  @media (prefers-color-scheme: dark) {
    body {
      ${themeCSSVariables.dark}
    }
  }

  body[data-theme="light"] {
    ${themeCSSVariables.light};
  }

  body[data-theme="dark"] {
    ${themeCSSVariables.dark};
  }
`;
