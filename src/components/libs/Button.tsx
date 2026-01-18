"use client";

import { ForwardedRef, forwardRef, PropsWithChildren } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import {
  TRANSITION_DELAY_BG_COLOR,
  TRANSITION_DELAY_COLOR,
} from "@styles/transition";

type TProps = PropsWithChildren<{
  width?: string | number;
  height?: string | number;
  shape?: "rounded" | "squared" | "circled";
  fill?: "fill" | "outline" | "weak";
  theme?: "primary" | "error";
  color?: string;
  backgroundColor?: string;
  showShadow?: boolean;
}> &
  React.HTMLAttributes<HTMLButtonElement>;

enum Shapes {
  rounded = "35px",
  squared = "3px",
  circled = "50%",
}

const Button = (props: TProps, ref: ForwardedRef<HTMLButtonElement>) => {
  const {
    width = "auto",
    height = "auto",
    shape = "squared",
    fill = "fill",
    theme,
    color: userColor,
    backgroundColor: userBackgroundColor,
    showShadow = true,
    children,
    ...rest
  } = props;

  const eTheme = useTheme();
  let [color, backgroundColor]: [string, string] = [
    eTheme.text1,
    eTheme.positive1,
  ];

  // Theming
  if (theme === "primary") {
    [color, backgroundColor] = [eTheme.text1, eTheme.primary1];
  } else if (theme === "error") {
    [color, backgroundColor] = [eTheme.text1, eTheme.negative1];
  }

  // Filling
  if (fill !== "fill") {
    [color, backgroundColor] = [backgroundColor, color];
  }
  if (fill === "outline" || fill === "weak") {
    backgroundColor = "transparent";
  }

  // Custom Color
  if (userColor) {
    color = userColor;
  }
  if (userBackgroundColor) {
    backgroundColor = userBackgroundColor;
  }

  return (
    <DefaultButton
      css={{
        width,
        height,
        color,
        backgroundColor,
        border: `1px solid ${fill === "outline" ? color : "transparent"}`,
        borderRadius: Shapes[shape],
        boxShadow: showShadow ? "0px 2px 7px 0px rgb(0 0 0 / 26%)" : "",
      }}
      ref={ref}
      {...rest}
    >
      {children}
    </DefaultButton>
  );
};

const TRANSITION_DELAY_TRANSFORM = "0.3s";
const DefaultButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 0.5rem;
  cursor: pointer;
  &:hover {
    transform: translateY(-7px);
  }
  transition:
    transform ${TRANSITION_DELAY_TRANSFORM},
    color ${TRANSITION_DELAY_COLOR},
    background-color ${TRANSITION_DELAY_BG_COLOR};
  -webkit-transition:
    transform ${TRANSITION_DELAY_TRANSFORM},
    color ${TRANSITION_DELAY_COLOR},
    background-color ${TRANSITION_DELAY_BG_COLOR};
  -moz-transition:
    transform ${TRANSITION_DELAY_TRANSFORM},
    color ${TRANSITION_DELAY_COLOR},
    background-color ${TRANSITION_DELAY_BG_COLOR};
  -o-transition:
    transform ${TRANSITION_DELAY_TRANSFORM},
    color ${TRANSITION_DELAY_COLOR},
    background-color ${TRANSITION_DELAY_BG_COLOR};
  background-color: transparent;
`;

export default forwardRef<HTMLButtonElement, TProps>(Button);
