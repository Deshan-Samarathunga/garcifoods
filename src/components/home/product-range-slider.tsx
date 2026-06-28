"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { MarketingProduct } from "@/lib/services/products";
import { cn } from "@/lib/utils";

type ProductRangeSliderProps = {
  products: MarketingProduct[];
};

export function ProductRangeSlider({ products }: ProductRangeSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (products.length < 2) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (prefersReducedMotion.matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % products.length);
    }, 6200);

    return () => {
      window.clearInterval(timer);
    };
  }, [products.length]);

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="slider-shell reveal" data-slider>
      <button
        className="slider-control prev"
        type="button"
        aria-label="Previous slide"
        onClick={() => setActiveIndex((activeIndex - 1 + products.length) % products.length)}
      >
        &#10094;
      </button>

      <div className="slide-track">
        {products.map((product, index) => {
          const isActive = index === activeIndex;

          return (
            <article
              key={product.slug}
              className={cn("nutrition-slide row g-4 g-xl-5", product.tone, isActive && "is-active")}
              aria-hidden={isActive ? "false" : "true"}
            >
              <div className="col-12 col-lg-5">
                <div className="slide-image-frame">
                  <Image
                    src={product.imageUrl}
                    alt={`${product.name} retail pack`}
                    width={900}
                    height={883}
                    priority={index === 0}
                  />
                </div>
              </div>
              <div className="col-12 col-lg-7 slide-copy">
                <p className="slide-kicker">{product.name}</p>
                <h3>{product.highlightTitle}</h3>
                <p>{product.highlightDescription}</p>
                <div className="catalog-chip-list slide-chip-list" aria-label={`${product.name} highlights`}>
                  {product.tags.map((tag, index) => (
                    <span key={`${product.slug}-${tag}-${index}`}>{tag}</span>
                  ))}
                </div>
                <ul>
                  {product.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>

      <button
        className="slider-control next"
        type="button"
        aria-label="Next slide"
        onClick={() => setActiveIndex((activeIndex + 1) % products.length)}
      >
        &#10095;
      </button>

      <div className="slider-dots" aria-label="Slide navigation">
        {products.map((product, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={product.slug}
              className={cn("slider-dot", isActive && "is-active")}
              type="button"
              aria-label={`Show ${product.name}`}
              aria-current={isActive ? "true" : "false"}
              onClick={() => setActiveIndex(index)}
            ></button>
          );
        })}
      </div>
    </div>
  );
}
