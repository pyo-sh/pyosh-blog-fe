"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@shared/lib/style-utils";

interface IImageBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  src: string;
  alt: string;
  sizes?: string;
}

const ImageBox: React.FC<IImageBoxProps> = ({
  width,
  height,
  src,
  alt = "image",
  sizes = "100%",
  className,
  style,
  children,
  ...rest
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  return (
    <div
      className={cn("relative overflow-hidden flex-shrink-0", className)}
      style={{
        width: width ?? "auto",
        height: height ?? "auto",
        ...style,
      }}
      {...rest}
    >
      {isLoading && (
        <div
          className="absolute inset-0 w-full h-full animate-shine"
          style={{
            background:
              "linear-gradient(110deg, var(--color-background-4) 8%, var(--color-text-4) 20%, var(--color-background-4) 33%)",
            backgroundSize: "400% 100%",
          }}
          aria-hidden="true"
        />
      )}
      <Image
        fill
        sizes={sizes}
        onLoad={() => setIsLoading(false)}
        src={src}
        alt={alt}
      />
      {children}
    </div>
  );
};

ImageBox.displayName = "ImageBox";

export { ImageBox };
