"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import type { ProductDto } from "@/lib/services/products";

type ProductFormState = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  features: string;
  isActive: boolean;
};

type AdminProductsManagerProps = {
  initialProducts: ProductDto[];
};

const emptyFormState: ProductFormState = {
  slug: "",
  name: "",
  description: "",
  imageUrl: "/assets/images/products/jackfruit-flour.png",
  features: "",
  isActive: true,
};

const mapProductToFormState = (product: ProductDto): ProductFormState => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  description: product.description,
  imageUrl: product.imageUrl,
  features: product.features.join("\n"),
  isActive: product.isActive,
});

export function AdminProductsManager({ initialProducts }: AdminProductsManagerProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<ProductFormState>(emptyFormState);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const submit = async () => {
    const method = formState.id ? "PATCH" : "POST";
    const endpoint = formState.id ? `/api/admin/products/${formState.id}` : "/api/admin/products";
    const payload = {
      slug: formState.slug,
      name: formState.name,
      description: formState.description,
      imageUrl: formState.imageUrl,
      isActive: formState.isActive,
      features: formState.features
        .split("\n")
        .map((feature) => feature.trim())
        .filter(Boolean),
    };

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { ok: boolean; error?: string };

    if (!response.ok || !data.ok) {
      throw new Error(data.error ?? "The product could not be saved.");
    }
  };

  return (
    <div className="admin-products-layout row g-4">
      <div className="col-12 col-xl-5">
        <div className="contact-form">
          <div className="section-heading text-start mb-4">
            <p className="eyebrow">{formState.id ? "Edit Product" : "New Product"}</p>
            <h2>{formState.id ? "Update product details" : "Create a product"}</h2>
          </div>

          <div className="form-field">
            <span>Slug</span>
            <input
              className="form-control"
              value={formState.slug}
              onChange={(event) => setFormState((current) => ({ ...current, slug: event.target.value }))}
            />
          </div>
          <div className="form-field">
            <span>Name</span>
            <input
              className="form-control"
              value={formState.name}
              onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
            />
          </div>
          <div className="form-field">
            <span>Description</span>
            <textarea
              className="form-control"
              rows={4}
              value={formState.description}
              onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
            ></textarea>
          </div>
          <div className="form-field">
            <span>Image URL</span>
            <input
              className="form-control"
              value={formState.imageUrl}
              onChange={(event) => setFormState((current) => ({ ...current, imageUrl: event.target.value }))}
            />
          </div>
          <div className="form-field">
            <span>Features</span>
            <textarea
              className="form-control"
              rows={6}
              value={formState.features}
              onChange={(event) => setFormState((current) => ({ ...current, features: event.target.value }))}
              placeholder="One feature per line"
            ></textarea>
          </div>
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={formState.isActive}
              onChange={(event) => setFormState((current) => ({ ...current, isActive: event.target.checked }))}
            />
            <span>Visible on the public site</span>
          </label>
          <div className="contact-actions">
            <button
              className="btn btn-primary"
              type="button"
              disabled={isPending}
              onClick={() => {
                setIsPending(true);
                setFeedback("");
                setError("");

                startTransition(async () => {
                  try {
                    await submit();
                    setFeedback(formState.id ? "Product updated." : "Product created.");
                    setFormState(emptyFormState);
                    router.refresh();
                  } catch (submissionError) {
                    setError(
                      submissionError instanceof Error
                        ? submissionError.message
                        : "The product could not be saved.",
                    );
                  } finally {
                    setIsPending(false);
                  }
                });
              }}
            >
              {isPending ? "Saving..." : formState.id ? "Update Product" : "Create Product"}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                setFormState(emptyFormState);
                setError("");
                setFeedback("");
              }}
            >
              Clear
            </button>
          </div>
          <p className="contact-note is-success">{feedback}</p>
          <p className="contact-note is-error">{error}</p>
        </div>
      </div>

      <div className="col-12 col-xl-7">
        <div className="admin-products-list">
          {initialProducts.map((product) => (
            <article key={product.id} className="admin-product-card">
              <div>
                <p className="eyebrow">{product.slug}</p>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="catalog-chip-list">
                  {product.features.map((feature) => (
                    <span key={feature}>{feature}</span>
                  ))}
                </div>
              </div>
              <div className="admin-product-actions">
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => {
                    setFormState(mapProductToFormState(product));
                    setFeedback("");
                    setError("");
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => {
                    const confirmed = window.confirm(`Delete ${product.name}?`);

                    if (!confirmed) {
                      return;
                    }

                    setIsPending(true);
                    setFeedback("");
                    setError("");

                    startTransition(async () => {
                      try {
                        const response = await fetch(`/api/admin/products/${product.id}`, {
                          method: "DELETE",
                        });
                        const data = (await response.json()) as { ok: boolean; error?: string };

                        if (!response.ok || !data.ok) {
                          throw new Error(data.error ?? "The product could not be deleted.");
                        }

                        if (formState.id === product.id) {
                          setFormState(emptyFormState);
                        }

                        setFeedback("Product deleted.");
                        router.refresh();
                      } catch (deleteError) {
                        setError(
                          deleteError instanceof Error
                            ? deleteError.message
                            : "The product could not be deleted.",
                        );
                      } finally {
                        setIsPending(false);
                      }
                    });
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
