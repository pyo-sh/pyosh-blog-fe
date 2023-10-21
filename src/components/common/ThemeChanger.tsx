import React from "react";
import { IconProps, SunIcon, NightIcon } from "@components/icons";
import Button from "@components/libs/Button";
import useToggleTheme from "@hooks/useToggleTheme";

const ThemeChanger: React.FC<IconProps> = ({
  width,
  height,
  color,
  className,
}) => {
  const { isMounted, themeType, toggleTheme } = useToggleTheme();

  if (!isMounted) {
    return <></>;
  }

  if (themeType === "light") {
    return (
      <Button
        className={className}
        onClick={toggleTheme}
        showShadow={false}
        fill={"weak"}
      >
        <SunIcon width={width} height={height} color={color} />
      </Button>
    );
  }

  if (themeType === "dark") {
    return (
      <Button
        className={className}
        onClick={toggleTheme}
        showShadow={false}
        fill={"weak"}
      >
        <NightIcon width={width} height={height} color={color} />
      </Button>
    );
  }

  return <></>;
};

export default ThemeChanger;
