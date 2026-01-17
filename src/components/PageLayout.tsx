"use client";

import { PropsWithChildren } from "react";
import styled from "@emotion/styled";
import Footer from "./Footer";
import Header from "./Header";
import { TRANSITION_THEME } from "@styles/transition";

const PageLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Wrapper>
      <Header />
      {children}
      <Footer />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.background1};
  ${TRANSITION_THEME}
`;

export default PageLayout;
