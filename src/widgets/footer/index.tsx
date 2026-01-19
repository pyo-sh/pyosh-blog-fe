import React from "react";
import Link from "next/link";
import { URLS } from "@shared/constant/url";
import { GithubIcon, MailIcon } from "@shared/ui/icons";
import { Text } from "@shared/ui/libs";
import { Logo } from "@widgets/logo";

const Footer: React.FC = () => {
  return (
    <footer className="w-full min-h-[9.375rem] flex flex-col justify-center items-center border-t border-border-3 bg-background-1">
      <Logo showIcon={false} />

      <div className="h-3" />

      <nav>
        <ul className="flex flex-col justify-center items-center gap-2">
          <li>
            <Link
              href={URLS.github}
              className="flex justify-center items-center gap-2.5 text-text-4 hover:text-text-1 transition-colors"
            >
              <GithubIcon
                className="transition-colors"
                width="1.5rem"
                height="1.5rem"
              />
              <Text fontSize="body-xs">{URLS.github}</Text>
            </Link>
          </li>

          <li>
            <Link
              href={`mailto:${URLS.mail}`}
              className="flex justify-center items-center gap-2.5 text-text-4 hover:text-text-1 transition-colors"
            >
              <MailIcon
                className="transition-colors"
                width="1.5rem"
                height="1.5rem"
              />
              <Text fontSize="body-xs">{URLS.mail}</Text>
            </Link>
          </li>
        </ul>
      </nav>
    </footer>
  );
};

Footer.displayName = "Footer";

export { Footer };
