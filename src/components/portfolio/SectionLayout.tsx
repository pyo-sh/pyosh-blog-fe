import React, { PropsWithChildren } from "react";
import styled from "@emotion/styled";
import { TRANSITION_BG_COLOR } from "@styles/transition";

const PORTFOLIO_WIDTH = "67.5";

type TProps = PropsWithChildren;

const SectionLayout: React.FC<TProps> = ({ children }) => {
  return (
    <Section>
      <ListSizer>{children}</ListSizer>
    </Section>
  );
};

const Section = styled.section`
  padding: 4.5rem 0;

  &:nth-of-type(odd) {
    border-top: 1px solid ${({ theme }) => theme.border3};
    border-bottom: 1px solid ${({ theme }) => theme.border3};
    box-shadow: 0 8px 8px -6px ${({ theme }) => theme.border3};

    & > div {
      flex-direction: row-reverse;
    }
  }
  &:nth-of-type(even) {
    background-color: ${({ theme }) => theme.background2};
    ${TRANSITION_BG_COLOR}
  }
  &:first-of-type {
    border-top: none;
  }
  &:last-of-type {
    border-bottom: none;
  }
`;

const ListSizer = styled.div`
  max-width: ${PORTFOLIO_WIDTH};
  width: 100%;
  margin: 0 auto;
  padding: 0 9.6rem;

  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 6rem;
`;

export default SectionLayout;
