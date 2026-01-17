"use client";

import { css } from "@emotion/react";

type TProps = {
  size: number | string;
};

const Spacing: React.FC<TProps> = ({ size }) => {
  return (
    <div
      css={css({
        height: size,
        flex: "none",
      })}
    />
  );
};

export default Spacing;
