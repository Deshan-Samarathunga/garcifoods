import "dotenv/config";

import { hash } from "bcryptjs";
import { UserRole } from "@prisma/client";

import { productSeedData } from "../content/products";
import { getPrismaClient } from "../lib/db";

const prisma = getPrismaClient();

const seedProducts = async () => {
  for (const product of productSeedData) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        features: product.features,
        tags: product.tags,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
      },
      create: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        features: product.features,
        tags: product.tags,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
      },
    });
  }
};

const seedAdminUser = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return;
  }

  const passwordHash = await hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: UserRole.ADMIN,
      passwordHash,
    },
    create: {
      email: adminEmail,
      role: UserRole.ADMIN,
      passwordHash,
    },
  });
};

const main = async () => {
  await seedProducts();
  await seedAdminUser();
};

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
