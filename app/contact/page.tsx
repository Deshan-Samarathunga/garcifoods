import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/contact-form";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Garci for product inquiries.",
};

export default function ContactPage() {
  return (
    <main className="page-main">
      <section className="section contact-details-section">
        <div className="container">
          <div className="contact-grid row g-4">
            <div className="col-12 col-md-6">
              <article className="contact-card contact-card-phones reveal">
                <p className="eyebrow">Contact Numbers</p>
                <h3>Call Us</h3>
                <div className="contact-phone-list">
                  <a className="text-link text-link-inline" href="tel:+94769299976">
                    Mobile: {siteConfig.contact.mobile}
                  </a>
                  <a className="text-link text-link-inline" href="tel:+94332221376">
                    Telephone: {siteConfig.contact.telephone}
                  </a>
                </div>
              </article>
            </div>

            <div className="col-12 col-md-6">
              <article className="contact-card reveal reveal-delay-1">
                <p className="eyebrow">Location</p>
                <h3>Office</h3>
                <address className="contact-address">
                  <a
                    className="text-link text-link-inline"
                    href={siteConfig.contact.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {siteConfig.contact.address}
                  </a>
                </address>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="section contact-main-section">
        <div className="container">
          <div className="contact-layout row g-4 align-items-start">
            <div className="col-12 col-lg-6">
              <ContactForm />
            </div>

            <div className="col-12 col-lg-6">
              <div className="map-panel reveal reveal-delay-1">
                <div className="map-copy">
                  <p className="eyebrow">Find Us</p>
                  <h2>Visit the Garci location</h2>
                </div>

                <div className="map-frame">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d399.19877576781136!2d79.9899163278274!3d7.112297188279818!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2fbd75517d92d%3A0xddc9e7c587a43178!2sGarci!5e0!3m2!1sen!2slk!4v1763575451972!5m2!1sen!2slk"
                    width="900"
                    height="750"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Garci location map"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
