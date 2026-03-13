import "./admin-finetune.css";

import type { ReactNode } from "react";

import { AdminLayoutFrame } from "@/components/admin/admin-layout-frame";

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="admin-shell">
      <AdminLayoutFrame>{children}</AdminLayoutFrame>
    </div>
  );
}
