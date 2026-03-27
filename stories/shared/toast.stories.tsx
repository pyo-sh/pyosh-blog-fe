import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "sonner";
import { Button } from "@shared/ui/libs";
import { toast } from "sonner";

const ToastDemo = () => (
  <div className="flex gap-2">
    <Toaster />
    <Button onClick={() => toast("기본 알림 메시지입니다.")}>기본</Button>
    <Button onClick={() => toast.success("성공적으로 처리됐습니다.")}>성공</Button>
    <Button onClick={() => toast.error("오류가 발생했습니다.")}>오류</Button>
  </div>
);

const meta: Meta<typeof ToastDemo> = {
  title: "Shared/Toast",
  component: ToastDemo,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof ToastDemo>;

export const Default: Story = {};

export const DarkMode: Story = {
  parameters: {
    themes: { themeOverride: "dark" },
  },
};
