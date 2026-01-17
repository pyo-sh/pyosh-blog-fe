"use client";

import React from "react";
import Button from "@components/libs/Button";
import ImageBox from "@components/libs/ImageBox";
import List from "@components/libs/List";
import Text from "@components/libs/Text";
import SectionLayout from "@components/portfolio/SectionLayout";

const PICTURE_SIZE = "18rem";

const Experience: React.FC = () => {
  return (
    <SectionLayout>
      <List as="div" css={{ rowGap: "1rem" }}>
        <Text as="h3" fontSize="e6" fontWeight="regular">
          개발 경력
        </Text>
        <Text as="span" fontSize="r4" multiline>
          {`열심히 한다 어쩌고 저쩌고
          교류를 통해 성장 예정 쌸라`}
        </Text>
        <Button fill="outline" theme="primary">
          보러 가실?
        </Button>
      </List>
      <ImageBox
        src={"/temp.png"}
        alt="exciting picture"
        width={PICTURE_SIZE}
        height={PICTURE_SIZE}
      />
    </SectionLayout>
  );
};

export default Experience;
