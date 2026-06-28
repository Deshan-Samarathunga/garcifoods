"use client";

import { useEffect, useState } from "react";

import { reviewItems } from "@/content/reviews";
import { cn } from "@/lib/utils";

export function ReviewCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % reviewItems.length);
    }, 6400);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="review-widget-shell reveal reveal-delay-1">
      <div className="garci-review-card">
        <div className="garci-review-stars" aria-hidden="true">
          5/5
        </div>
        {reviewItems.map((review, index) => {
          const isActive = index === activeIndex;

          return (
            <article
              key={review.author}
              className={cn("garci-review-slide", isActive && "is-active")}
              aria-hidden={isActive ? "false" : "true"}
            >
              <p className="garci-review-copy">{review.body}</p>
              <p className="garci-review-author">{review.author}</p>
            </article>
          );
        })}
        <div className="garci-review-controls" aria-label="Review navigation">
          <button
            type="button"
            className="slider-control prev"
            aria-label="Previous review"
            onClick={() => setActiveIndex((activeIndex - 1 + reviewItems.length) % reviewItems.length)}
          >
            &#10094;
          </button>
          <div className="slider-dots">
            {reviewItems.map((review, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={review.author}
                  type="button"
                  className={cn("slider-dot", isActive && "is-active")}
                  aria-label={`Show review from ${review.author}`}
                  onClick={() => setActiveIndex(index)}
                ></button>
              );
            })}
          </div>
          <button
            type="button"
            className="slider-control next"
            aria-label="Next review"
            onClick={() => setActiveIndex((activeIndex + 1) % reviewItems.length)}
          >
            &#10095;
          </button>
        </div>
      </div>
    </div>
  );
}
