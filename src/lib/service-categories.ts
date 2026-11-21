/** Categories vendors can select, kept in sync with the API server. */
export const SERVICE_CATEGORIES = [
  "Photography & Videography",
  "Wedding Venues",
  "Decoration & Florist",
  "Catering Services",
  "Makeup & Styling",
  "Wedding Fashion",
  "Venue & Decoration",
  "Catering & Cake",
  "Bridal & Grooming",
  "Music & Entertainment",
  "Wedding Planning",
  "Transport & Logistics",
  "Other",
] as const;

/** Display categories for the homepage. `query` is sent to the API as the
 *  category filter; the server expands it to matching stored values. */
export const FEATURED_CATEGORIES = [
  {
    label: "Photography & Videography",
    query: "Photography & Videography",
    description: "Capture every moment of your big day.",
    icon: "camera",
  },
  {
    label: "Wedding Venues",
    query: "Wedding Venues",
    description: "Find the perfect place to say yes.",
    icon: "building",
  },
  {
    label: "Decoration & Florist",
    query: "Decoration & Florist",
    description: "Beautiful blooms and stunning setups.",
    icon: "flower",
  },
  {
    label: "Catering Services",
    query: "Catering Services",
    description: "Menus your guests will remember.",
    icon: "utensils",
  },
  {
    label: "Makeup & Styling",
    query: "Makeup & Styling",
    description: "Look and feel your absolute best.",
    icon: "sparkles",
  },
  {
    label: "Wedding Fashion",
    query: "Wedding Fashion",
    description: "Attire and accessories for the celebration.",
    icon: "shirt",
  },
] as const;
