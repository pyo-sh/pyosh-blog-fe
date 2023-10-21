import React from "react";
import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import Logo from "./logo";
import { GithubIcon, MailIcon } from "@components/icons";
import List from "@components/libs/List";
import Spacing from "@components/libs/Spacing";
import Text from "@components/libs/Text";
import { HREF_GITHUB, HREF_MAIL } from "@constants/href";
import { TRANSITION_SVG_BG_COLOR, TRANSITION_THEME } from "@styles/transition";

const FOOTER_HEIGHT = "9.375rem";

const ICON_WIDTH = "1.5rem";
const ICON_HEIGHT = "1.5rem";

const Footer: React.FC = () => {
  const theme = useTheme();

  return (
    <Wrapper>
      <Logo color={theme.primary1} showIcon={false} />
      <Spacing size={"0.75rem"} />
      <nav>
        <List
          css={css({
            justifyContent: "center",
            rowGap: "0.5rem",
          })}
        >
          <li>
            <Link href={HREF_GITHUB}>
              <GithubIcon
                css={TRANSITION_SVG_BG_COLOR}
                color={theme.text1}
                width={ICON_WIDTH}
                height={ICON_HEIGHT}
              />
              <Text fontSize="r6">{HREF_GITHUB}</Text>
            </Link>
          </li>
          <li>
            <Link href={`mailto:${HREF_MAIL}`}>
              <MailIcon
                css={TRANSITION_SVG_BG_COLOR}
                color={theme.text1}
                width={ICON_WIDTH}
                height={ICON_HEIGHT}
              />
              <Text fontSize="r6">{HREF_MAIL}</Text>
            </Link>
          </li>
        </List>
      </nav>
      <div></div>
    </Wrapper>
  );
};

const Wrapper = styled.footer`
  width: 100%;
  min-height: ${FOOTER_HEIGHT};

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  border-top: 1px solid ${({ theme }) => theme.border3};
  background-color: ${({ theme }) => theme.background1};
  ${TRANSITION_THEME}
`;

const Link = styled.a`
  display: flex;
  justify-content: center;
  align-items: center;
  column-gap: 10px;

  border-radius: 50%;
  cursor: pointer;

  color: ${({ theme }) => theme.text4};
`;

export default Footer;
