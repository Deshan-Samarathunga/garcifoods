"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { signOut } from "next-auth/react";

type AdminSignOutButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
};

export function AdminSignOutButton({
  children,
  className,
  onClick,
  ...props
}: AdminSignOutButtonProps) {
  return (
    <button
      className={className ?? "btn admin-btn-ghost"}
      type="button"
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        signOut({ callbackUrl: "/admin/login" });
      }}
      {...props}
    >
      {children ?? "Sign Out"}
    </button>
  );
}
