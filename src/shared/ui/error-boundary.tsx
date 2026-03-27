"use client";

import React from "react";
import { ErrorContent } from "@shared/ui/libs";

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[React Error]", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-[100dvh] items-center justify-center px-6 py-16">
          <ErrorContent
            badge="오류가 발생했습니다"
            badgeVariant="negative"
            title="문제가 발생했습니다"
            description="페이지를 불러오는 중 예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
            action={{
              type: "button",
              onClick: () => this.setState({ hasError: false }),
              label: "다시 시도",
            }}
          />
        </main>
      );
    }

    return this.props.children;
  }
}
