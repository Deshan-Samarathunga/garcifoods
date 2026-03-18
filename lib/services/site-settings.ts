import { Prisma } from "@prisma/client";

import { getPrismaClient, hasDatabaseUrl } from "@/lib/db";
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

const siteSettingsSelect = {
  mobile: true,
  telephone: true,
  address: true,
  mapUrl: true,
  mapEmbedUrl: true,
  updatedAt: true,
} satisfies Prisma.SiteSettingsSelect;

const siteReviewWidgetSettingsSelect = {
  reviewsWidgetEnabled: true,
  reviewsWidgetLoaderUrl: true,
  reviewsWidgetMarkup: true,
  updatedAt: true,
} satisfies Prisma.SiteSettingsSelect;

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
  const prisma = getPrismaClient();

  return prisma.siteSettings.findUnique({
    where: { id: siteSettingsRecordId },
    select: siteSettingsSelect,
  });
};

const hasReviewWidgetColumns = async () => {
  const prisma = getPrismaClient();
  const columns = await prisma.$queryRaw<Array<{ column_name: string }>>(Prisma.sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'SiteSettings'
      AND column_name IN ('reviewsWidgetEnabled', 'reviewsWidgetLoaderUrl', 'reviewsWidgetMarkup')
  `);

  return columns.length === 3;
};

const getStoredSiteReviewWidgetSettings = async () => {
  if (!(await hasReviewWidgetColumns())) {
    return null;
  }

  const prisma = getPrismaClient();

  return prisma.siteSettings.findUnique({
    where: { id: siteSettingsRecordId },
    select: siteReviewWidgetSettingsSelect,
  });
};

export const getPublicSiteContactSettings = async (): Promise<SiteContactSettingsSnapshot> => {
  if (!hasDatabaseUrl) {
    return createDefaultSiteContactSettings();
  }

  try {
    const settings = await getStoredSiteContactSettings();

    if (!settings) {
      return createDefaultSiteContactSettings();
    }

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

    if (!settings) {
      return createDefaultSiteContactSettings();
    }

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
  const prisma = getPrismaClient();
  const settings = await prisma.siteSettings.upsert({
    where: { id: siteSettingsRecordId },
    update: payload,
    create: {
      id: siteSettingsRecordId,
      ...payload,
    },
    select: siteSettingsSelect,
  });

  return serializeContactSettings(settings);
};

export const getPublicSiteReviewWidgetSettings = async (): Promise<SiteReviewWidgetSettingsSnapshot> => {
  if (!hasDatabaseUrl) {
    return createDefaultSiteReviewWidgetSettings();
  }

  try {
    const settings = await getStoredSiteReviewWidgetSettings();

    if (!settings) {
      return createDefaultSiteReviewWidgetSettings();
    }

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

    if (!settings) {
      return createDefaultSiteReviewWidgetSettings();
    }

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

  const prisma = getPrismaClient();
  const settings = await prisma.siteSettings.upsert({
    where: { id: siteSettingsRecordId },
    update: {
      reviewsWidgetEnabled: payload.reviewsWidgetEnabled,
      reviewsWidgetLoaderUrl: normalizedWidget.data.loaderUrl,
      reviewsWidgetMarkup: normalizedWidget.data.widgetMarkup,
    },
    create: {
      id: siteSettingsRecordId,
      ...defaultSiteContactSettings,
      reviewsWidgetEnabled: payload.reviewsWidgetEnabled,
      reviewsWidgetLoaderUrl: normalizedWidget.data.loaderUrl,
      reviewsWidgetMarkup: normalizedWidget.data.widgetMarkup,
    },
    select: siteReviewWidgetSettingsSelect,
  });

  return serializeReviewWidgetSettings(settings);
};
