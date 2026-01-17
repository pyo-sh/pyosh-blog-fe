"use client";

import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { BrushIcon } from "@components/icons";
import Text from "@components/libs/Text";
import { TRANSITION_SVG_BG_COLOR } from "@styles/transition";

const BRUSH_WIDTH = "26rem";
const BRUSH_HEIGHT = "5.469rem";
const ProfileName: React.FC = () => {
  const theme = useTheme();

  return (
    <Wrapper as={"h1"} draggable={false}>
      <BackGroundBrush
        css={TRANSITION_SVG_BG_COLOR}
        width={BRUSH_WIDTH}
        height={BRUSH_HEIGHT}
        color={theme.background4}
      />
      <Text
        fontSize="e1"
        css={{ position: "relative", color: theme.text1 }}
        hasColorTransition={true}
      >
        표석훈
      </Text>
    </Wrapper>
  );
};

const Wrapper = styled(Text)`
  margin-top: 0.5rem;

  position: relative;
  display: flex;
  flex-wrap: nowrap;
`;

const BackGroundBrush = styled(BrushIcon)`
  position: absolute;
  margin-top: -0.4rem;
  margin-left: -4rem;
`;

export default ProfileName;
