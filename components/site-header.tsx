"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { navigationItems } from "@/lib/site";

const getNavItemClassName = (isActive: boolean) => {
  return isActive ? "is-active" : undefined;
};

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    document.body.classList.add("js-enabled");
    document.body.classList.toggle("home-page", pathname === "/");

    return () => {
      document.body.classList.remove("home-page");
    };
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("nav-open", isOpen);

    return () => {
      document.body.classList.remove("nav-open");
    };
  }, [isOpen]);

  useEffect(() => {
    const syncHeaderState = () => {
      setIsScrolled(window.scrollY > 16);
    };

    syncHeaderState();
    window.addEventListener("scroll", syncHeaderState, { passive: true });

    return () => {
      window.removeEventListener("scroll", syncHeaderState);
    };
  }, []);

  useEffect(() => {
    const closeNavigationOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", closeNavigationOnEscape);

    return () => {
      document.removeEventListener("keydown", closeNavigationOnEscape);
    };
  }, []);

  useEffect(() => {
    const closeNavigationOnClickOutside = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (navRef.current?.contains(target) || toggleRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener("click", closeNavigationOnClickOutside);

    return () => {
      document.removeEventListener("click", closeNavigationOnClickOutside);
    };
  }, []);

  return (
    <header
      className={`site-header navbar navbar-expand-lg${isScrolled ? " is-scrolled" : ""}`}
      id="top"
    >
      <div className="container header-inner">
        <Link
          className="brand navbar-brand"
          href="/"
          aria-label="Garci home"
          onClick={() => setIsOpen(false)}
        >
          <Image
            src="/assets/images/brand/logo-garci-sticker.png"
            alt="Garci logo"
            width={2676}
            height={1600}
            priority
          />
        </Link>

        <button
          ref={toggleRef}
          className="nav-toggle navbar-toggler"
          type="button"
          aria-expanded={isOpen}
          aria-controls="site-nav"
          aria-label="Toggle navigation"
          onClick={() => setIsOpen((currentValue) => !currentValue)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav
          ref={navRef}
          className="site-nav ms-lg-auto"
          id="site-nav"
          aria-label="Primary navigation"
          data-open={isOpen ? "true" : "false"}
        >
          {navigationItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                className={getNavItemClassName(isActive)}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
