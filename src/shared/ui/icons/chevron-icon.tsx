import React from "react";
import type { IIconProps } from ".";
import { cn } from "@shared/lib/style-utils";

type ChevronDirection = "up" | "down" | "left" | "right";

interface ChevronIconProps extends IIconProps {
  direction?: ChevronDirection;
  size?: number | string;
  strokeWidth?: number | string;
}

const pathByDirection: Record<ChevronDirection, string> = {
  up: "m6 15 6-6 6 6",
  down: "m6 9 6 6 6-6",
  left: "m15 18-6-6 6-6",
  right: "m9 18 6-6-6-6",
};

const ChevronIcon: React.FC<ChevronIconProps> = ({
  className,
  size,
  width,
  height,
  direction = "down",
  strokeWidth = 1.8,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn("[&_path]:stroke-current", className)}
      width={width ?? size ?? 16}
      height={height ?? size ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={pathByDirection[direction]}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export { ChevronIcon };
