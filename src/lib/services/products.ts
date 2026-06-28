import { productSeedData, type ProductSeed, type ProductTone } from "@/content/products";
import { getDbPool, hasDatabaseUrl } from "@/lib/db";
import { captureException } from "@/lib/monitoring";
import { adminProductSchema, type AdminProductInput } from "@/lib/validations/product";

export type ProductDto = {
  id: string;
  slug: string;
  name: string;
  description: string;
  features: string[];
  tags: string[];
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MarketingProduct = ProductDto & {
  tone: ProductTone;
  highlightTitle: string;
  highlightDescription: string;
  catalogSummary: string;
};

const toneFallbacks: ProductTone[] = ["tone-jackfruit", "tone-seed", "tone-banana", "tone-default"];

const seedMap = new Map(productSeedData.map((product) => [product.slug, product]));

const deriveProductTags = (features: string[]) => {
  const tags = features
    .slice(0, 3)
    .map((feature) => feature.split(" ").slice(0, 2).join(" ").trim())
    .filter(Boolean);

  return tags.length > 0 ? tags : ["Garci", "Sri Lankan", "Natural"];
};

const resolveProductTags = (slug: string, tags: string[], features: string[]) => {
  if (tags.length > 0) {
    return tags;
  }

  const seeded = seedMap.get(slug);

  if (seeded?.tags.length) {
    return seeded.tags;
  }

  return deriveProductTags(features);
};

const seedToProductDto = (product: ProductSeed, index: number): ProductDto => {
  const createdAt = new Date(Date.UTC(2025, 0, index + 1)).toISOString();

  return {
    id: `seed-${product.slug}`,
    slug: product.slug,
    name: product.name,
    description: product.description,
    features: product.features,
    tags: product.tags,
    imageUrl: product.imageUrl,
    isActive: product.isActive,
    createdAt,
    updatedAt: createdAt,
  };
};

const serializeProduct = (product: any): ProductDto => {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    features: product.features,
    tags: resolveProductTags(product.slug, product.tags, product.features),
    imageUrl: product.imageUrl,
    isActive: product.isActive,
    createdAt: (product.createdAt instanceof Date ? product.createdAt : new Date(product.createdAt)).toISOString(),
    updatedAt: (product.updatedAt instanceof Date ? product.updatedAt : new Date(product.updatedAt)).toISOString(),
  };
};

const createMarketingProduct = (product: ProductDto, index: number): MarketingProduct => {
  const seeded = seedMap.get(product.slug);

  if (seeded) {
    return {
      ...product,
      tone: seeded.tone,
      highlightTitle: seeded.highlightTitle,
      highlightDescription: seeded.highlightDescription,
      catalogSummary: seeded.catalogSummary,
    };
  }

  return {
    ...product,
    tone: toneFallbacks[index % toneFallbacks.length],
    highlightTitle: product.name,
    highlightDescription: product.description,
    catalogSummary: product.description,
  };
};

export const listPublicProducts = async (): Promise<ProductDto[]> => {
  if (!hasDatabaseUrl) {
    return productSeedData.filter((product) => product.isActive).map(seedToProductDto);
  }

  try {
    const pool = getDbPool();
    const result = await pool.query(
      'SELECT id, slug, name, description, features, tags, "imageUrl", "isActive", "createdAt", "updatedAt" FROM "Product" WHERE "isActive" = true ORDER BY "createdAt" ASC, name ASC'
    );
    const products = result.rows;

    if (products.length === 0) {
      return productSeedData.filter((product) => product.isActive).map(seedToProductDto);
    }

    return products.map(serializeProduct);
  } catch (error) {
    captureException(error, { area: "products.listPublicProducts" });
    return productSeedData.filter((product) => product.isActive).map(seedToProductDto);
  }
};

export const listMarketingProducts = async (): Promise<MarketingProduct[]> => {
  const products = await listPublicProducts();
  return products.map(createMarketingProduct);
};

export const getPublicProductBySlug = async (slug: string): Promise<ProductDto | null> => {
  if (!hasDatabaseUrl) {
    const seeded = productSeedData.find((product) => product.slug === slug && product.isActive);
    return seeded ? seedToProductDto(seeded, 0) : null;
  }

  try {
    const pool = getDbPool();
    const result = await pool.query(
      'SELECT id, slug, name, description, features, tags, "imageUrl", "isActive", "createdAt", "updatedAt" FROM "Product" WHERE slug = $1 AND "isActive" = true LIMIT 1',
      [slug]
    );
    const product = result.rows[0];

    if (!product) {
      const seeded = productSeedData.find((item) => item.slug === slug && item.isActive);
      return seeded ? seedToProductDto(seeded, 0) : null;
    }

    return serializeProduct(product);
  } catch (error) {
    captureException(error, { area: "products.getPublicProductBySlug", slug });
    const seeded = productSeedData.find((item) => item.slug === slug && item.isActive);
    return seeded ? seedToProductDto(seeded, 0) : null;
  }
};

export const listAdminProducts = async (): Promise<ProductDto[]> => {
  const pool = getDbPool();
  const result = await pool.query(
    'SELECT id, slug, name, description, features, tags, "imageUrl", "isActive", "createdAt", "updatedAt" FROM "Product" ORDER BY "createdAt" ASC, name ASC'
  );
  return result.rows.map(serializeProduct);
};

export const createProduct = async (input: AdminProductInput): Promise<ProductDto> => {
  const pool = getDbPool();
  const payload = adminProductSchema.parse(input);
  const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  
  const result = await pool.query(
    'INSERT INTO "Product" (id, slug, name, description, features, tags, "imageUrl", "isActive") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, slug, name, description, features, tags, "imageUrl", "isActive", "createdAt", "updatedAt"',
    [id, payload.slug, payload.name, payload.description, payload.features, payload.tags, payload.imageUrl, payload.isActive]
  );
  
  return serializeProduct(result.rows[0]);
};

export const updateProduct = async (id: string, input: AdminProductInput): Promise<ProductDto> => {
  const pool = getDbPool();
  const payload = adminProductSchema.parse(input);
  
  const result = await pool.query(
    'UPDATE "Product" SET slug = $1, name = $2, description = $3, features = $4, tags = $5, "imageUrl" = $6, "isActive" = $7 WHERE id = $8 RETURNING id, slug, name, description, features, tags, "imageUrl", "isActive", "createdAt", "updatedAt"',
    [payload.slug, payload.name, payload.description, payload.features, payload.tags, payload.imageUrl, payload.isActive, id]
  );
  
  if (result.rows.length === 0) {
    throw Object.assign(new Error("Not found"), { code: "P2025" });
  }

  return serializeProduct(result.rows[0]);
};

export const deleteProduct = async (id: string) => {
  const pool = getDbPool();
  const result = await pool.query('DELETE FROM "Product" WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    throw Object.assign(new Error("Not found"), { code: "P2025" });
  }
};
