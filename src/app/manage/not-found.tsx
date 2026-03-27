import { ErrorContent } from "@shared/ui/libs";

export default function ManageNotFound() {
  return (
    <div className="flex min-h-full items-center justify-center px-6 py-16">
      <ErrorContent
        badge="404 Not Found"
        badgeVariant="primary"
        title="페이지를 찾을 수 없습니다"
        description="요청하신 리소스가 없거나 이동되었습니다. 관리 홈으로 돌아가서 확인해 주세요."
        action={{
          type: "link",
          href: "/manage",
          label: "관리 홈으로 돌아가기",
        }}
      />
    </div>
  );
}
