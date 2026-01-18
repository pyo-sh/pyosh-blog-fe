"use client";

import React from "react";
import Button from "@components/libs/Button";
import useCapture from "@hooks/useCapture";

const Home: React.FC = () => {
  const { compRef, captureImage, savePDF } = useCapture<HTMLDivElement>();

  return (
    <div className="w-full" ref={compRef}>
      테스팅
      <Button onClick={captureImage}>캡처</Button>
      <Button onClick={savePDF}>저장</Button>
    </div>
  );
};

export default Home;
