import React from "react";
import { css, useTheme } from "@emotion/react";
import ImageBox from "@components/libs/ImageBox";
import List from "@components/libs/List";
import ListRow from "@components/libs/ListRow";
import Spacing from "@components/libs/Spacing";
import Text from "@components/libs/Text";
import Contacts, {
  CONTACT_BUTTON_SIZE,
} from "@components/portfolio/profile/Contacts";
import ProfileName from "@components/portfolio/profile/ProfileName";
import { IMAGE_GITHUB } from "@constants/image";
import { TRANSITION_BOX_SHADOW_COLOR } from "@styles/transition";

const Profile: React.FC = () => {
  const theme = useTheme();

  return (
    <ListRow
      as="section"
      css={css`
        padding: 5rem 0;
        align-items: center;
        justify-content: center;
        column-gap: 8rem;
      `}
    >
      <ImageBox
        css={[
          css`
            margin-bottom: 2rem;
            border-radius: 50%;
            box-shadow: 2rem 2rem 0px 0px ${theme.quaternary1};
          `,
          TRANSITION_BOX_SHADOW_COLOR,
        ]}
        width={"20rem"}
        height={"20rem"}
        src={IMAGE_GITHUB}
        alt={"Profile Image"}
      />
      <List
        css={css`
          justify-content: center;
        `}
      >
        <Spacing size={CONTACT_BUTTON_SIZE} />
        <Text
          color={theme.text2}
          hasColorTransition={true}
          fontSize="e4"
          fontWeight="medium"
          draggable={false}
        >
          프론트엔드 개발자
        </Text>
        <ProfileName />
        <Contacts />
      </List>
    </ListRow>
  );
};

export default Profile;
