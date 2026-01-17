"use client";

import React, { PropsWithChildren } from "react";
import { TRANSITION_COLOR } from "@styles/transition";

type TFontSize =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "r1"
  | "r2"
  | "r3"
  | "r4"
  | "r5"
  | "r6"
  | "e1"
  | "e2"
  | "e3"
  | "e4"
  | "e5"
  | "e6";

type TFontWeight = "light" | "regular" | "medium" | "bold";

type TProps = PropsWithChildren<{
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  draggable?: boolean;
  ellipsis?: boolean;
  multiline?: boolean;
  fontSize?: TFontSize;
  fontWeight?: TFontWeight;
  color?: string;
  hasColorTransition?: boolean;
}> &
  Omit<React.HTMLAttributes<HTMLOrSVGElement>, "onToggle">;

const Text: React.FC<TProps> = (props) => {
  const {
    children,
    as: TextComponent = "span",
    role,
    className,
    draggable = true,
    ellipsis,
    multiline,
    fontSize,
    fontWeight,
    color,
    hasColorTransition = false,
    ...rest
  } = props;

  const classes = [];
  if (className) {
    classes.push(className);
  }
  if (!draggable) {
    classes.push("undraggable");
  }
  if (ellipsis) {
    classes.push("ellipsis-enabled");
  }
  if (fontSize) {
    classes.push(`font-size--${fontSize}`);
  }
  if (fontWeight) {
    classes.push(`font-weight--${fontWeight}`);
  }

  return (
    <TextComponent
      css={[{ color }, hasColorTransition ? TRANSITION_COLOR : {}]}
      className={classes.join(" ")}
      role={role ?? "text"}
      {...rest}
    >
      {multiline && typeof children === "string"
        ? convertStringToLinedJSX(children)
        : children}
    </TextComponent>
  );
};

const convertStringToLinedJSX = (str: string) => {
  return str.split("\n").map((line, index) => (
    <React.Fragment key={index}>
      {index > 0 ? <br /> : ""}
      {line}
    </React.Fragment>
  ));
};

export default Text;
