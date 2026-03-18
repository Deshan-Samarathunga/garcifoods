import Image from "next/image";
import Link from "next/link";

import { HeroVideoBackground } from "@/components/home/hero-video-background";
import { ProductRangeSlider } from "@/components/home/product-range-slider";
import { ReviewCarousel } from "@/components/home/review-carousel";
import { TrustindexReviewWidget } from "@/components/home/trustindex-review-widget";
import { processGalleryItems } from "@/content/process-gallery";
import { listMarketingProducts } from "@/lib/services/products";
import { getPublicSiteReviewWidgetSettings } from "@/lib/services/site-settings";

export default async function HomePage() {
  const [products, reviewWidgetSettings] = await Promise.all([
    listMarketingProducts(),
    getPublicSiteReviewWidgetSettings(),
  ]);

  return (
    <main>
      <section className="hero has-video-bg">
        <HeroVideoBackground />
        <div className="container">
          <div className="hero-grid row justify-content-center gx-xl-5 gy-4">
            <div className="col-12 col-xl-8">
              <div className="hero-copy reveal reveal-delay-1">
                <p className="eyebrow">Sri Lankan Origin</p>
                <div className="hero-copy-body">
                  <h1>Nature&apos;s Gentle Nutrition</h1>
                  <p>
                    To provide the world with authentic, healthy foods that celebrate the natural
                    goodness and humble heritage of Sri Lanka.
                  </p>
                </div>
                <div className="hero-actions">
                  <Link className="btn btn-primary" href="/products">
                    View Products
                  </Link>
                  <Link className="btn btn-secondary" href="/contact">
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-strip">
        <div className="container">
          <div className="feature-card">
            <div className="row align-items-center g-4">
              <div className="col-12 col-lg-auto d-flex justify-content-center justify-content-lg-start">
                <div className="origin-icon" aria-hidden="true"></div>
              </div>
              <div className="col-12 col-lg">
                <div className="feature-copy text-center text-lg-start">
                  <h2>Structured flour range for clean-label nutrition</h2>
                  <p>
                    Built around ingredient clarity, Sri Lankan sourcing, and a simple product line
                    that is easy to present across retail, export, and food service channels.
                  </p>
                </div>
              </div>
              <div className="col-12">
                <div className="feature-pills" aria-label="Key product features">
                  <span>Clean Ingredients</span>
                  <span>Export Friendly</span>
                  <span>Natural Processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section nutrition">
        <div className="container">
          <div className="section-heading reveal light">
            <p className="eyebrow">Our Product Range</p>
            <h2>Three focused flours for one clear Garci story</h2>
          </div>

          <ProductRangeSlider products={products} />
        </div>
      </section>

      <section className="section gallery">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Craft &amp; Process</p>
            <h2>A closer look at Garci&apos;s craft and process</h2>
          </div>

          <div className="gallery-grid">
            {processGalleryItems.map((item, index) => (
              <figure key={`${item.caption}-${index}`} className={item.className}>
                <Image
                  src={item.imageUrl}
                  alt={item.alt}
                  width={1200}
                  height={900}
                  loading="lazy"
                />
                <figcaption>{item.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section review-showcase" id="reviews">
        <div className="container">
          <div className="section-heading review-heading reveal">
            <p className="eyebrow">Customer Reviews</p>
            <h2>What People Say About Garci</h2>
          </div>

          {reviewWidgetSettings.reviewsWidgetEnabled &&
          reviewWidgetSettings.reviewsWidgetMarkup.trim() ? (
            <TrustindexReviewWidget settings={reviewWidgetSettings} />
          ) : (
            <ReviewCarousel />
          )}
        </div>
      </section>
    </main>
  );
}
