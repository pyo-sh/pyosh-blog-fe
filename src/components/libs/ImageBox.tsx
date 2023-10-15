import React, { useState, PropsWithChildren } from "react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import Image from "next/image";

type TProps = PropsWithChildren<{
  width?: number | string;
  height?: number | string;
  src: string;
  alt: string;
}> &
  React.HTMLAttributes<HTMLDivElement>;

const ImageBox: React.FC<TProps> = ({
  width,
  height,
  src,
  alt = "product",
  ...rest
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  return (
    <div
      css={css({
        position: "relative",
        width: width ?? "auto",
        height: height ?? "auto",
        overflow: "hidden",
        flexShrink: 0,
      })}
      {...rest}
    >
      {isLoading && <BoxSkeleton />}
      <Image
        fill
        sizes={"100%"}
        onLoadingComplete={() => {
          setIsLoading(false);
        }}
        src={src}
        alt={alt}
      />
    </div>
  );
};

const BoxSkeleton = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;

  @keyframes shine {
    to {
      background-position-x: -400%;
    }
  }

  background: ${({ theme: { background4, text4 } }) =>
    `linear-gradient(110deg, ${background4} 8%, ${text4} 20%, ${background4} 33%)`};
  background-size: 400% 100%;
  animation: 3s shine linear infinite;
`;

export default ImageBox;
