"use client";

import React from "react";
import { css, useTheme } from "@emotion/react";
import { GithubIcon, MailIcon } from "@components/icons";
import Button from "@components/libs/Button";
import ListRow from "@components/libs/ListRow";
import { HREF_GITHUB_PROFILE, HREF_MAIL } from "@constants/href";
import useToggleTheme from "@hooks/useToggleTheme";
import { TRANSITION_SVG_COLOR } from "@styles/transition";

export const CONTACT_BUTTON_SIZE = "2.75rem";
const ICON_SIZE = "1.5rem";
const BUTTON_SHAPE = "circled";

const Contacts: React.FC = () => {
  const theme = useTheme();
  const { themeType } = useToggleTheme();

  const isDark = themeType === "dark";
  const buttonFill = isDark ? "outline" : "fill";
  const [color, bgColor] = [theme.text1, theme.background1];

  const hoverButton = {
    "&:hover": {
      backgroundColor: color,
      path: {
        fill: bgColor,
      },
    },
  };

  return (
    <ListRow
      css={css`
        column-gap: 0.5rem;
        justify-content: flex-end;
        align-self: flex-end;
      `}
    >
      <a href={HREF_GITHUB_PROFILE}>
        <Button
          css={hoverButton}
          width={CONTACT_BUTTON_SIZE}
          height={CONTACT_BUTTON_SIZE}
          shape={BUTTON_SHAPE}
          color={color}
          backgroundColor={bgColor}
          fill={buttonFill}
        >
          <GithubIcon
            css={TRANSITION_SVG_COLOR}
            width={ICON_SIZE}
            height={ICON_SIZE}
            color={color}
          />
        </Button>
      </a>
      <a href={`mailto:${HREF_MAIL}`}>
        <Button
          css={hoverButton}
          width={CONTACT_BUTTON_SIZE}
          height={CONTACT_BUTTON_SIZE}
          shape={BUTTON_SHAPE}
          color={color}
          backgroundColor={bgColor}
          fill={buttonFill}
        >
          <MailIcon
            css={TRANSITION_SVG_COLOR}
            width={ICON_SIZE}
            height={ICON_SIZE}
            color={color}
          />
        </Button>
      </a>
    </ListRow>
  );
};

export default Contacts;
