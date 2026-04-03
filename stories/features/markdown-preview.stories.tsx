import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { MarkdownEditor, MarkdownPreview } from "@features/post-editor";

const SAMPLE_MD = `# 이미지 프리뷰

여기에 드래그 앤 드롭 또는 붙여넣기로 이미지를 추가할 수 있습니다.

## 미리보기 모드

- split
- editor-only
- modal

![샘플 이미지](https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80)
`;

function EditorAndPreviewStory() {
  const [value, setValue] = useState(SAMPLE_MD);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <MarkdownEditor
        value={value}
        onChange={setValue}
        pendingImageCount={2}
        onImageButtonClick={() => {}}
      />
      <MarkdownPreview value={value} />
    </div>
  );
}

const meta: Meta<typeof EditorAndPreviewStory> = {
  title: "Features/Manage/MarkdownPreview",
  component: EditorAndPreviewStory,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof EditorAndPreviewStory>;

export const SplitView: Story = {};
