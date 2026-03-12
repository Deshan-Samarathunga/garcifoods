export type NavItem = {
  href: string;
  label: string;
};

export type LinkItem = {
  href: string;
  label: string;
  external?: boolean;
};

export const siteConfig = {
  name: "Garci",
  defaultTitle: "Garci | Home",
  description: "Garci Sri Lankan jackfruit and banana flour website.",
  contact: {
    mobile: "+94 76 9299976",
    telephone: "+94 33 2221376",
    address: "No. 272, Wathumulla Rd, Asgiriya, Gampaha",
    mapUrl: "https://maps.google.com/?q=No.+272,+Wathumulla+Rd,+Asgiriya,+Gampaha",
  },
} as const;

export const navigationItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact Us" },
];

export const footerSections: Array<{
  title: string;
  links: LinkItem[];
}> = [
  {
    title: "Pages",
    links: navigationItems.map((item) => ({
      href: item.href,
      label: item.label,
    })),
  },
  {
    title: "Contact",
    links: [
      { href: "tel:+94769299976", label: "Mobile: +94 76 9299976" },
      { href: "tel:+94332221376", label: "Tel: +94 33 2221376" },
      {
        href: siteConfig.contact.mapUrl,
        label: siteConfig.contact.address,
        external: true,
      },
    ],
  },
  {
    title: "Social",
    links: [
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
    ],
  },
];
