import { css } from "@emotion/react";

type TProps = {
  size: number | string;
};

const RowSpacing: React.FC<TProps> = ({ size }) => {
  return (
    <div
      css={css({
        width: size,
        flex: "none",
      })}
    />
  );
};

export default RowSpacing;
