"use client";

import { signOut } from "next-auth/react";

export function AdminSignOutButton() {
  return (
    <button className="btn btn-secondary" type="button" onClick={() => signOut({ callbackUrl: "/" })}>
      Sign Out
    </button>
  );
}
