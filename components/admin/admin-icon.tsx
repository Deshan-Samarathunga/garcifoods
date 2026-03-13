import type { ReactNode, SVGProps } from "react";

type AdminIconName =
  | "bell"
  | "catalog"
  | "close"
  | "contact"
  | "dashboard"
  | "external"
  | "logout"
  | "menu"
  | "search"
  | "settings";

type AdminIconProps = SVGProps<SVGSVGElement> & {
  name: AdminIconName;
};

const iconPaths: Record<AdminIconName, ReactNode> = {
  bell: (
    <>
      <path d="M12 4a4 4 0 0 0-4 4v1.3c0 .7-.2 1.3-.6 1.9L6 13h12l-1.4-1.8c-.4-.5-.6-1.2-.6-1.9V8a4 4 0 0 0-4-4Z" />
      <path d="M10 16a2 2 0 0 0 4 0" />
    </>
  ),
  catalog: (
    <>
      <rect x="4" y="5" width="7" height="7" rx="1.5" />
      <rect x="13" y="5" width="7" height="7" rx="1.5" />
      <rect x="4" y="14" width="7" height="7" rx="1.5" />
      <rect x="13" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  contact: (
    <>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
      <path d="m6 8 6 4 6-4" />
    </>
  ),
  dashboard: (
    <>
      <path d="M5 11.5 12 6l7 5.5" />
      <path d="M7 10.5V19h10v-8.5" />
    </>
  ),
  external: (
    <>
      <path d="M14 5h5v5" />
      <path d="m10 14 9-9" />
      <path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" />
    </>
  ),
  logout: (
    <>
      <path d="M10 6V4.8A1.8 1.8 0 0 1 11.8 3H18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-6.2A1.8 1.8 0 0 1 10 19.2V18" />
      <path d="M4 12h10" />
      <path d="m10 8 4 4-4 4" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  settings: (
    <>
      <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
      <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4.8a7.8 7.8 0 0 0-1.7-1l-.4-2.5h-4l-.4 2.5a7.8 7.8 0 0 0-1.7 1l-2.4-.8-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-.8c.5.4 1.1.7 1.7 1l.4 2.5h4l.4-2.5c.6-.3 1.2-.6 1.7-1l2.4.8 2-3.4-2-1.5c.1-.3.1-.7.1-1Z" />
    </>
  ),
};

export function AdminIcon({ name, ...props }: AdminIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {iconPaths[name]}
    </svg>
  );
}
