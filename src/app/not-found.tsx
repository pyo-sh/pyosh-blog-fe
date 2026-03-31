import { ErrorContent } from "@shared/ui/libs";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-6 py-16">
      <ErrorContent
        badge="404 Not Found"
        badgeVariant="primary"
        title="페이지를 찾을 수 없습니다"
        description="요청하신 페이지가 없거나 이동되었습니다. 홈으로 돌아가서 다른 글을 확인해 주세요."
        action={{ type: "link", href: "/", label: "홈으로 돌아가기" }}
        context="public"
        eyebrow="Public Status"
      />
    </main>
  );
}
