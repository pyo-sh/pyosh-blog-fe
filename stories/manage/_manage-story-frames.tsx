import { ManageLayoutShell } from "@app/manage/layout-shell";

export function ManagePageFrame({ children }: { children: React.ReactNode }) {
  return <ManageLayoutShell>{children}</ManageLayoutShell>;
}

export function ManageCanvasFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-background-1 px-4 py-6 md:px-6"
      style={{ "--admin-sidebar-offset": "15rem" } as React.CSSProperties}
    >
      <div className="mx-auto w-full max-w-[72rem] rounded-[1.5rem] border border-border-4 bg-background-1/80 p-4 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.05)] md:p-6">
        {children}
      </div>
    </div>
  );
}

export function ManageMobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background-1 px-4 py-6">
      <div className="mx-auto w-full max-w-[24.5rem] overflow-hidden rounded-[1.5rem] border border-border-4 bg-background-1 shadow-[0px_18px_60px_0px_rgba(0,0,0,0.08)]">
        <div className="relative min-h-[52rem] overflow-hidden [transform:translateZ(0)] [&_.min-h-screen]:min-h-[52rem]">
          {children}
        </div>
      </div>
    </div>
  );
}
