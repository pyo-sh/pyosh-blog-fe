import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { AssetUploader } from "@features/asset-uploader";

const meta: Meta<typeof AssetUploader> = {
  title: "Widgets/Admin/AssetGallery",
  component: AssetUploader,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof AssetUploader>;

export const Default: Story = {};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/admin/assets", () => {
          return HttpResponse.json({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
        }),
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/admin/assets", () => {
          return new HttpResponse(null, { status: 500 });
        }),
      ],
    },
  },
};

export const DarkMode: Story = {
  parameters: {
    themes: { themeOverride: "dark" },
  },
};
