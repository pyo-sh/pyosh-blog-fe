"use client";

import React, { PropsWithChildren } from "react";
import { css } from "@emotion/react";

type TProps = PropsWithChildren<{
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  onClick?: () => void;
}>;

const ListRow: React.FC<TProps> = ({
  as: ListRowComponent = "ul",
  className,
  onClick,
  children,
}) => {
  return (
    <ListRowComponent
      className={className}
      onClick={onClick}
      css={css`
        display: flex;
        flex-direction: row;
      `}
    >
      {children}
    </ListRowComponent>
  );
};

export default ListRow;
