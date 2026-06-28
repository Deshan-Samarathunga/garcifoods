import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/contact-form";
import { toTelephoneHref } from "@/lib/site";
import { getPublicSiteContactSettings } from "@/lib/services/site-settings";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Garci for product inquiries.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const contactSettings = await getPublicSiteContactSettings();

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
                  <a className="text-link text-link-inline" href={toTelephoneHref(contactSettings.mobile)}>
                    Mobile: {contactSettings.mobile}
                  </a>
                  <a
                    className="text-link text-link-inline"
                    href={toTelephoneHref(contactSettings.telephone)}
                  >
                    Telephone: {contactSettings.telephone}
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
                    href={contactSettings.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {contactSettings.address}
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
                    src={contactSettings.mapEmbedUrl}
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
