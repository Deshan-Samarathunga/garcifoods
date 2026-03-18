export type NavItem = {
  href: string;
  label: string;
  showInFooter?: boolean;
};

export type LinkItem = {
  href: string;
  label: string;
  external?: boolean;
};

export type FooterSection = {
  title: string;
  links: LinkItem[];
};

export type SiteContactSettings = {
  mobile: string;
  telephone: string;
  address: string;
  mapUrl: string;
  mapEmbedUrl: string;
};

export type SiteContactSettingsSnapshot = SiteContactSettings & {
  updatedAt: string | null;
  isDefault: boolean;
};

export type SiteReviewWidgetSettings = {
  reviewsWidgetEnabled: boolean;
  reviewsWidgetCode: string;
};

export type SiteReviewWidgetSettingsSnapshot = SiteReviewWidgetSettings & {
  reviewsWidgetLoaderUrl: string;
  reviewsWidgetMarkup: string;
  updatedAt: string | null;
  isDefault: boolean;
};

export const siteSettingsRecordId = "site";

export const defaultSiteContactSettings: SiteContactSettings = {
  mobile: "+94 76 9299976",
  telephone: "+94 33 2221376",
  address: "No. 272, Wathumulla Rd, Asgiriya, Gampaha",
  mapUrl: "https://maps.google.com/?q=No.+272,+Wathumulla+Rd,+Asgiriya,+Gampaha",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d399.19877576781136!2d79.9899163278274!3d7.112297188279818!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2fbd75517d92d%3A0xddc9e7c587a43178!2sGarci!5e0!3m2!1sen!2slk!4v1763575451972!5m2!1sen!2slk",
};

export const defaultSiteReviewWidgetSettings: SiteReviewWidgetSettings = {
  reviewsWidgetEnabled: false,
  reviewsWidgetCode: "",
};

export const siteConfig = {
  name: "Garci",
  defaultTitle: "Garci | Home",
  description: "Garci Sri Lankan jackfruit and banana flour website.",
  contact: defaultSiteContactSettings,
} as const;

export const navigationItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact Us" },
  { href: "/admin/login", label: "Admin Login", showInFooter: false },
];

const socialLinks: LinkItem[] = [
  {
    href: "https://www.facebook.com/garcifoods/",
    label: "Facebook",
    external: true,
  },
  {
    href: "https://www.linkedin.com/company/garcifoods",
    label: "LinkedIn",
    external: true,
  },
  {
    href: "https://www.instagram.com/garcifoods/",
    label: "Instagram",
    external: true,
  },
];

export const toTelephoneHref = (value: string) => {
  const trimmed = value.trim();
  const digits = trimmed.replace(/[^\d]/g, "");

  return `tel:${trimmed.startsWith("+") ? `+${digits}` : digits}`;
};

export const buildFooterSections = (contact: SiteContactSettings): FooterSection[] => [
  {
    title: "Pages",
    links: navigationItems.filter((item) => item.showInFooter !== false).map((item) => ({
      href: item.href,
      label: item.label,
    })),
  },
  {
    title: "Contact",
    links: [
      { href: toTelephoneHref(contact.mobile), label: `Mobile: ${contact.mobile}` },
      { href: toTelephoneHref(contact.telephone), label: `Tel: ${contact.telephone}` },
      {
        href: contact.mapUrl,
        label: contact.address,
        external: true,
      },
    ],
  },
  {
    title: "Social",
    links: socialLinks,
  },
];

export const footerSections = buildFooterSections(defaultSiteContactSettings);
