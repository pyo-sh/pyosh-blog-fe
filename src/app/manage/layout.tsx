import type { Metadata } from "next";
import { ManageLayoutShell } from "./layout-shell";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ManageLayoutShell>{children}</ManageLayoutShell>;
}
