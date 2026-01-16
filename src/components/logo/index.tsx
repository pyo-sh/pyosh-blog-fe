import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import Link from "next/link";
import LogoIcon from "./LogoIcon";
import LogoText from "./LogoText";
import { TRANSITION_SVG_BG_COLOR } from "@styles/transition";

type TProps = {
  color?: string;
  showIcon?: boolean;
  className?: string;
};

const LOGO_HEIGHT = "3rem";

const Logo: React.FC<TProps> = ({ color, showIcon = true, className }) => {
  const theme = useTheme();

  return (
    <Wrapper href="/" className={className}>
      {showIcon && (
        <LogoIcon
          css={TRANSITION_SVG_BG_COLOR}
          width={LOGO_HEIGHT}
          height={LOGO_HEIGHT}
          color={color ?? theme.text1}
        />
      )}
      <LogoText
        width={"8.75rem"}
        height={LOGO_HEIGHT}
        css={[{ marginTop: "0.5rem" }, TRANSITION_SVG_BG_COLOR]}
        color={color ?? theme.text1}
      />
    </Wrapper>
  );
};

const Wrapper = styled(Link)`
  display: flex;
  align-items: center;
`;

export default Logo;
