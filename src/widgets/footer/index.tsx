import React from "react";
import { Icon } from "@iconify/react";
import letterLinear from "@iconify-icons/solar/letter-linear";
import linkMinimalistic2Linear from "@iconify-icons/solar/link-minimalistic-2-linear";
import Link from "next/link";
import { URLS } from "@shared/constant/url";
import { LogoIcon } from "@widgets/logo/ui/logo-icon";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border-4 bg-background-2">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <LogoIcon width="1.25rem" height="1.25rem" className="text-text-4" />
          <span className="text-ui-xs text-text-4">
            © {new Date().getFullYear()} pyosh. All rights reserved.
          </span>
        </div>

        <nav aria-label="푸터 링크">
          <ul className="flex items-center gap-4">
            <li>
              <Link
                href="/guestbook"
                className="text-ui-xs text-text-3 underline-offset-4 transition-colors hover:text-text-1 hover:underline"
              >
                방명록
              </Link>
            </li>

            <li>
              <Link
                href={URLS.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub 프로필 pyo-sh"
                className="flex items-center gap-1 text-ui-xs text-text-3 underline-offset-4 transition-colors hover:text-text-1 hover:underline"
              >
                <Icon
                  icon={linkMinimalistic2Linear}
                  width="12"
                  aria-hidden="true"
                />
                GitHub
              </Link>
            </li>

            <li>
              <Link
                href={`mailto:${URLS.mail}`}
                aria-label={`이메일 ${URLS.mail}`}
                className="flex items-center gap-1 text-ui-xs text-text-3 underline-offset-4 transition-colors hover:text-text-1 hover:underline"
              >
                <Icon icon={letterLinear} width="12" aria-hidden="true" />
                Email
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

Footer.displayName = "Footer";

export { Footer };
