import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { MarkdownEditor } from "@features/post-editor";

const SAMPLE_MD = `# 마크다운 에디터

**볼드**, *이탤릭*, ~~취소선~~

## CodeMirror 6

\`인라인 코드\`와 코드 블록:

\`\`\`typescript
const editor = new EditorView({ state });
\`\`\`

### 목록

- 항목 1
- 항목 2

1. 순서 목록
2. 두 번째 항목

> 인용 블록

---

| 제목 | 제목 |
|---|---|
| 내용 | 내용 |
`;

function ControlledEditor(args: { placeholderText?: string; initialValue?: string }) {
  const [value, setValue] = useState(args.initialValue ?? "");

  return (
    <div className="space-y-2">
      <MarkdownEditor
        value={value}
        onChange={setValue}
        placeholderText={args.placeholderText}
      />
      <p className="text-xs text-text-4">{value.length}자</p>
    </div>
  );
}

const meta: Meta<typeof ControlledEditor> = {
  title: "Features/Manage/MarkdownEditor",
  component: ControlledEditor,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof ControlledEditor>;

export const Empty: Story = {};

export const WithContent: Story = {
  args: {
    initialValue: SAMPLE_MD,
  },
};

export const DarkMode: Story = {
  args: {
    initialValue: SAMPLE_MD,
  },
  parameters: {
    themes: { themeOverride: "dark" },
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholderText: "여기에 내용을 입력하세요...",
  },
};
