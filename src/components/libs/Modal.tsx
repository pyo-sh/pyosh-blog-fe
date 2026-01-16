import React, { PropsWithChildren } from "react";
import ReactDom from "react-dom";
import styled from "@emotion/styled";
import { TRANSITION_BG_COLOR, TRANSITION_THEME } from "@styles/transition";

type TProps = PropsWithChildren<{
  withBackground?: boolean;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>;

const Portal: React.FC<PropsWithChildren> = ({ children }) => {
  const element = document.body;

  return ReactDom.createPortal(children, element);
};

const Modal: React.FC<TProps> = ({
  isOpen,
  setIsOpen,
  withBackground,
  children,
  ...rest
}) => {
  if (!isOpen) {
    return <></>;
  }

  return (
    <Portal>
      <Background
        withBackground={withBackground ?? false}
        onClick={() => setIsOpen(false)}
      >
        <Content onClick={(e) => e.stopPropagation()} {...rest}>
          {children}
        </Content>
      </Background>
    </Portal>
  );
};

const Background = styled.div<{ withBackground: boolean }>`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  text-align: center;
  ${({ withBackground, theme }) =>
    withBackground
      ? `
    opacity: 50%;
    background-color: ${theme.grey2};
  `
      : ""}
  ${TRANSITION_BG_COLOR}
`;

const Content = styled.div`
  min-width: 21.875rem;
  min-height: 5rem;
  max-height: 85%;
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.background2};
  ${TRANSITION_THEME}
  border-radius: 10px;
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.19),
    0 0px 6px rgba(0, 0, 0, 0.22);
`;

export default Modal;
