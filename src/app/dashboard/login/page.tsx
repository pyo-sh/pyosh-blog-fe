import { LoginForm } from "@features/admin-login";

export default function DashboardLoginPage() {
  return (
    <main className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,440px)] lg:items-center">
      <section className="max-w-2xl">
        <p className="text-body-xs uppercase tracking-[0.28em] text-text-4">
          Pyosh Blog Admin
        </p>
        <h1 className="mt-4 text-display-xs text-text-1">
          콘텐츠 운영을 위한
          <br />
          관리자 로그인
        </h1>
        <p className="mt-5 max-w-xl text-body-md text-text-3">
          대시보드, 글 관리, 통계 화면은 관리자 인증 후에만 접근할 수 있습니다.
          로그인 후 즉시 `/dashboard`로 이동합니다.
        </p>
      </section>

      <LoginForm />
    </main>
  );
}
