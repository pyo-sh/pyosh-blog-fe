import type { Theme } from "@emotion/react";
import { camelToKebab } from "@utils/convertCase";

export const convertToCSSVariable = (name: string) => {
  return `var(--${camelToKebab(name)})`;
};

export const getPalette = (theme: Theme): Theme => {
  const keys = Object.keys(theme) as Array<keyof Theme>;

  const palette = keys.reduce((palette, key) => {
    palette[key as keyof Theme] = convertToCSSVariable(
      key,
    ) as Theme[keyof Theme];

    return palette;
  }, {} as Theme);

  return Object.freeze(palette);
};

export const buildCSSVariables = (theme: Theme) => {
  const keys = Object.keys(theme) as Array<keyof Theme>;

  const variableSets = keys.map((key) => {
    return `--${camelToKebab(key)}: ${theme[key]};`;
  });

  return variableSets.join("\n");
};
