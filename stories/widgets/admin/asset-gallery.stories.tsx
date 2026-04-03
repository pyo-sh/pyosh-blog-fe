import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { AssetUploader } from "@features/asset-uploader";

const assets = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  url: `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80&sig=${index + 1}`,
  mimeType: "image/jpeg",
  sizeBytes: 420000 + index * 120000,
  width: 1920,
  height: 1080,
  createdAt: "2026-03-28T10:00:00.000Z",
}));

const meta: Meta<typeof AssetUploader> = {
  title: "Widgets/AssetGallery",
  component: AssetUploader,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof AssetUploader>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/assets", () =>
          HttpResponse.json({
            data: assets,
            meta: { total: 6, page: 1, limit: 18, totalPages: 1 },
          }),
        ),
      ],
    },
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/assets", () =>
          HttpResponse.json({
            data: [],
            meta: { total: 0, page: 1, limit: 18, totalPages: 0 },
          }),
        ),
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("*/api/assets", () => new HttpResponse(null, { status: 500 })),
      ],
    },
  },
};

export const DarkMode: Story = {
  parameters: {
    themes: { themeOverride: "dark" },
  },
};
