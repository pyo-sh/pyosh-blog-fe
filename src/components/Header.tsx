"use client";

import React, { useEffect, useRef, useState } from "react";
import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import ThemeChanger from "@components/common/ThemeChanger";
import ListRow from "@components/libs/ListRow";
import Logo from "@components/logo";
import Navigation from "@components/Navigation";
import { transitionWithColor } from "@styles/transition";
import throttle from "@utils/throttle";

const HEADER_WIDTH = "67.5rem";
const HEADER_HEIGHT = "5.625rem";

const ICON_WIDTH = "1.75rem";
const ICON_HEIGHT = "1.75rem";

const Header: React.FC = () => {
  const theme = useTheme();
  const [isShown, setIsShown] = useState<boolean>(true);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let prevY = window.scrollY;

    const handleScroll = throttle(() => {
      if (!headerRef.current) {
        return;
      }

      const nowY = window.scrollY;
      const isTop = nowY <= headerRef.current.clientHeight;
      const isUp = prevY - nowY >= 0;

      prevY = nowY;
      setIsShown(isTop || isUp);
    }, 100);

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div css={css({ paddingTop: HEADER_HEIGHT })}>
      <Wrapper
        ref={headerRef}
        css={{
          transform: isShown
            ? "translateY(0)"
            : `translateY(-${HEADER_HEIGHT})`,
        }}
      >
        <Sizer>
          <Logo />
          <ListRow as="div" css={css({ columnGap: "2rem" })}>
            <Navigation />
            <ThemeChanger
              width={ICON_WIDTH}
              height={ICON_HEIGHT}
              color={theme.text1}
            />
          </ListRow>
        </Sizer>
      </Wrapper>
    </div>
  );
};

const Wrapper = styled.header`
  width: 100%;
  height: ${HEADER_HEIGHT};

  position: fixed;
  top: 0;
  z-index: 1000;

  display: flex;
  justify-content: center;

  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.background1};
  ${transitionWithColor("transform 0.3s")}
`;

const Sizer = styled.div`
  max-width: ${HEADER_WIDTH};
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0 1.5rem;

  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export default Header;
