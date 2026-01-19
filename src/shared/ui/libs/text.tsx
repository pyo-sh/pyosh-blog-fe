import React from "react";
import { cn } from "@shared/lib/style-utils";

type FontSize =
  // Heading
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  // Body
  | "body-xl"
  | "body-lg"
  | "body-md"
  | "body-base"
  | "body-sm"
  | "body-xs"
  // Display
  | "display-xl"
  | "display-lg"
  | "display-md"
  | "display-base"
  | "display-sm"
  | "display-xs";

type FontWeight = "light" | "regular" | "medium" | "bold";

type TextProps<T extends React.ElementType = "span"> = {
  as?: T;
  draggable?: boolean;
  ellipsis?: boolean;
  multiline?: boolean;
  fontSize?: FontSize;
  fontWeight?: FontWeight;
  hasColorTransition?: boolean;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

const fontWeightMap: Record<FontWeight, string> = {
  light: "font-light", // 300
  regular: "font-normal", // 400
  medium: "font-medium", // 500
  bold: "font-bold", // 700
};

const Text = <T extends React.ElementType = "span">({
  as,
  draggable = true,
  ellipsis = false,
  multiline = false,
  fontSize,
  fontWeight,
  hasColorTransition = false,
  className,
  children,
  role,
  ...props
}: TextProps<T>) => {
  const Component = as || "span";

  return (
    <Component
      className={cn(
        // Base
        hasColorTransition && "transition-colors duration-[250ms]",
        // Draggable
        !draggable && "select-none [-webkit-user-drag:none]",
        // Ellipsis
        ellipsis && "overflow-hidden text-ellipsis whitespace-nowrap",
        // Font size
        fontSize && `text-${fontSize}`,
        // Font weight override
        fontWeight && fontWeightMap[fontWeight],
        className,
      )}
      role={role ?? "text"}
      {...props}
    >
      {multiline && typeof children === "string"
        ? convertStringToLinedJSX(children)
        : children}
    </Component>
  );
};

const convertStringToLinedJSX = (str: string) => {
  return str.split("\n").map((line, index) => (
    <React.Fragment key={index}>
      {index > 0 && <br />}
      {line}
    </React.Fragment>
  ));
};

Text.displayName = "Text";

export { Text };
export type { TextProps, FontSize, FontWeight };
