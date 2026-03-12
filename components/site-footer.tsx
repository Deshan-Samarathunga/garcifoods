import Image from "next/image";
import Link from "next/link";

import { footerSections } from "@/lib/site";

const isInternalHref = (href: string) => href.startsWith("/");

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid row g-4">
          <div className="col-12 col-lg-6 col-xl-4 footer-brand">
            <Image
              src="/assets/images/brand/logo-garci.png"
              alt="Garci logo"
              width={2676}
              height={1600}
              loading="lazy"
            />
            <p>
              Pure Sri Lankan jackfruit and banana flour products, rooted in honest ingredients and
              natural nutrition.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title} className="col-12 col-sm-6 col-lg-2 col-xl">
              <h3>{section.title}</h3>
              <div className="footer-links">
                {section.links.map((link) => {
                  if (isInternalHref(link.href)) {
                    return (
                      <Link key={link.href} href={link.href}>
                        {link.label}
                      </Link>
                    );
                  }

                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                    >
                      {link.label}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="footer-note">Garci (Pvt) Ltd. All rights reserved.</p>
    </footer>
  );
}
