import { PropsWithChildren } from "react";

export interface IconProps extends PropsWithChildren {
  color?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export { default as BrushIcon } from "./BrushIcon";
export { default as GithubIcon } from "./GithubIcon";
export { default as HomeIcon } from "./HomeIcon";
export { default as MailIcon } from "./MailIcon";
export { default as NightIcon } from "./NightIcon";
export { default as SunIcon } from "./SunIcon";
