import { ManageLayoutShell } from "./layout-shell";

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ManageLayoutShell>{children}</ManageLayoutShell>;
}
