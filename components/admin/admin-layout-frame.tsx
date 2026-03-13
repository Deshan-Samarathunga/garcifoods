"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { AdminIcon } from "@/components/admin/admin-icon";
import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";

type AdminLayoutFrameProps = {
  children: ReactNode;
};

type RouteMeta = {
  trail: string;
  label: string;
  searchLabel: string;
};

type RailItem = {
  href: string;
  label: string;
  icon: "dashboard" | "catalog" | "external" | "contact" | "settings";
  target?: "_blank";
  rel?: string;
};

const railItems: RailItem[] = [
  {
    href: "/admin",
    label: "Overview",
    icon: "dashboard",
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: "catalog",
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: "settings",
  },
  {
    href: "/products",
    label: "Storefront",
    icon: "external",
    target: "_blank",
    rel: "noreferrer",
  },
] as const;

const routeMeta: Record<"overview" | "products" | "settings", RouteMeta> = {
  overview: {
    trail: "Dashboard / Overview",
    label: "Dashboard",
    searchLabel: "Search products",
  },
  products: {
    trail: "Dashboard / Products",
    label: "Product Studio",
    searchLabel: "Search catalog",
  },
  settings: {
    trail: "Dashboard / Settings",
    label: "Settings",
    searchLabel: "Open product studio",
  },
};

const desktopMediaQuery = "(min-width: 980px)";
const desktopRailPreferenceKey = "garci-admin-rail-collapsed";

const isActiveItem = (pathname: string, href: string) => {
  if (!href.startsWith("/admin")) {
    return false;
  }

  if (href === "/admin") {
    return pathname === href;
  }

  return pathname.startsWith(href);
};

export function AdminLayoutFrame({ children }: AdminLayoutFrameProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [isRailCollapsed, setIsRailCollapsed] = useState(false);
  const [hasLoadedRailPreference, setHasLoadedRailPreference] = useState(false);
  const isLoginPage = pathname === "/admin/login";
  const currentRoute = pathname.startsWith("/admin/products")
    ? routeMeta.products
    : pathname.startsWith("/admin/settings")
      ? routeMeta.settings
      : routeMeta.overview;

  useEffect(() => {
    const mediaQuery = window.matchMedia(desktopMediaQuery);
    const syncViewport = () => {
      setIsDesktopViewport(mediaQuery.matches);
    };

    syncViewport();

    const preferenceLoadTimer = window.setTimeout(() => {
      try {
        setIsRailCollapsed(window.localStorage.getItem(desktopRailPreferenceKey) === "true");
      } catch {}

      setHasLoadedRailPreference(true);
    }, 0);

    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      window.clearTimeout(preferenceLoadTimer);
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedRailPreference) {
      return;
    }

    try {
      window.localStorage.setItem(desktopRailPreferenceKey, String(isRailCollapsed));
    } catch {}
  }, [hasLoadedRailPreference, isRailCollapsed]);

  useEffect(() => {
    if (isLoginPage || !isSidebarOpen) {
      document.body.classList.remove("admin-sidebar-open");
      return;
    }

    document.body.classList.add("admin-sidebar-open");

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    const mediaQuery = window.matchMedia(desktopMediaQuery);
    const handleMediaChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      document.body.classList.remove("admin-sidebar-open");
      window.removeEventListener("keydown", handleKeyDown);
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, [isLoginPage, isSidebarOpen]);

  if (isLoginPage) {
    return children;
  }

  const handleNavigationToggle = () => {
    if (isDesktopViewport) {
      setIsRailCollapsed((current) => !current);
      return;
    }

    setIsSidebarOpen((current) => !current);
  };

  const sidebarToggleLabel = isDesktopViewport
    ? isRailCollapsed
      ? "Expand sidebar"
      : "Collapse sidebar"
    : isSidebarOpen
      ? "Close navigation"
      : "Open navigation";
  const sidebarToggleIcon: "close" | "menu" = !isDesktopViewport && isSidebarOpen ? "close" : "menu";

  return (
    <div
      className={`admin-frame${isSidebarOpen ? " is-sidebar-open" : ""}${isRailCollapsed ? " is-rail-collapsed" : ""}`}
    >
      <button
        className="admin-rail-launcher"
        type="button"
        hidden={isSidebarOpen}
        aria-controls="admin-rail"
        aria-expanded={false}
        aria-label="Open navigation"
        title="Open navigation"
        onClick={() => setIsSidebarOpen(true)}
      >
        <AdminIcon name="menu" />
      </button>

      <button
        className="admin-rail-backdrop"
        type="button"
        aria-label="Close navigation"
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside id="admin-rail" className="admin-rail" aria-label="Admin navigation">
        <div className="admin-rail-head">
          <div className="admin-rail-headbar">
            <Link className="admin-rail-brand" href="/admin" onClick={() => setIsSidebarOpen(false)}>
              <span className="admin-rail-avatar" aria-hidden="true">
                <Image
                  className="admin-rail-avatar-image"
                  src="/assets/images/brand/favicon.png"
                  alt=""
                  width={96}
                  height={96}
                  priority
                />
              </span>
              <span className="admin-rail-brandcopy">
                <strong>Garci Admin</strong>
                <small>Storefront control</small>
              </span>
            </Link>
            <button
              className="admin-rail-toggle"
              type="button"
              aria-controls="admin-rail"
              aria-expanded={isDesktopViewport ? undefined : isSidebarOpen}
              aria-pressed={isDesktopViewport ? isRailCollapsed : undefined}
              aria-label={sidebarToggleLabel}
              title={sidebarToggleLabel}
              onClick={handleNavigationToggle}
            >
              <AdminIcon name={sidebarToggleIcon} />
            </button>
          </div>

          <div className="admin-rail-status">
            <p className="admin-rail-kicker">Workspace</p>
            <strong>Storefront connected</strong>
            <span>Manage products and contact details in the same Garci visual system.</span>
          </div>
        </div>

        <nav className="admin-rail-nav" aria-label="Primary">
          {railItems.map((item) => {
            const isActive = isActiveItem(pathname, item.href);

            return (
              <Link
                key={item.href}
                className={`admin-rail-link${isActive ? " is-active" : ""}`}
                href={item.href}
                target={item.target}
                rel={item.rel}
                aria-label={item.label}
                title={isRailCollapsed ? item.label : undefined}
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="admin-rail-link-icon">
                  <AdminIcon name={item.icon} />
                </span>
                <span className="admin-rail-link-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-rail-footer">
          <AdminSignOutButton
            className="admin-rail-action is-logout"
            aria-label="Log out"
            title={isRailCollapsed ? "Log out" : undefined}
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="admin-rail-action-icon">
              <AdminIcon name="logout" />
            </span>
            <span className="admin-rail-action-label">Log out</span>
          </AdminSignOutButton>
        </div>
      </aside>

      <div className="admin-stage">
        <header className="admin-topbar">
          <div className="admin-topbar-start">
            <div className="admin-topbar-copy">
              <p className="admin-topbar-kicker">{currentRoute.trail}</p>
              <h1>{currentRoute.label}</h1>
            </div>
          </div>

          <Link
            className="admin-topbar-search"
            href="/admin/products"
            onClick={() => setIsSidebarOpen(false)}
          >
            <AdminIcon name="search" />
            <span>{currentRoute.searchLabel}</span>
          </Link>

          <div className="admin-topbar-actions">
            <Link className="admin-topbar-icon" href="/contact" target="_blank" rel="noreferrer">
              <AdminIcon name="bell" />
            </Link>
            <Link className="admin-topbar-icon" href="/" target="_blank" rel="noreferrer">
              <AdminIcon name="external" />
            </Link>
          </div>
        </header>
        <div className="admin-stage-scroll">
          <div className="admin-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
