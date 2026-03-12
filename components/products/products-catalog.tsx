"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { MarketingProduct } from "@/lib/services/products";
import { cn } from "@/lib/utils";

type ProductsCatalogProps = {
  products: MarketingProduct[];
};

export function ProductsCatalog({ products }: ProductsCatalogProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const activeProduct = selectedIndex === null ? null : products[selectedIndex] ?? null;

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedIndex(null);
      }
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("product-modal-open", activeProduct !== null);

    return () => {
      document.body.classList.remove("product-modal-open");
    };
  }, [activeProduct]);

  return (
    <>
      <div className="catalog-grid row g-4">
        {products.map((product, index) => (
          <div key={product.slug} className="col-12 col-md-6 col-xl-4">
            <article
              className={cn("catalog-card reveal", product.tone)}
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              aria-controls="product-modal"
              aria-expanded={selectedIndex === index}
              onClick={() => setSelectedIndex(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedIndex(index);
                }
              }}
            >
              <div className="catalog-card-media">
                <Image
                  src={product.imageUrl}
                  alt={`${product.name} pack`}
                  width={900}
                  height={883}
                  loading="lazy"
                />
              </div>
              <div className="catalog-card-body">
                <h3>{product.name}</h3>
                <p>{product.catalogSummary}</p>
                <div className="catalog-chip-list">
                  {product.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>

      <div className="product-modal" id="product-modal" aria-hidden={activeProduct ? "false" : "true"} hidden={!activeProduct}>
        <div className="product-modal-overlay" onClick={() => setSelectedIndex(null)}></div>
        <section
          className="product-modal-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          tabIndex={-1}
        >
          <button
            className="product-modal-close"
            type="button"
            aria-label="Close product details"
            onClick={() => setSelectedIndex(null)}
          >
            &times;
          </button>

          {activeProduct ? (
            <>
              <div className="product-modal-media">
                <Image
                  src={activeProduct.imageUrl}
                  alt={activeProduct.name}
                  width={900}
                  height={883}
                />
              </div>
              <div className="product-modal-body">
                <h2 id="product-modal-title">{activeProduct.name}</h2>
                <ul className="product-modal-list">
                  {activeProduct.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <Link className="btn btn-primary product-modal-cta" href="/contact">
                  Request Product Specifications
                </Link>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </>
  );
}
