import React, { PropsWithChildren } from "react";
import { css } from "@emotion/react";

type TProps = PropsWithChildren<{
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  onClick?: () => void;
}>;

const List: React.FC<TProps> = ({
  as: ListComponent = "ul",
  className,
  onClick,
  children,
}) => {
  return (
    <ListComponent
      className={className}
      onClick={onClick}
      css={css`
        display: flex;
        flex-direction: column;
      `}
    >
      {children}
    </ListComponent>
  );
};

export default List;
