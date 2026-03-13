import { Prisma } from "@prisma/client";

import { getPrismaClient, hasDatabaseUrl } from "@/lib/db";
import { captureException } from "@/lib/monitoring";
import {
  defaultSiteContactSettings,
  siteSettingsRecordId,
  type SiteContactSettings,
  type SiteContactSettingsSnapshot,
} from "@/lib/site";
import {
  adminSiteContactSettingsSchema,
  type AdminSiteContactSettingsInput,
} from "@/lib/validations/site-settings";

const siteSettingsSelect = {
  mobile: true,
  telephone: true,
  address: true,
  mapUrl: true,
  mapEmbedUrl: true,
  updatedAt: true,
} satisfies Prisma.SiteSettingsSelect;

const createDefaultSiteContactSettings = (): SiteContactSettingsSnapshot => {
  return {
    ...defaultSiteContactSettings,
    updatedAt: null,
    isDefault: true,
  };
};

const serializeSiteSettings = (settings: {
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

export const getPublicSiteContactSettings = async (): Promise<SiteContactSettingsSnapshot> => {
  if (!hasDatabaseUrl) {
    return createDefaultSiteContactSettings();
  }

  try {
    const settings = await getStoredSiteContactSettings();

    if (!settings) {
      return createDefaultSiteContactSettings();
    }

    return serializeSiteSettings(settings);
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

    return serializeSiteSettings(settings);
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

  return serializeSiteSettings(settings);
};
