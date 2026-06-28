import { getDbPool, hasDatabaseUrl } from "@/lib/db";
import { captureException } from "@/lib/monitoring";
import {
  defaultSiteContactSettings,
  defaultSiteReviewWidgetSettings,
  siteSettingsRecordId,
  type SiteContactSettings,
  type SiteContactSettingsSnapshot,
  type SiteReviewWidgetSettingsSnapshot,
} from "@/lib/site";
import {
  buildTrustindexEmbedCode,
  defaultTrustindexLoaderUrl,
  normalizeTrustindexEmbedCode,
} from "@/lib/trustindex";
import {
  adminSiteContactSettingsSchema,
  adminSiteReviewWidgetSettingsSchema,
  type AdminSiteContactSettingsInput,
  type AdminSiteReviewWidgetSettingsInput,
} from "@/lib/validations/site-settings";

const createDefaultSiteContactSettings = (): SiteContactSettingsSnapshot => {
  return {
    ...defaultSiteContactSettings,
    updatedAt: null,
    isDefault: true,
  };
};

const createDefaultSiteReviewWidgetSettings = (): SiteReviewWidgetSettingsSnapshot => {
  return {
    ...defaultSiteReviewWidgetSettings,
    reviewsWidgetLoaderUrl: defaultTrustindexLoaderUrl,
    reviewsWidgetMarkup: "",
    updatedAt: null,
    isDefault: true,
  };
};

const serializeContactSettings = (settings: {
  mobile: string;
  telephone: string;
  address: string;
  mapUrl: string;
  mapEmbedUrl: string;
  updatedAt: Date;
}): SiteContactSettingsSnapshot => {
  return {
    mobile: settings.mobile,
    telephone: settings.telephone,
    address: settings.address,
    mapUrl: settings.mapUrl,
    mapEmbedUrl: settings.mapEmbedUrl,
    updatedAt: settings.updatedAt.toISOString(),
    isDefault: false,
  };
};

const serializeReviewWidgetSettings = (settings: {
  reviewsWidgetEnabled: boolean;
  reviewsWidgetLoaderUrl: string;
  reviewsWidgetMarkup: string;
  updatedAt: Date;
}): SiteReviewWidgetSettingsSnapshot => {
  return {
    reviewsWidgetEnabled: settings.reviewsWidgetEnabled,
    reviewsWidgetCode: buildTrustindexEmbedCode(
      settings.reviewsWidgetLoaderUrl,
      settings.reviewsWidgetMarkup,
    ),
    reviewsWidgetLoaderUrl: settings.reviewsWidgetLoaderUrl,
    reviewsWidgetMarkup: settings.reviewsWidgetMarkup,
    updatedAt: settings.updatedAt.toISOString(),
    isDefault: false,
  };
};

export const toSiteContactSettings = (
  settings: SiteContactSettingsSnapshot,
): SiteContactSettings => {
  return {
    mobile: settings.mobile,
    telephone: settings.telephone,
    address: settings.address,
    mapUrl: settings.mapUrl,
    mapEmbedUrl: settings.mapEmbedUrl,
  };
};

const getStoredSiteContactSettings = async () => {
  const pool = getDbPool();
  const { rows } = await pool.query(
    `SELECT mobile, telephone, address, "mapUrl", "mapEmbedUrl", "updatedAt" FROM "SiteSettings" WHERE id = $1`,
    [siteSettingsRecordId]
  );
  return rows[0] || null;
};

const hasReviewWidgetColumns = async () => {
  const pool = getDbPool();
  const { rows } = await pool.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'SiteSettings'
      AND column_name IN ('reviewsWidgetEnabled', 'reviewsWidgetLoaderUrl', 'reviewsWidgetMarkup')
  `);
  return rows.length === 3;
};

const getStoredSiteReviewWidgetSettings = async () => {
  if (!(await hasReviewWidgetColumns())) {
    return null;
  }

  const pool = getDbPool();
  const { rows } = await pool.query(
    `SELECT "reviewsWidgetEnabled", "reviewsWidgetLoaderUrl", "reviewsWidgetMarkup", "updatedAt" FROM "SiteSettings" WHERE id = $1`,
    [siteSettingsRecordId]
  );
  return rows[0] || null;
};

export const getPublicSiteContactSettings = async (): Promise<SiteContactSettingsSnapshot> => {
  if (!hasDatabaseUrl) {
    return createDefaultSiteContactSettings();
  }

  try {
    const settings = await getStoredSiteContactSettings();
    if (!settings) return createDefaultSiteContactSettings();
    return serializeContactSettings(settings);
  } catch (error) {
    captureException(error, { area: "siteSettings.getPublicSiteContactSettings" });
    return createDefaultSiteContactSettings();
  }
};

export const getAdminSiteContactSettings = async (): Promise<SiteContactSettingsSnapshot> => {
  if (!hasDatabaseUrl) {
    return createDefaultSiteContactSettings();
  }

  try {
    const settings = await getStoredSiteContactSettings();
    if (!settings) return createDefaultSiteContactSettings();
    return serializeContactSettings(settings);
  } catch (error) {
    captureException(error, { area: "siteSettings.getAdminSiteContactSettings" });
    return createDefaultSiteContactSettings();
  }
};

export const updateSiteContactSettings = async (
  input: AdminSiteContactSettingsInput,
): Promise<SiteContactSettingsSnapshot> => {
  const payload = adminSiteContactSettingsSchema.parse(input);
  const pool = getDbPool();

  const { rows } = await pool.query(
    `INSERT INTO "SiteSettings" (id, mobile, telephone, address, "mapUrl", "mapEmbedUrl") 
     VALUES ($1, $2, $3, $4, $5, $6) 
     ON CONFLICT (id) DO UPDATE SET 
     mobile = EXCLUDED.mobile, 
     telephone = EXCLUDED.telephone, 
     address = EXCLUDED.address, 
     "mapUrl" = EXCLUDED."mapUrl", 
     "mapEmbedUrl" = EXCLUDED."mapEmbedUrl" 
     RETURNING mobile, telephone, address, "mapUrl", "mapEmbedUrl", "updatedAt"`,
    [
      siteSettingsRecordId,
      payload.mobile,
      payload.telephone,
      payload.address,
      payload.mapUrl,
      payload.mapEmbedUrl,
    ]
  );

  return serializeContactSettings(rows[0]);
};

export const getPublicSiteReviewWidgetSettings = async (): Promise<SiteReviewWidgetSettingsSnapshot> => {
  if (!hasDatabaseUrl) {
    return createDefaultSiteReviewWidgetSettings();
  }

  try {
    const settings = await getStoredSiteReviewWidgetSettings();
    if (!settings) return createDefaultSiteReviewWidgetSettings();
    return serializeReviewWidgetSettings(settings);
  } catch (error) {
    captureException(error, { area: "siteSettings.getPublicSiteReviewWidgetSettings" });
    return createDefaultSiteReviewWidgetSettings();
  }
};

export const getAdminSiteReviewWidgetSettings = async (): Promise<SiteReviewWidgetSettingsSnapshot> => {
  if (!hasDatabaseUrl) {
    return createDefaultSiteReviewWidgetSettings();
  }

  try {
    const settings = await getStoredSiteReviewWidgetSettings();
    if (!settings) return createDefaultSiteReviewWidgetSettings();
    return serializeReviewWidgetSettings(settings);
  } catch (error) {
    captureException(error, { area: "siteSettings.getAdminSiteReviewWidgetSettings" });
    return createDefaultSiteReviewWidgetSettings();
  }
};

export const updateSiteReviewWidgetSettings = async (
  input: AdminSiteReviewWidgetSettingsInput,
): Promise<SiteReviewWidgetSettingsSnapshot> => {
  const payload = adminSiteReviewWidgetSettingsSchema.parse(input);
  const normalizedWidget = payload.reviewsWidgetCode
    ? normalizeTrustindexEmbedCode(payload.reviewsWidgetCode)
    : {
        ok: true as const,
        data: {
          loaderUrl: defaultTrustindexLoaderUrl,
          widgetMarkup: "",
          embedCode: "",
        },
      };

  if (!normalizedWidget.ok) {
    throw new Error(normalizedWidget.error);
  }

  if (!(await hasReviewWidgetColumns())) {
    throw new Error(
      "Review widget settings need the latest database migration before they can be saved.",
    );
  }

  const pool = getDbPool();
  
  const { rows } = await pool.query(
    `INSERT INTO "SiteSettings" (id, mobile, telephone, address, "mapUrl", "mapEmbedUrl", "reviewsWidgetEnabled", "reviewsWidgetLoaderUrl", "reviewsWidgetMarkup") 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
     ON CONFLICT (id) DO UPDATE SET 
     "reviewsWidgetEnabled" = EXCLUDED."reviewsWidgetEnabled", 
     "reviewsWidgetLoaderUrl" = EXCLUDED."reviewsWidgetLoaderUrl", 
     "reviewsWidgetMarkup" = EXCLUDED."reviewsWidgetMarkup" 
     RETURNING "reviewsWidgetEnabled", "reviewsWidgetLoaderUrl", "reviewsWidgetMarkup", "updatedAt"`,
    [
      siteSettingsRecordId,
      defaultSiteContactSettings.mobile,
      defaultSiteContactSettings.telephone,
      defaultSiteContactSettings.address,
      defaultSiteContactSettings.mapUrl,
      defaultSiteContactSettings.mapEmbedUrl,
      payload.reviewsWidgetEnabled,
      normalizedWidget.data.loaderUrl,
      normalizedWidget.data.widgetMarkup,
    ]
  );

  return serializeReviewWidgetSettings(rows[0]);
};
