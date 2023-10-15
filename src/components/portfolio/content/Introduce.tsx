import React from "react";
import { css } from "@emotion/react";
import ImageBox from "@components/libs/ImageBox";
import List from "@components/libs/List";
import Text from "@components/libs/Text";
import SectionLayout from "@components/portfolio/SectionLayout";
import { IMAGE_PYO_PICTURE1 } from "@constants/image";

const PICTURE_SIZE = "18rem";
const LIST_WIDTH = "13rem";

const Introduce: React.FC = () => {
  return (
    <SectionLayout>
      <List
        css={css`
          width: ${LIST_WIDTH};
          margin-left: 1rem;
          row-gap: 0.75rem;
        `}
      >
        <Text as="dt" fontSize="e6" fontWeight="regular">
          소개
        </Text>
        {[
          "1997년 6월 9일 생",
          "MBTI는 INFJ",
          "취미가 요리인 듯함",
          "바닐라 라떼를 즐겨 마심",
          "무언가 만드는 걸 즐거워함",
          "일생을 기록하려고 노력 중",
        ].map((text, index) => (
          <Text key={index} as="li" fontSize="r5">
            {text}
          </Text>
        ))}
      </List>
      <ImageBox
        src={IMAGE_PYO_PICTURE1}
        alt={"intro picture"}
        width={PICTURE_SIZE}
        height={PICTURE_SIZE}
        css={css`
          border-radius: 20px;
        `}
      />
    </SectionLayout>
  );
};

export default Introduce;
