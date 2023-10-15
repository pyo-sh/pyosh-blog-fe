import React from "react";
import { css } from "@emotion/react";
import Button from "@components/libs/Button";
import ImageBox from "@components/libs/ImageBox";
import List from "@components/libs/List";
import Text from "@components/libs/Text";
import SectionLayout from "@components/portfolio/SectionLayout";

const PICTURE_SIZE = "18rem";

const Project: React.FC = () => {
  return (
    <SectionLayout>
      <List as="div" css={{ rowGap: "1rem" }}>
        <Text as="h3" fontSize="e6" fontWeight="regular">
          프로젝트
        </Text>
        <Text as="span" fontSize="r4" multiline>
          {`여러 방면으로 도전중~
          프로젝트 여러개 했음~`}
        </Text>
        <Button fill="outline" theme="primary">
          보러 가실?
        </Button>
      </List>
      <ImageBox
        src={"/temp.png"}
        alt={"project picture"}
        width={PICTURE_SIZE}
        height={PICTURE_SIZE}
        css={css`
          border-radius: 20px;
        `}
      />
    </SectionLayout>
  );
};

export default Project;
