import { Theme } from "@emotion/react";
import { buildCSSVariables, getPalette } from "@utils/convertStyle";

const darkTheme: Theme = {
  background1: "#121212",
  background2: "#1E1E1E",
  background3: "#252525",
  background4: "#2E2E2E",
  text1: "#ECECEC",
  text2: "#D9D9D9",
  text3: "#ACACAC",
  text4: "#595959",
  border1: "#E0E0E0",
  border2: "#A0A0A0",
  border3: "#4D4D4D",
  border4: "#2A2A2A",
  primary1: "#A591E8 ",
  primary2: "#C7BBF0",
  secondary1: "#8C72C5",
  secondary2: "#B9AADC",
  tertiary1: "#A5B2FF",
  tertiary2: "#C7D0FF",
  quaternary1: "#C7E6FF",
  quaternary2: "#DDF0FF",
  positive1: "#15C47E",
  positive2: "#76E4B8",
  negative1: "#F66570",
  negative2: "#FFD4D6",
  grey1: "#4E5968",
  grey2: "#8B95A1",
  grey3: "#D1D6DB",
  grey4: "#F2F4F6",
  yellow1: "#FFB331",
  yellow2: "#FFDD78",
} as const;

const lightTheme: Theme = {
  background1: "#F8F9FA",
  background2: "#F1F3F5",
  background3: "#E9ECEF",
  background4: "#DEE2E6",
  text1: "#212529",
  text2: "#495057",
  text3: "#868E96",
  text4: "#CED4DA",
  border1: "#343A40",
  border2: "#ADB5BD",
  border3: "#DEE2E6",
  border4: "#F1F3F5",
  primary1: "#8D72E1",
  primary2: "#B19EEA",
  secondary1: "#6C4AB6",
  secondary2: "#9B85CD",
  tertiary1: "#8D9EFF",
  tertiary2: "#B0BCFF",
  quaternary1: "#B9E0FF",
  quaternary2: "#CEE9FF",
  positive1: "#03B26C",
  positive2: "#3FD599",
  negative1: "#D22030",
  negative2: "#F66570",
  grey1: "#F2F4F6",
  grey2: "#D1D6DB",
  grey3: "#8B95A1",
  grey4: "#4E5968",
  yellow1: "#FFC342",
  yellow2: "#EE8F11",
} as const;

export const themeColor = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export const themeCSSVariables = {
  light: buildCSSVariables(lightTheme),
  dark: buildCSSVariables(darkTheme),
} as const;

export const theme = getPalette(lightTheme);
