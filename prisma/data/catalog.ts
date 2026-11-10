export type SeedColor = {
  key: string;
  name: string;
  hex: string;
};

export type SeedProduct = {
  slug: string;
  name: string;
  category: "men" | "women";
  model: string;
  price: number;
  description: string;
  colors: SeedColor[];
  sizes: number[];
  unavailableSizes: number[];
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
};

const colors: Record<string, SeedColor> = {
  black: { key: "black", name: "Black", hex: "#1F1F1F" },
  darkBrown: { key: "dark-brown", name: "Dark Brown", hex: "#3A2418" },
  cognac: { key: "cognac", name: "Cognac", hex: "#A46235" },
  burgundy: { key: "burgundy", name: "Burgundy", hex: "#652A32" },
  tan: { key: "tan", name: "Tan", hex: "#B9895D" },
  navy: { key: "navy", name: "Navy", hex: "#253955" },
  darkGreen: { key: "dark-green", name: "Dark Green", hex: "#344333" },
  sand: { key: "sand", name: "Sand", hex: "#D2BFA6" },
  ivory: { key: "ivory", name: "Ivory", hex: "#FAF8F4" },
  oxblood: { key: "oxblood", name: "Oxblood", hex: "#4C171A" },
};

const menSizes = [39, 40, 41, 42, 43, 44, 45, 46];
const womenSizes = [35, 36, 37, 38, 39, 40, 41];

function product(
  category: "men" | "women",
  slug: string,
  name: string,
  model: string,
  price: number,
  colorKeys: Array<keyof typeof colors>,
  flags?: Pick<SeedProduct, "isNew" | "isBestSeller" | "isFeatured">,
): SeedProduct {
  return {
    slug,
    name,
    category,
    model,
    price,
    description: `A refined classic ${model} crafted for formal and everyday elegance, combining a clean silhouette with carefully considered proportions and premium materials.`,
    colors: colorKeys.map((key) => colors[key]),
    sizes: category === "men" ? menSizes : womenSizes,
    unavailableSizes: slug.length % 2 === 0 ? [category === "men" ? 46 : 41] : [],
    ...flags,
  };
}

export const catalogProducts: SeedProduct[] = [
  product("men", "oxford-no-01", "Oxford No. 01", "Oxford", 390, ["black", "darkBrown"], {
    isNew: true,
    isFeatured: true,
  }),
  product("men", "cap-toe-oxford", "Cap-Toe Oxford", "Oxford", 420, ["black", "cognac", "oxblood"], {
    isBestSeller: true,
  }),
  product("men", "classic-derby", "Classic Derby", "Derby", 375, ["darkBrown", "black", "tan"]),
  product("men", "leather-penny-loafer", "Leather Penny Loafer", "Loafer", 350, [
    "cognac",
    "navy",
    "darkBrown",
    "burgundy",
  ], { isFeatured: true }),
  product("men", "double-monk", "Double Monk", "Monk Strap", 460, ["cognac", "darkBrown", "black"], {
    isNew: true,
  }),
  product("men", "wholecut-oxford", "Wholecut Oxford", "Oxford", 510, ["black", "oxblood"]),
  product("men", "suede-loafer", "Suede Loafer", "Loafer", 340, ["tan", "navy", "darkGreen", "sand"]),
  product("men", "chelsea-boot", "Chelsea Boot", "Boot", 480, ["black", "darkBrown"], {
    isBestSeller: true,
  }),
  product("men", "brogue-derby", "Brogue Derby", "Derby", 410, ["darkBrown", "tan", "burgundy"]),
  product("men", "formal-oxford", "Formal Oxford", "Oxford", 440, ["black", "oxblood", "darkBrown"]),
  product("men", "venetian-loafer", "Venetian Loafer", "Loafer", 365, [
    "cognac",
    "navy",
    "darkGreen",
    "sand",
    "black",
    "tan",
    "burgundy",
    "oxblood",
  ]),
  product("men", "city-monk", "City Monk", "Monk Strap", 450, ["black", "cognac", "darkBrown"]),
  product("women", "mary-jane-01", "Mary Jane No. 01", "Mary Jane", 340, [
    "black",
    "burgundy",
    "ivory",
  ], { isNew: true }),
  product("women", "classic-court", "Classic Court", "Pump", 365, ["black", "tan", "burgundy"], {
    isBestSeller: true,
    isFeatured: true,
  }),
  product("women", "leather-ballet", "Leather Ballet", "Ballet Flat", 290, [
    "ivory",
    "black",
    "cognac",
    "navy",
  ]),
  product("women", "slingback-heel", "Slingback Heel", "Slingback", 385, [
    "black",
    "tan",
    "oxblood",
  ]),
  product("women", "penny-loafer", "Penny Loafer", "Loafer", 330, ["cognac", "darkBrown", "navy"]),
  product("women", "pointed-pump", "Pointed Pump", "Pump", 410, ["black", "burgundy", "sand"], {
    isNew: true,
  }),
  product("women", "tassel-loafer", "Tassel Loafer", "Loafer", 355, [
    "darkBrown",
    "cognac",
    "darkGreen",
  ]),
  product("women", "chelsea-ankle-boot", "Chelsea Ankle Boot", "Boot", 445, [
    "black",
    "darkBrown",
  ], { isBestSeller: true }),
  product("women", "soft-ballet", "Soft Ballet", "Ballet Flat", 305, [
    "ivory",
    "tan",
    "navy",
    "burgundy",
  ]),
  product("women", "double-monk-loafer", "Double Monk Loafer", "Monk Strap", 390, [
    "black",
    "cognac",
    "oxblood",
  ]),
  product("women", "sculpted-court", "Sculpted Court", "Pump", 430, [
    "black",
    "burgundy",
    "navy",
    "sand",
    "tan",
    "cognac",
    "ivory",
    "oxblood",
  ]),
  product("women", "heritage-derby", "Heritage Derby", "Derby", 370, [
    "darkBrown",
    "black",
    "tan",
  ]),
];

export const catalogImage = "/images/for-al-boxes.png";
