export type ProductTone = "tone-jackfruit" | "tone-seed" | "tone-banana" | "tone-default";

export type ProductSeed = {
  slug: string;
  name: string;
  description: string;
  features: string[];
  imageUrl: string;
  isActive: boolean;
  tone: ProductTone;
  tags: string[];
  highlightTitle: string;
  highlightDescription: string;
  catalogSummary: string;
};

export const productSeedData: ProductSeed[] = [
  {
    slug: "jackfruit-flour",
    name: "Jackfruit Flour",
    description:
      "Garci Jackfruit Flour gives the range a familiar, ingredient-led hero product for retail, export, and food service conversations.",
    features: [
      "Smooth flour format for blends, baking, and home cooking",
      "Clear Sri Lankan sourcing story with clean-label appeal",
      "Strong lead product for category introductions and sampling",
    ],
    imageUrl: "/assets/images/products/jackfruit-flour.png",
    isActive: true,
    tone: "tone-jackfruit",
    tags: ["Powder", "Natural", "Retail Ready"],
    highlightTitle: "Versatile and easy to place across bakery and daily cooking",
    highlightDescription:
      "A familiar, ingredient-led flagship product positioned for retail, export, and food service conversations.",
    catalogSummary:
      "Smooth, versatile flour for bakery blends, daily cooking, and wellness recipes.",
  },
  {
    slug: "jackfruit-seed-flour",
    name: "Jackfruit Seed Flour",
    description:
      "This specialty flour expands the Garci lineup with a more formulation-friendly option while keeping the overall range simple and easy to explain.",
    features: [
      "Built for savory applications and recipe development work",
      "Adds a distinct second jackfruit story without complicating the range",
      "Supports product presentations aimed at ingredient functionality",
    ],
    imageUrl: "/assets/images/products/jackfruit-seed-flour.png",
    isActive: true,
    tone: "tone-seed",
    tags: ["Specialty", "Batch Stable", "Formulation"],
    highlightTitle: "Functional depth for savory mixes and nutrition-led concepts",
    highlightDescription:
      "A specialty option for formulation-led conversations, savory applications, and nutrition-forward positioning.",
    catalogSummary:
      "Functional flour option designed for savory formulations and nutrition-focused mixes.",
  },
  {
    slug: "green-banana-flour",
    name: "Green Banana Flour",
    description:
      "Green Banana Flour gives the portfolio a fresh visual identity and a natural fit for wellness-led, export-ready, and ingredient-focused positioning.",
    features: [
      "Strong ingredient story for contemporary retail and pantry formats",
      "Flexible for baking, cooking, and concept development",
      "Balances the full range with a distinct and memorable third product",
    ],
    imageUrl: "/assets/images/products/green-banana-flour.png",
    isActive: true,
    tone: "tone-banana",
    tags: ["Natural", "Flexible Use", "Export Ready"],
    highlightTitle: "Clean-label banana flour with modern shelf appeal",
    highlightDescription:
      "A clean-label flour with a fresh visual identity for wellness, export, and ingredient-focused positioning.",
    catalogSummary:
      "Clean-label flour prepared for modern retail shelves and ingredient-led concepts.",
  },
];
