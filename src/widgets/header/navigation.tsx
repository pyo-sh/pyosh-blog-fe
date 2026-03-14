import React from "react";
import Link from "next/link";
import { ListRow, Text } from "@shared/ui/libs";

const navItems = [
  { label: "홈", path: "/" },
  { label: "인기", path: "/popular" },
  { label: "태그", path: "/tags" },
  { label: "방명록", path: "/guestbook" },
] as const;

const Navigation: React.FC = () => {
  return (
    <nav>
      <ListRow className="pt-4 gap-5">
        {navItems.map((item) => (
          <NavItem key={item.path} path={item.path}>
            {item.label}
          </NavItem>
        ))}
      </ListRow>
    </nav>
  );
};

type NavItemProps = {
  path: string;
  children: React.ReactNode;
};

const NavItem: React.FC<NavItemProps> = ({ path, children }) => {
  return (
    <li>
      <Link href={path}>
        <Text
          fontSize="body-sm"
          fontWeight="light"
          className="text-text-2 hover:text-primary-1 transition-colors"
        >
          {children}
        </Text>
      </Link>
    </li>
  );
};

Navigation.displayName = "Navigation";

export { Navigation };
