import "dotenv/config";
import { hash } from "bcryptjs";
import pg from "pg";
import { productSeedData } from "../src/content/products";
import { defaultSiteContactSettings, siteSettingsRecordId } from "../src/lib/site";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const seedProducts = async () => {
  for (const product of productSeedData) {
    await pool.query(
      `INSERT INTO "Product" (id, slug, name, description, features, tags, "imageUrl", "isActive") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       ON CONFLICT (slug) DO UPDATE SET 
       name = EXCLUDED.name, 
       description = EXCLUDED.description, 
       features = EXCLUDED.features, 
       tags = EXCLUDED.tags, 
       "imageUrl" = EXCLUDED."imageUrl", 
       "isActive" = EXCLUDED."isActive"`,
      [
        Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
        product.slug,
        product.name,
        product.description,
        product.features,
        product.tags,
        product.imageUrl,
        product.isActive,
      ]
    );
  }
};

const seedSiteSettings = async () => {
  await pool.query(
    `INSERT INTO "SiteSettings" (id, mobile, telephone, address, "mapUrl", "mapEmbedUrl") 
     VALUES ($1, $2, $3, $4, $5, $6) 
     ON CONFLICT (id) DO UPDATE SET 
     mobile = EXCLUDED.mobile, 
     telephone = EXCLUDED.telephone, 
     address = EXCLUDED.address, 
     "mapUrl" = EXCLUDED."mapUrl", 
     "mapEmbedUrl" = EXCLUDED."mapEmbedUrl"`,
    [
      siteSettingsRecordId,
      defaultSiteContactSettings.mobile,
      defaultSiteContactSettings.telephone,
      defaultSiteContactSettings.address,
      defaultSiteContactSettings.mapUrl,
      defaultSiteContactSettings.mapEmbedUrl,
    ]
  );
};

const seedAdminUser = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return;
  }

  const passwordHash = await hash(adminPassword, 12);
  const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);

  await pool.query(
    `INSERT INTO "User" (id, email, role, "passwordHash") 
     VALUES ($1, $2, $3, $4) 
     ON CONFLICT (email) DO UPDATE SET 
     role = EXCLUDED.role, 
     "passwordHash" = EXCLUDED."passwordHash"`,
    [id, adminEmail, 'ADMIN', passwordHash]
  );
};

const main = async () => {
  await seedProducts();
  await seedSiteSettings();
  await seedAdminUser();
};

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
