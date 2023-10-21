import React, { PropsWithChildren } from "react";
import { useTheme } from "@emotion/react";
import ListRow from "@components/libs/ListRow";
import Text from "@components/libs/Text";

const Navigation: React.FC = () => {
  return (
    <nav>
      <ListRow css={{ paddingTop: "1rem", columnGap: "1.25rem" }}>
        <NavItem path="/">Main</NavItem>
        <NavItem path="/portfolio">About</NavItem>
      </ListRow>
    </nav>
  );
};

type TNavItemProps = PropsWithChildren<{
  path: string;
}>;
const NavItem: React.FC<TNavItemProps> = ({ path, children }) => {
  const theme = useTheme();
  const color = theme.text2;

  return (
    <li>
      <a href={path}>
        <Text color={color} fontWeight={"light"} fontSize="r4">
          {children}
        </Text>
      </a>
    </li>
  );
};

export default Navigation;
