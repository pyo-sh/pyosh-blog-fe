import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@shared/lib/style-utils";

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  width?: string | number;
  height?: string | number;
  shape?: "rounded" | "squared" | "circled";
  fill?: "fill" | "outline" | "weak";
  theme?: "primary" | "error" | "positive";
  showShadow?: boolean;
}

const Button = forwardRef<HTMLButtonElement, IButtonProps>(
  (
    {
      shape = "squared",
      fill = "fill",
      theme = "positive",
      showShadow = true,
      className,
      ...props
    },
    ref,
  ) => {
    const shapeClasses = {
      rounded: "rounded-[35px]",
      squared: "rounded-[3px]",
      circled: "rounded-[50%]",
    };

    const getVariantClasses = () => {
      if (fill === "fill") {
        return {
          primary: "bg-primary-1 text-text-1",
          error: "bg-negative-1 text-text-1",
          positive: "bg-positive-1 text-text-1",
        }[theme];
      }
      if (fill === "outline") {
        return {
          primary: "bg-transparent text-primary-1 border border-primary-1",
          error: "bg-transparent text-negative-1 border border-negative-1",
          positive: "bg-transparent text-positive-1 border border-positive-1",
        }[theme];
      }

      return {
        primary: "bg-transparent text-primary-1",
        error: "bg-transparent text-negative-1",
        positive: "bg-transparent text-positive-1",
      }[theme];
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center px-2 py-2 cursor-pointer",
          "transition-all duration-300 hover:-translate-y-[7px]",
          shapeClasses[shape],
          getVariantClasses(),
          showShadow && "shadow-[0px_2px_7px_0px_rgba(0,0,0,0.26)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
export { Button };
