"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login } from "@entities/auth";
import { getErrorMessage } from "@shared/lib/get-error-message";
import { Spinner } from "@shared/ui/libs";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const busy = isLoading || isPending;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      await login({
        username,
        password,
      });

      startTransition(() => {
        router.push("/manage");
        router.refresh();
      });
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-border-3 bg-background-2 p-8 shadow-[0px_24px_80px_0px_rgba(0,0,0,0.08)]"
    >
      <div>
        <p className="text-body-xs uppercase tracking-[0.24em] text-text-4">
          Admin access
        </p>
        <h2 className="mt-3 text-h2 text-text-1">관리자 로그인</h2>
        <p className="mt-3 text-body-sm text-text-3">
          관리자 계정으로 로그인해 대시보드와 글 관리 기능에 접근합니다.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        <label className="block">
          <span className="text-body-sm font-medium text-text-1">사용자명</span>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="사용자명을 입력하세요"
            disabled={busy}
            className="mt-2 w-full rounded-[1rem] border border-border-3 bg-background-1 px-4 py-3 text-body-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
            required
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          <p className="mt-2 text-body-xs text-text-4">
            등록된 사용자명을 공백 없이 그대로 입력해 주세요.
          </p>
        </label>

        <label className="block">
          <span className="text-body-sm font-medium text-text-1">비밀번호</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호를 입력하세요"
            disabled={busy}
            className="mt-2 w-full rounded-[1rem] border border-border-3 bg-background-1 px-4 py-3 text-body-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1 disabled:cursor-not-allowed disabled:opacity-60"
            required
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-8 inline-flex w-full items-center justify-center rounded-[1rem] bg-primary-1 px-4 py-3 text-body-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? (
          <>
            <Spinner size="sm" /> 로그인 중
          </>
        ) : (
          "로그인"
        )}
      </button>
    </form>
  );
}
