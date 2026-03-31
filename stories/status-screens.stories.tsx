import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from "@iconify/react";
import folderOpenLinear from "@iconify-icons/solar/folder-open-linear";
import magniferZoomOutLinear from "@iconify-icons/solar/magnifer-zoom-out-linear";
import { EmptyState, ErrorContent, Skeleton } from "@shared/ui/libs";

const meta = {
  title: "Shared/Status Screens",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const PublicError: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <ErrorContent
        badge="404 Not Found"
        badgeVariant="primary"
        eyebrow="Public Status"
        context="public"
        title="페이지를 찾을 수 없습니다"
        description="요청하신 페이지가 없거나 이동되었습니다. 홈으로 돌아가서 다른 글을 확인해 주세요."
        action={{ type: "link", href: "/", label: "홈으로 돌아가기" }}
      />
    </div>
  ),
};

export const AdminError: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <ErrorContent
        badge="500 Server Error"
        badgeVariant="negative"
        eyebrow="Admin Status"
        context="admin"
        title="문제가 발생했습니다"
        description="관리 화면 데이터를 불러오는 중 예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
        action={{ type: "button", onClick: () => undefined, label: "다시 시도" }}
      />
    </div>
  ),
};

export const EmptyStates: Story = {
  render: () => (
    <div className="grid min-h-screen gap-6 bg-background-1 px-6 py-10 md:grid-cols-3">
      <EmptyState
        variant="page"
        icon={<Icon icon={magniferZoomOutLinear} width="20" aria-hidden="true" />}
        title="검색 결과가 없습니다"
        description="검색어를 다시 확인하거나 다른 키워드로 시도해 주세요."
      />
      <EmptyState
        variant="default"
        icon={<Icon icon={folderOpenLinear} width="20" aria-hidden="true" />}
        message="현재 등록된 댓글이 없습니다."
      />
      <EmptyState
        variant="admin-page"
        icon={<Icon icon={folderOpenLinear} width="20" aria-hidden="true" />}
        title="표시할 관리 데이터가 없습니다"
        description="필터를 조정하거나 새 데이터를 추가한 뒤 다시 확인해 주세요."
      />
    </div>
  ),
};

export const LoadingPatterns: Story = {
  render: () => (
    <div className="grid min-h-screen gap-6 bg-background-1 px-6 py-10 xl:grid-cols-2">
      <section className="rounded-[2rem] border border-border-3 bg-background-2/90 p-8">
        <div className="space-y-3">
          <Skeleton height="1rem" width="7rem" tone="soft" />
          <Skeleton height="2.5rem" width="14rem" tone="strong" />
          <Skeleton repeat={2} tone="soft" />
        </div>
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[1.5rem] border border-border-3 bg-background-1 p-5"
            >
              <div className="mb-4 flex items-center gap-3">
                <Skeleton
                  height="1.5rem"
                  width="5rem"
                  className="rounded-md"
                  tone="soft"
                />
                <Skeleton height="0.875rem" width="4rem" tone="soft" />
              </div>
              <Skeleton height="1.75rem" width="16rem" tone="strong" />
              <div className="mt-3 space-y-2">
                <Skeleton repeat={2} tone="soft" />
                <Skeleton width="70%" tone="soft" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-border-3 bg-background-2/90 p-8">
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[1.5rem] border border-border-3 bg-background-1 p-5"
            >
              <Skeleton height="1rem" width="5rem" tone="soft" />
              <div className="mt-4">
                <Skeleton height="2.25rem" width="6rem" tone="strong" />
              </div>
              <div className="mt-4">
                <Skeleton tone="soft" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
};
