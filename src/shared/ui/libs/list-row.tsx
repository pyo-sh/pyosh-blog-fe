import React from "react";
import { cn } from "@shared/lib/style-utils";

type TListRowProps<T extends React.ElementType = "ul"> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

const ListRow = <T extends React.ElementType = "ul">({
  as,
  className,
  children,
  ...props
}: TListRowProps<T>) => {
  const Component = as || "ul";

  return (
    <Component className={cn("flex flex-row", className)} {...props}>
      {children}
    </Component>
  );
};

ListRow.displayName = "ListRow";

export { ListRow };
