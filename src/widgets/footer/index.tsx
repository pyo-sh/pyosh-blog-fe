import React from "react";
import Link from "next/link";
import { URLS } from "@shared/constant/url";
import { GithubIcon, MailIcon } from "@shared/ui/icons";
import { Text } from "@shared/ui/libs";

const Footer: React.FC = () => {
  return (
    <footer className="w-full flex flex-col justify-center items-center border-t border-border-3 bg-background-1 py-8">
      <nav aria-label="소셜 링크">
        <ul className="flex flex-col justify-center items-center gap-2">
          <li>
            <Link
              href={URLS.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub 프로필 pyo-sh"
              className="flex justify-center items-center gap-2.5 text-text-4 hover:text-text-1 transition-colors"
            >
              <GithubIcon
                className="transition-colors"
                width="1.5rem"
                height="1.5rem"
              />
              <Text fontSize="body-xs">pyo-sh</Text>
            </Link>
          </li>

          <li>
            <Link
              href={`mailto:${URLS.mail}`}
              aria-label={`이메일 ${URLS.mail}`}
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

      <div className="mt-4">
        <Text fontSize="body-xs" className="text-text-4">
          © {new Date().getFullYear()} pyo-sh
        </Text>
      </div>
    </footer>
  );
};

Footer.displayName = "Footer";

export { Footer };
