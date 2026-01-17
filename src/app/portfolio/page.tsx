"use client";

import React from "react";
import styled from "@emotion/styled";
import List from "@components/libs/List";
import Experience from "@components/portfolio/content/Experience";
import Introduce from "@components/portfolio/content/Introduce";
import Project from "@components/portfolio/content/Project";
import Profile from "@components/portfolio/profile";

const Portfolio: React.FC = () => {
  return (
    <Wrapper as={"article"}>
      <Profile />
      <Introduce />
      <Experience />
      <Project />
      {/* OAuth를 이용한 댓글 기능 예정 */}
    </Wrapper>
  );
};

const Wrapper = styled(List)`
  width: 100%;
`;

export default Portfolio;
