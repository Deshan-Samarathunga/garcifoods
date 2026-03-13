/* eslint-disable @next/next/no-img-element */
"use client";

import { startTransition, useDeferredValue, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import type { ProductDto } from "@/lib/services/products";

type ProductFormState = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  features: string;
  tags: string;
  isActive: boolean;
};

type AdminProductsManagerProps = {
  initialProducts: ProductDto[];
};

type CatalogFilter = "all" | "live" | "hidden";
type CatalogSort = "updated" | "alphabetical" | "features";

const emptyFormState: ProductFormState = {
  slug: "",
  name: "",
  description: "",
  imageUrl: "/assets/images/products/jackfruit-flour.png",
  features: "",
  tags: "",
  isActive: true,
};

const mapProductToFormState = (product: ProductDto): ProductFormState => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  description: product.description,
  imageUrl: product.imageUrl,
  features: product.features.join("\n"),
  tags: product.tags.join("\n"),
  isActive: product.isActive,
});

const isSameFormState = (left: ProductFormState, right: ProductFormState) => {
  return (
    left.id === right.id &&
    left.slug === right.slug &&
    left.name === right.name &&
    left.description === right.description &&
    left.imageUrl === right.imageUrl &&
    left.features === right.features &&
    left.tags === right.tags &&
    left.isActive === right.isActive
  );
};

const parseLineList = (value: string) => {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

const formatProductDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return "Unknown";
  }

  return dateFormatter.format(date);
};

export function AdminProductsManager({ initialProducts }: AdminProductsManagerProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<ProductFormState>(emptyFormState);
  const [editorBaseline, setEditorBaseline] = useState<ProductFormState>(emptyFormState);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CatalogFilter>("all");
  const [sortMode, setSortMode] = useState<CatalogSort>("updated");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewImageBroken, setIsPreviewImageBroken] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const deferredQuery = useDeferredValue(query);
  const totalProducts = initialProducts.length;

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredProducts = [...initialProducts]
    .filter((product) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [product.name, product.slug, product.description, ...product.features, ...product.tags].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "live" && product.isActive) ||
        (statusFilter === "hidden" && !product.isActive);

      return matchesQuery && matchesStatus;
    })
    .sort((left, right) => {
      if (sortMode === "alphabetical") {
        return left.name.localeCompare(right.name);
      }

      if (sortMode === "features") {
        return (
          right.features.length - left.features.length ||
          new Date(right.updatedAt).valueOf() - new Date(left.updatedAt).valueOf()
        );
      }

      return new Date(right.updatedAt).valueOf() - new Date(left.updatedAt).valueOf();
    });

  const editingProduct = formState.id
    ? initialProducts.find((product) => product.id === formState.id) ?? null
    : null;
  const activeEditingProduct = isEditorOpen ? editingProduct : null;
  const previewImageUrl = formState.imageUrl.trim() || emptyFormState.imageUrl;
  const featureLines = parseLineList(formState.features);
  const tagLines = parseLineList(formState.tags);
  const hasUnsavedChanges = isEditorOpen && !isSameFormState(formState, editorBaseline);

  function getListPreview(items: string[], limit = 4) {
    const visible = items.slice(0, limit);
    const remaining = Math.max(items.length - limit, 0);

    return { visible, remaining };
  }

  const clearMessages = () => {
    setFeedback("");
    setError("");
  };

  const resetForm = () => {
    setFormState(emptyFormState);
    setEditorBaseline(emptyFormState);
    setIsPreviewImageBroken(false);
    clearMessages();
  };

  const restoreBaseline = () => {
    setFormState(editorBaseline);
    setIsPreviewImageBroken(false);
    clearMessages();
  };

  const openCreateModal = () => {
    resetForm();
    setIsEditorOpen(true);
  };

  const openEditModal = (product: ProductDto) => {
    const nextFormState = mapProductToFormState(product);
    setFormState(nextFormState);
    setEditorBaseline(nextFormState);
    setIsPreviewImageBroken(false);
    clearMessages();
    setIsEditorOpen(true);
  };

  const closeEditorModal = ({
    force = false,
    keepMessages = false,
  }: {
    force?: boolean;
    keepMessages?: boolean;
  } = {}) => {
    if (isPending && !force) {
      return;
    }

    if (!force && hasUnsavedChanges) {
      const confirmed = window.confirm("Discard the unsaved product changes?");

      if (!confirmed) {
        return;
      }
    }

    setIsEditorOpen(false);
    setFormState(emptyFormState);
    setEditorBaseline(emptyFormState);
    setIsPreviewImageBroken(false);

    if (!keepMessages) {
      clearMessages();
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("admin-modal-open", isEditorOpen);

    if (!isEditorOpen) {
      return () => {
        document.body.classList.remove("admin-modal-open");
      };
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isPending) {
          return;
        }

        if (hasUnsavedChanges) {
          const confirmed = window.confirm("Discard the unsaved product changes?");

          if (!confirmed) {
            return;
          }
        }

        setIsEditorOpen(false);
        setFormState(emptyFormState);
        setEditorBaseline(emptyFormState);
        setIsPreviewImageBroken(false);
        setFeedback("");
        setError("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("admin-modal-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasUnsavedChanges, isEditorOpen, isPending]);

  useEffect(() => {
    setIsPreviewImageBroken(false);
  }, [previewImageUrl, isEditorOpen]);

  const submit = async () => {
    const method = formState.id ? "PATCH" : "POST";
    const endpoint = formState.id ? `/api/admin/products/${formState.id}` : "/api/admin/products";
    const payload = {
      slug: formState.slug,
      name: formState.name,
      description: formState.description,
      imageUrl: formState.imageUrl,
      isActive: formState.isActive,
      features: featureLines,
      tags: tagLines,
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    clearMessages();

    startTransition(async () => {
      try {
        await submit();
        setFeedback(formState.id ? "Product updated." : "Product created.");
        closeEditorModal({ force: true, keepMessages: true });
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
  };

  return (
    <div className="admin-products-shell">
      <div className="admin-products-workspace">
        <section className="admin-board-card admin-board-catalog">
          <div className="admin-board-card-header">
            <div>
              <p className="admin-board-kicker">Catalog board</p>
              <h2>Manage products</h2>
            </div>
            <div className="admin-board-actionrow">
              <button className="btn admin-btn-primary" type="button" onClick={openCreateModal}>
                Create product
              </button>
            </div>
          </div>

          <div id="admin-catalog-toolbar" className="admin-catalog-toolbar admin-catalog-toolbar-v2">
            <label className="admin-toolbar-search">
              <span>Search catalog</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, slug, description, feature, or tag"
              />
            </label>

            <div className="admin-toolbar-filter">
              <span>Status</span>
              <div className="admin-toolbar-filter-frame">
                <div className="admin-filter-pills" role="group" aria-label="Status filter">
                  <button
                    className={`admin-filter-pill${statusFilter === "all" ? " is-active" : ""}`}
                    type="button"
                    onClick={() => setStatusFilter("all")}
                  >
                    All
                  </button>
                  <button
                    className={`admin-filter-pill${statusFilter === "live" ? " is-active" : ""}`}
                    type="button"
                    onClick={() => setStatusFilter("live")}
                  >
                    Live
                  </button>
                  <button
                    className={`admin-filter-pill${statusFilter === "hidden" ? " is-active" : ""}`}
                    type="button"
                    onClick={() => setStatusFilter("hidden")}
                  >
                    Hidden
                  </button>
                </div>
              </div>
            </div>

            <label className="admin-toolbar-select">
              <span>Sort by</span>
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as CatalogSort)}
              >
                <option value="updated">Last updated</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="features">Most features</option>
              </select>
            </label>
          </div>

          <div className="admin-results-summary admin-results-summary-v2">
            <p>
              Showing <strong>{filteredProducts.length}</strong> of <strong>{totalProducts}</strong>{" "}
              products
            </p>
            <span>{query.trim().length === 0 ? "No search applied" : `Search: ${query.trim()}`}</span>
          </div>

          {feedback ? <p className="admin-feedback is-success">{feedback}</p> : null}
          {error ? <p className="admin-feedback is-error">{error}</p> : null}

          {filteredProducts.length === 0 ? (
            <div className="admin-board-empty">
              <strong>No products match the current filter</strong>
              <p>
                Try a broader search term, switch back to all statuses, or open the editor to add a
                new product.
              </p>
            </div>
          ) : (
            <div className="admin-product-cards">
              {filteredProducts.map((product) => {
                const isEditing = isEditorOpen && formState.id === product.id;
                const tagPreview = getListPreview(product.tags);

                return (
                  <article
                    key={product.id}
                    className={`admin-product-card-v2${isEditing ? " is-editing" : ""}`}
                  >
                    <div className="admin-product-card-main">
                      <div className="admin-product-card-image">
                        <img src={product.imageUrl} alt="" loading="lazy" />
                      </div>

                      <div className="admin-product-card-body">
                        <div className="admin-product-card-meta">
                          <span
                            className={`admin-status-badge ${product.isActive ? "is-live" : "is-hidden"}`}
                          >
                            {product.isActive ? "Live" : "Hidden"}
                          </span>
                          <p className="admin-product-card-slug">{product.slug}</p>
                        </div>

                        <h3>{product.name}</h3>
                        <p>{product.description}</p>

                        <div className="admin-product-card-facts">
                          <span>
                            {product.tags.length} tag{product.tags.length === 1 ? "" : "s"}
                          </span>
                          <span className="admin-product-card-feature-count">
                            {product.features.length} feature{product.features.length === 1 ? "" : "s"}
                          </span>
                          <span className="admin-product-card-updated">
                            Updated {formatProductDate(product.updatedAt)}
                          </span>
                        </div>

                        <div className="catalog-chip-list admin-chip-list">
                          {tagPreview.visible.map((tag, index) => (
                            <span key={`${product.id}-${tag}-${index}`}>{tag}</span>
                          ))}
                          {tagPreview.remaining > 0 ? (
                            <span>{`+${tagPreview.remaining} more`}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="admin-product-card-actions">
                      <button
                        className="btn admin-btn-secondary"
                        type="button"
                        disabled={isPending}
                        onClick={() => openEditModal(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn admin-btn-danger"
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          const confirmed = window.confirm(`Delete ${product.name}?`);

                          if (!confirmed) {
                            return;
                          }

                          setIsPending(true);
                          clearMessages();

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
                                closeEditorModal({ force: true, keepMessages: true });
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
                );
              })}
            </div>
          )}
        </section>
      </div>

      {isMounted && isEditorOpen
        ? createPortal(
            <div className="admin-modal-backdrop" role="presentation" onClick={() => closeEditorModal()}>
              <section
                className="admin-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-product-modal-title"
                aria-describedby="admin-product-modal-description"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="admin-modal-header">
                  <div className="admin-modal-header-copy">
                    <p className="admin-board-kicker">
                      {activeEditingProduct ? "Editing product" : "Create product"}
                    </p>
                    <h2 id="admin-product-modal-title">
                      {activeEditingProduct ? `Update ${activeEditingProduct.name}` : "Product editor"}
                    </h2>
                    <p id="admin-product-modal-description" className="admin-modal-description">
                      Update slug, product copy, image path, tags, and public visibility from one focused editor.
                    </p>
                  </div>
                  <div className="admin-modal-header-actions">
                    {hasUnsavedChanges ? (
                      <span className="admin-board-status is-alert">Unsaved changes</span>
                    ) : null}
                    <button
                      className="admin-modal-close"
                      type="button"
                      disabled={isPending}
                      onClick={() => closeEditorModal()}
                    >
                      Close
                    </button>
                  </div>
                </div>

                <form className="admin-modal-form" onSubmit={handleSubmit}>
                  <div className="admin-modal-body">
                    <div className="admin-board-stats admin-board-stats-tight">
                      <article>
                        <span>Slug preview</span>
                        <strong>{formState.slug.trim() || "pending-slug"}</strong>
                      </article>
                      <article>
                        <span>Feature lines</span>
                        <strong>{featureLines.length}</strong>
                      </article>
                      <article>
                        <span>Tag pills</span>
                        <strong>{tagLines.length}</strong>
                      </article>
                    </div>

                    <div className="admin-modal-status-row">
                      <p className="admin-board-copy">
                        Define the public slug, product description, image path, short feature set,
                        and the tag pills shown across the storefront.
                      </p>
                      <div className="admin-modal-status-note">
                        <span>Visibility</span>
                        <strong>{formState.isActive ? "Live on site" : "Hidden from site"}</strong>
                      </div>
                    </div>

                    <div className="admin-form-layout">
                      <div className="admin-field-grid">
                        <label className="admin-form-field">
                          <span>Slug</span>
                          <input
                            value={formState.slug}
                            onChange={(event) =>
                              setFormState((current) => ({ ...current, slug: event.target.value }))
                            }
                            placeholder="green-banana-flour"
                          />
                        </label>

                        <label className="admin-form-field">
                          <span>Name</span>
                          <input
                            value={formState.name}
                            onChange={(event) =>
                              setFormState((current) => ({ ...current, name: event.target.value }))
                            }
                            placeholder="Green Banana Flour"
                          />
                        </label>

                        <label className="admin-form-field is-full">
                          <span>Description</span>
                          <textarea
                            rows={5}
                            value={formState.description}
                            onChange={(event) =>
                              setFormState((current) => ({
                                ...current,
                                description: event.target.value,
                              }))
                            }
                            placeholder="Short public-facing summary for the product."
                          ></textarea>
                        </label>

                        <label className="admin-form-field is-full">
                          <span>Image URL</span>
                          <input
                            value={formState.imageUrl}
                            onChange={(event) =>
                              setFormState((current) => ({ ...current, imageUrl: event.target.value }))
                            }
                            placeholder="/assets/images/products/green-banana-flour.png"
                          />
                        </label>
                      </div>

                      <div className="admin-media-preview">
                        <div className="admin-media-frame">
                          {isPreviewImageBroken ? (
                            <div className="admin-media-placeholder">Preview unavailable</div>
                          ) : (
                            <img
                              src={previewImageUrl}
                              alt=""
                              loading="lazy"
                              onError={() => setIsPreviewImageBroken(true)}
                            />
                          )}
                        </div>
                        <div className="admin-media-copy">
                          <p className="admin-board-kicker">Image preview</p>
                          <div className="admin-media-path">{previewImageUrl}</div>
                          <p className="admin-media-note">
                            Use a repo asset path or a future storage URL. The preview reflects the
                            exact path that will be saved.
                          </p>
                        </div>
                      </div>

                      <label className="admin-form-field">
                        <span>Features</span>
                        <textarea
                          rows={7}
                          value={formState.features}
                          onChange={(event) =>
                            setFormState((current) => ({ ...current, features: event.target.value }))
                          }
                          placeholder="One feature per line"
                        ></textarea>
                      </label>

                      <label className="admin-form-field">
                        <span>Tags</span>
                        <textarea
                          rows={5}
                          value={formState.tags}
                          onChange={(event) =>
                            setFormState((current) => ({ ...current, tags: event.target.value }))
                          }
                          placeholder="One tag per line"
                        ></textarea>
                      </label>

                      <div className="admin-tag-editor-preview">
                        <div className="admin-tag-editor-copy">
                          <p className="admin-board-kicker">Tag preview</p>
                          <p className="admin-board-copy">
                            These chips are the short labels shown on product cards and range sliders.
                          </p>
                        </div>
                        {tagLines.length > 0 ? (
                          <div className="catalog-chip-list admin-chip-list">
                            {tagLines.map((tag, index) => (
                              <span key={`${tag}-${index}`}>{tag}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="admin-tag-editor-empty">Add at least one tag to preview the chips.</p>
                        )}
                      </div>
                    </div>

                    <label className="admin-checkbox">
                      <input
                        type="checkbox"
                        checked={formState.isActive}
                        onChange={(event) =>
                          setFormState((current) => ({ ...current, isActive: event.target.checked }))
                        }
                      />
                      <span className="admin-checkbox-copy">
                        <strong>Visible on the public site</strong>
                        <span>
                          Turn this off to keep the record in the admin catalog without exposing it publicly.
                        </span>
                      </span>
                    </label>

                    <div className="admin-form-actions">
                      <button className="btn admin-btn-primary" type="submit" disabled={isPending}>
                        {isPending ? "Saving..." : formState.id ? "Update product" : "Create product"}
                      </button>
                      <button
                        className="btn admin-btn-secondary"
                        type="button"
                        disabled={isPending || !hasUnsavedChanges}
                        onClick={restoreBaseline}
                      >
                        Reset changes
                      </button>
                      <button
                        className="btn admin-btn-ghost"
                        type="button"
                        disabled={isPending}
                        onClick={() => closeEditorModal()}
                      >
                        Cancel
                      </button>
                    </div>

                    {feedback ? <p className="admin-feedback is-success">{feedback}</p> : null}
                    {error ? <p className="admin-feedback is-error">{error}</p> : null}
                  </div>
                </form>
              </section>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
