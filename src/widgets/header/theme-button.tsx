"use client";

import React from "react";
import { useTheme } from "@app-layer/theme";
import { NightIcon, SunIcon } from "@shared/ui/icons";
import { Button } from "@shared/ui/libs";

const ICON_WIDTH = "1.75rem";
const ICON_HEIGHT = "1.75rem";

const ThemeButton: React.FC = () => {
  const { isMounted, themeType, toggleTheme } = useTheme();

  if (!isMounted) {
    return <></>;
  }

  if (themeType === "light") {
    return (
      <Button onClick={toggleTheme} showShadow={false} fill={"weak"}>
        <SunIcon
          className="text-text-1"
          width={ICON_WIDTH}
          height={ICON_HEIGHT}
        />
      </Button>
    );
  }

  if (themeType === "dark") {
    return (
      <Button onClick={toggleTheme} showShadow={false} fill={"weak"}>
        <NightIcon
          className="text-text-1"
          width={ICON_WIDTH}
          height={ICON_HEIGHT}
        />
      </Button>
    );
  }

  return <></>;
};

export { ThemeButton };
