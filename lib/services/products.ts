import { Prisma } from "@prisma/client";

import { productSeedData, type ProductSeed, type ProductTone } from "@/content/products";
import { getPrismaClient, hasDatabaseUrl } from "@/lib/db";
import { captureException } from "@/lib/monitoring";
import { adminProductSchema, type AdminProductInput } from "@/lib/validations/product";

export type ProductDto = {
  id: string;
  slug: string;
  name: string;
  description: string;
  features: string[];
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MarketingProduct = ProductDto & {
  tone: ProductTone;
  tags: string[];
  highlightTitle: string;
  highlightDescription: string;
  catalogSummary: string;
};

const toneFallbacks: ProductTone[] = ["tone-jackfruit", "tone-seed", "tone-banana", "tone-default"];

const seedMap = new Map(productSeedData.map((product) => [product.slug, product]));

const seedToProductDto = (product: ProductSeed, index: number): ProductDto => {
  const createdAt = new Date(Date.UTC(2025, 0, index + 1)).toISOString();

  return {
    id: `seed-${product.slug}`,
    slug: product.slug,
    name: product.name,
    description: product.description,
    features: product.features,
    imageUrl: product.imageUrl,
    isActive: product.isActive,
    createdAt,
    updatedAt: createdAt,
  };
};

const serializeProduct = (product: {
  id: string;
  slug: string;
  name: string;
  description: string;
  features: string[];
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ProductDto => {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    features: product.features,
    imageUrl: product.imageUrl,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
};

const createMarketingProduct = (product: ProductDto, index: number): MarketingProduct => {
  const seeded = seedMap.get(product.slug);

  if (seeded) {
    return {
      ...product,
      tone: seeded.tone,
      tags: seeded.tags,
      highlightTitle: seeded.highlightTitle,
      highlightDescription: seeded.highlightDescription,
      catalogSummary: seeded.catalogSummary,
    };
  }

  const tags = product.features.slice(0, 3).map((feature) => {
    return feature.split(" ").slice(0, 2).join(" ");
  });

  return {
    ...product,
    tone: toneFallbacks[index % toneFallbacks.length],
    tags: tags.length > 0 ? tags : ["Garci", "Sri Lankan", "Natural"],
    highlightTitle: product.name,
    highlightDescription: product.description,
    catalogSummary: product.description,
  };
};

const productSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  features: true,
  imageUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

export const listPublicProducts = async (): Promise<ProductDto[]> => {
  if (!hasDatabaseUrl) {
    return productSeedData.filter((product) => product.isActive).map(seedToProductDto);
  }

  try {
    const prisma = getPrismaClient();
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: productSelect,
      orderBy: [{ createdAt: "asc" }, { name: "asc" }],
    });

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
    const prisma = getPrismaClient();
    const product = await prisma.product.findFirst({
      where: { slug, isActive: true },
      select: productSelect,
    });

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
  const prisma = getPrismaClient();
  const products = await prisma.product.findMany({
    select: productSelect,
    orderBy: [{ createdAt: "asc" }, { name: "asc" }],
  });

  return products.map(serializeProduct);
};

export const createProduct = async (input: AdminProductInput): Promise<ProductDto> => {
  const prisma = getPrismaClient();
  const payload = adminProductSchema.parse(input);
  const product = await prisma.product.create({
    data: payload,
    select: productSelect,
  });

  return serializeProduct(product);
};

export const updateProduct = async (id: string, input: AdminProductInput): Promise<ProductDto> => {
  const prisma = getPrismaClient();
  const payload = adminProductSchema.parse(input);
  const product = await prisma.product.update({
    where: { id },
    data: payload,
    select: productSelect,
  });

  return serializeProduct(product);
};

export const deleteProduct = async (id: string) => {
  const prisma = getPrismaClient();
  await prisma.product.delete({
    where: { id },
  });
};
