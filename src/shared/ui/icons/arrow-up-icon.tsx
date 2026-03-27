import React from "react";
import type { IIconProps } from ".";
import { cn } from "@shared/lib/style-utils";

const ArrowUpIcon: React.FC<IIconProps> = ({ className, width, height }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn("[&_path]:stroke-current", className)}
      width={width ?? 20}
      height={height ?? 20}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 19V5M5 12l7-7 7 7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export { ArrowUpIcon };
