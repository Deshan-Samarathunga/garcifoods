"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname() ?? "/";
  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    document.body.classList.toggle("admin-route", isAdminRoute);

    return () => {
      document.body.classList.remove("admin-route");
    };
  }, [isAdminRoute]);

  return (
    <>
      {isAdminRoute ? null : <SiteHeader />}
      {children}
      {isAdminRoute ? null : <SiteFooter />}
    </>
  );
}
