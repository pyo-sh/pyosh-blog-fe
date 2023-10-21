import React from "react";
import styled from "@emotion/styled";
import Button from "@components/libs/Button";
import useCapture from "@hooks/useCapture";

const Main: React.FC = () => {
  const { compRef, captureImage, savePDF } = useCapture<HTMLDivElement>();

  return (
    <Wrapper ref={compRef}>
      테스팅
      <Button onClick={captureImage}>캡처</Button>
      <Button onClick={savePDF}>저장</Button>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
`;

export default Main;
