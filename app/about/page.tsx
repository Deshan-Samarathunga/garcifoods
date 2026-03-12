import type { Metadata } from "next";
import Image from "next/image";

import { aboutContent } from "@/content/about";

export const metadata: Metadata = {
  title: "About Us",
  description: "About Garci Sri Lankan flour products.",
};

export default function AboutPage() {
  return (
    <main className="page-main">
      <section className="section">
        <div className="container">
          <div className="content-split row g-4">
            <div className="col-12 col-lg-6">
              <div className="content-panel reveal">
                <p className="eyebrow">Our Vision</p>
                <h2>Authentic, healthy foods from the natural goodness of Sri Lanka</h2>
                <p>{aboutContent.vision}</p>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="content-panel reveal reveal-delay-1">
                <p className="eyebrow">Our Mission</p>
                <h2>Adding value to jackfruit and local bananas with lasting impact</h2>
                <p>{aboutContent.mission}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section promise">
        <div className="container narrow">
          <div className="section-heading reveal">
            <h2>Our Promise</h2>
          </div>

          <div className="promise-card reveal reveal-delay-1">
            {aboutContent.promise.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="section founder">
        <div className="container">
          <div className="founder-grid row g-4 align-items-center reveal">
            <div className="col-12 col-lg-5">
              <div className="founder-portrait">
                <Image
                  src="/assets/images/team/garci-founder.jpg"
                  alt="Chathuraka Mallawa Arachchi, founder of Garci"
                  width={1200}
                  height={1400}
                  loading="lazy"
                />
              </div>
            </div>

            <div className="col-12 col-lg-7">
              <div className="founder-copy">
                <p className="eyebrow">Founder Note</p>
                <h2>A word from the founder</h2>
                {aboutContent.founder.note.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <p className="founder-name">{aboutContent.founder.name}</p>
                <Image
                  className="signature-mark"
                  src="/assets/images/team/garci-founder-signature.png"
                  alt={`Signature of ${aboutContent.founder.name}`}
                  width={600}
                  height={240}
                  loading="lazy"
                />
                <p className="designation">{aboutContent.founder.designation}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
