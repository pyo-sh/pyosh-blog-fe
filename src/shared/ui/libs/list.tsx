import React from "react";
import { cn } from "@shared/lib/style-utils";

type TListProps<T extends React.ElementType = "ul"> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

const List = <T extends React.ElementType = "ul">({
  as,
  className,
  children,
  ...props
}: TListProps<T>) => {
  const Component = as || "ul";

  return (
    <Component className={cn("flex flex-col", className)} {...props}>
      {children}
    </Component>
  );
};

List.displayName = "List";

export { List };
