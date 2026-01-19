"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@shared/lib/style-utils";
import { LogoIcon } from "@widgets/logo/ui/logo-icon";
import { LogoText } from "@widgets/logo/ui/logo-text";

interface IProps {
  className?: string;
  showIcon?: boolean;
}

const LOGO_HEIGHT = "3rem";

const Logo: React.FC<IProps> = ({ className, showIcon = true }) => {
  return (
    <Link href="/" className={cn("flex items-center text-text-1", className)}>
      {showIcon && <LogoIcon width={LOGO_HEIGHT} height={LOGO_HEIGHT} />}
      <LogoText width={"8.75rem"} height={LOGO_HEIGHT} />
    </Link>
  );
};

export { Logo };
