/**
 * All copy and business details live here.
 * From the visiting card: name, email, phone, location.
 * Anything wrapped in [BRACKETS] (or marked "confirm") is a placeholder to check with the client.
 */

export const company = {
  short: "SMA",
  name: "Sharma Metal & Alloys",
  owner: "Leelu Sharma",
  tagline: "Built to roll.",
  email: "sharmametalalloys@gmail.com",
  phone: "+91 89305 25200",
  whatsapp: "918930525200", // wa.me format
  whatsappText: "Hi Sharma Metal & Alloys, I'm looking for alloy wheels.",
  address: ["Kulena, Palwal", "Haryana, India"],
  mapQuery: "Kulena, Palwal, Haryana, India",
  hours: "[Mon–Sat · 10:00–20:00]", // confirm
};

export const nav = [
  { label: "Wheels", href: "#studio" },
  { label: "Range", href: "#range" },
  { label: "About", href: "#about" },
  { label: "Visit", href: "#visit" },
];

/** Finishes shown on the 3D wheel. Confirm which ones the shop actually stocks. */
export const finishes = [
  { id: "silver", name: "Hyper Silver", note: "Classic, bright, easy to keep clean." },
  { id: "black", name: "Gloss Black", note: "Deep shine for a sporty, stealth look." },
  { id: "diamond", name: "Diamond Cut", note: "Machined face over black — the showroom favourite." },
  { id: "bronze", name: "Matte Bronze", note: "Warm satin tone that stands out on any colour." },
] as const;

/** Category panels. Size ranges are typical market ranges — confirm against actual stock. */
export const categories = [
  {
    id: "bikes",
    title: "Bikes",
    line: "Alloy wheels for scooters and motorcycles.",
    sizes: "10″ – 18″",
    points: ["Scooters & commuters", "Motorcycles", "Front & rear sets"],
  },
  {
    id: "cars",
    title: "Cars",
    line: "Alloy wheels for hatchbacks, sedans and SUVs.",
    sizes: "13″ – 18″",
    points: ["Hatchbacks & sedans", "SUVs & MUVs", "Sets of four"],
  },
];

/** Sample range — styles for the catalogue grid. Replace with real stock / photos. */
export const range = [
  { style: "Five-spoke", spokes: 5, kind: "classic", cat: "cars", size: "14″ – 17″", finish: "silver" },
  { style: "Twin-spoke", spokes: 5, kind: "twin", cat: "cars", size: "15″ – 18″", finish: "diamond" },
  { style: "Mesh", spokes: 10, kind: "mesh", cat: "cars", size: "15″ – 17″", finish: "black" },
  { style: "Y-spoke", spokes: 5, kind: "y", cat: "cars", size: "16″ – 18″", finish: "bronze" },
  { style: "Three-spoke", spokes: 3, kind: "classic", cat: "bikes", size: "10″ – 12″", finish: "black" },
  { style: "Six-spoke", spokes: 6, kind: "classic", cat: "bikes", size: "17″ – 18″", finish: "silver" },
  { style: "Split-spoke", spokes: 5, kind: "twin", cat: "bikes", size: "17″ – 18″", finish: "diamond" },
  { style: "Seven-spoke", spokes: 7, kind: "classic", cat: "bikes", size: "12″ – 14″", finish: "bronze" },
] as const;

/** Why SMA — kept to things a customer experiences directly. Confirm wording with the client. */
export const reasons = [
  { k: "01", title: "Bikes & cars, one place", body: "Alloy wheels for two-wheelers and four-wheelers under one roof." },
  { k: "02", title: "The right fit", body: "Size, offset and bolt pattern checked for your vehicle before you buy." },
  { k: "03", title: "Finish of your choice", body: "Silver, black, diamond cut, bronze — see them in person and decide." },
  { k: "04", title: "Talk to the owner", body: "Questions answered directly by Leelu Sharma, on call or WhatsApp." },
];

export const about = {
  kicker: "About SMA",
  title: ["Run by", "Leelu Sharma."],
  lead: "Sharma Metal & Alloys deals in alloy wheels for bikes and cars, from Kulena in Palwal, Haryana.",
  body: [
    "Whether it's a scooter, a motorcycle, a hatchback or an SUV, the goal is simple: help every customer find the right size, the right fitment and the right finish — and leave with wheels they're proud of.",
    "[Add a line about how SMA started, years in business, and any brands or services offered — e.g. fitting, balancing.]",
  ],
  photo: { src: "/images/owner-cutout.webp", alt: "Leelu Sharma, owner of Sharma Metal & Alloys", caption: "Leelu Sharma · Owner" },
};
