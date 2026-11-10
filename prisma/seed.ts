import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../lib/auth/password";
import { catalogImage, catalogProducts } from "./data/catalog";
import { homeCollections } from "./data/home-collections";
import { localeCodes } from "./data/locale";
import { navigationItems } from "./data/navigation";
import { en } from "../locales/en";
import { ru } from "../locales/ru";
import { hy } from "../locales/hy";
import { shippingCountries } from "./data/shipping";
import {
  Currency,
  Gender,
  PrismaClient,
  ProductModel,
  UserRole,
  type Prisma,
} from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const modelMap: Record<string, ProductModel> = {
  Oxford: ProductModel.OXFORD,
  Derby: ProductModel.DERBY,
  Loafer: ProductModel.LOAFER,
  "Monk Strap": ProductModel.MONK_STRAP,
  Boot: ProductModel.BOOT,
  "Mary Jane": ProductModel.MARY_JANE,
  Pump: ProductModel.PUMP,
  "Ballet Flat": ProductModel.BALLET_FLAT,
  Slingback: ProductModel.SLINGBACK,
};

const categorySeo: Record<
  string,
  Pick<
    Prisma.CategoryCreateInput,
    "seoHeading" | "intro" | "editorialContent" | "seoTitle" | "seoDescription"
  >
> = {
  Oxford: {
    seoHeading: "Oxford shoes",
    intro: "Discover polished Oxford shoes designed for confident, everyday dressing.",
    editorialContent:
      "Our Oxford collection brings together clean lines, considered proportions, and versatile finishes for work, occasions, and refined daily wear.",
    seoTitle: "Oxford Shoes | Kapriz",
    seoDescription:
      "Explore Kapriz Oxford shoes with refined silhouettes and versatile finishes for work, events, and everyday wear.",
  },
  Derby: {
    seoHeading: "Derby shoes",
    intro: "Explore Derby shoes with an easy fit and a smart, adaptable look.",
    editorialContent:
      "Derby shoes balance formal character with everyday comfort. Choose a pair to move easily between tailored outfits and more relaxed plans.",
    seoTitle: "Derby Shoes | Kapriz",
    seoDescription:
      "Shop Kapriz Derby shoes: adaptable, polished styles made for tailored looks and relaxed occasions alike.",
  },
  Loafer: {
    seoHeading: "Loafers",
    intro: "Find effortless loafers that bring a polished finish to every day.",
    editorialContent:
      "Slip into a loafer for an uncomplicated, refined choice. The collection pairs timeless profiles with details that suit both casual and dressed-up styling.",
    seoTitle: "Loafers | Kapriz",
    seoDescription:
      "Discover Kapriz loafers with timeless profiles for an effortless, polished finish every day.",
  },
  "Monk Strap": {
    seoHeading: "Monk strap shoes",
    intro: "Shop distinctive monk strap shoes with a tailored, modern character.",
    editorialContent:
      "The monk strap is a confident alternative to classic lace-ups. Its signature buckle detail adds interest while keeping the overall look considered and versatile.",
    seoTitle: "Monk Strap Shoes | Kapriz",
    seoDescription:
      "Explore Kapriz monk strap shoes, a distinctive and versatile alternative to classic lace-up styles.",
  },
  Boot: {
    seoHeading: "Boots",
    intro: "Discover boots that offer structure, comfort, and enduring style.",
    editorialContent:
      "From everyday city wear to cooler-weather plans, our boots are designed with balanced proportions and practical finishes that complement your wardrobe.",
    seoTitle: "Boots | Kapriz",
    seoDescription:
      "Shop Kapriz boots with balanced silhouettes and practical finishes for everyday city wear and beyond.",
  },
  "Mary Jane": {
    seoHeading: "Mary Jane shoes",
    intro: "Explore Mary Jane shoes with a classic strap and a graceful finish.",
    editorialContent:
      "Mary Janes bring a familiar silhouette into a modern wardrobe. Style them with tailoring, dresses, or denim for a look that feels both playful and polished.",
    seoTitle: "Mary Jane Shoes | Kapriz",
    seoDescription:
      "Discover Kapriz Mary Jane shoes with classic straps and graceful silhouettes for modern styling.",
  },
  Pump: {
    seoHeading: "Pumps",
    intro: "Find elegant pumps that bring poise to work, events, and evenings out.",
    editorialContent:
      "Our pumps focus on clean profiles and wearable proportions, giving you a composed finishing touch for the moments when a more elevated shoe feels right.",
    seoTitle: "Pumps | Kapriz",
    seoDescription:
      "Shop Kapriz pumps with elegant, wearable silhouettes for work, events, and evenings out.",
  },
  "Ballet Flat": {
    seoHeading: "Ballet flats",
    intro: "Discover ballet flats for light, comfortable, and polished everyday wear.",
    editorialContent:
      "Ballet flats are an easy wardrobe staple. Our collection offers soft, understated shapes that work seamlessly with dresses, tailoring, and relaxed separates.",
    seoTitle: "Ballet Flats | Kapriz",
    seoDescription:
      "Explore Kapriz ballet flats with soft, polished shapes for comfortable everyday wear.",
  },
  Slingback: {
    seoHeading: "Slingback shoes",
    intro: "Shop slingback shoes that combine an open heel with a refined silhouette.",
    editorialContent:
      "Slingbacks offer a light, elegant option for warmer days and special plans. Their distinctive heel strap creates a composed look without feeling overdone.",
    seoTitle: "Slingback Shoes | Kapriz",
    seoDescription:
      "Discover Kapriz slingback shoes with refined open-heel silhouettes for warmer days and special occasions.",
  },
};

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function genderFromCategory(category: "men" | "women"): Gender {
  return category === "men" ? Gender.MEN : Gender.WOMEN;
}

async function seedShippingCountries() {
  for (const country of shippingCountries) {
    await prisma.shippingCountry.upsert({
      where: { code: country.code },
      update: {
        name: country.name,
        isActive: country.isActive,
        shippingPrice: country.shippingPrice,
        estimatedMinDays: country.estimatedMinDays,
        estimatedMaxDays: country.estimatedMaxDays,
      },
      create: { ...country },
    });
  }
}

async function seedCategories() {
  const uniqueModels = [...new Set(catalogProducts.map((product) => product.model))];

  for (const modelName of uniqueModels) {
    const model = modelMap[modelName];
    if (!model) {
      throw new Error(`Unknown product model: ${modelName}`);
    }
    const seo = categorySeo[modelName];
    if (!seo) {
      throw new Error(`Missing category SEO content for model: ${modelName}`);
    }

    await prisma.category.upsert({
      where: { model },
      update: {
        name: modelName,
        slug: toSlug(modelName),
        ...seo,
      },
      create: {
        name: modelName,
        slug: toSlug(modelName),
        model,
        ...seo,
      },
    });
  }
}

async function seedProducts() {
  const categories = await prisma.category.findMany();
  const categoryByModel = new Map(
    categories.map((category) => [category.model, category]),
  );

  for (const product of catalogProducts) {
    const model = modelMap[product.model];
    const category = categoryByModel.get(model);

    if (!category) {
      throw new Error(`Missing category for model: ${product.model}`);
    }

    const unavailable = new Set(product.unavailableSizes);

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        currency: Currency.USD,
        gender: genderFromCategory(product.category),
        model,
        categoryId: category.id,
        isActive: true,
        isNew: Boolean(product.isNew),
        isBestSeller: Boolean(product.isBestSeller),
        isFeatured: Boolean(product.isFeatured),
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        currency: Currency.USD,
        gender: genderFromCategory(product.category),
        model,
        categoryId: category.id,
        isActive: true,
        isNew: Boolean(product.isNew),
        isBestSeller: Boolean(product.isBestSeller),
        isFeatured: Boolean(product.isFeatured),
      },
    });

    const dbProduct = await prisma.product.findUniqueOrThrow({
      where: { slug: product.slug },
    });

    await prisma.productImage.deleteMany({ where: { productId: dbProduct.id } });
    await prisma.productVariant.deleteMany({ where: { productId: dbProduct.id } });
    await prisma.productColor.deleteMany({ where: { productId: dbProduct.id } });
    await prisma.productSize.deleteMany({ where: { productId: dbProduct.id } });

    const galleryAlts = [
      "Front view",
      "Side view",
      "Back view",
      "Leather detail",
      "Sole detail",
    ];
    const imageData: Prisma.ProductImageCreateManyInput[] = galleryAlts.map(
      (label, index) => ({
        productId: dbProduct.id,
        url: catalogImage,
        alt: `${label} of ${product.name}`,
        position: index,
      }),
    );
    await prisma.productImage.createMany({ data: imageData });

    for (const size of product.sizes) {
      await prisma.productSize.create({
        data: {
          productId: dbProduct.id,
          size,
          available: !unavailable.has(size),
        },
      });
    }

    const colorIds = new Map<string, string>();
    for (const color of product.colors) {
      const created = await prisma.productColor.create({
        data: {
          productId: dbProduct.id,
          name: color.name,
          hex: color.hex,
        },
      });
      colorIds.set(color.key, created.id);
    }

    for (const color of product.colors) {
      const colorId = colorIds.get(color.key);
      if (!colorId) continue;

      for (const size of product.sizes) {
        const sku = `${product.slug}-${color.key}-${size}`.toUpperCase();
        await prisma.productVariant.create({
          data: {
            productId: dbProduct.id,
            colorId,
            size,
            sku,
            stock: unavailable.has(size) ? 0 : 8,
            isActive: true,
          },
        });
      }
    }
  }
}

async function seedHomeCollections() {
  for (const collection of homeCollections) {
    await prisma.homeCollection.upsert({
      where: { slug: collection.slug },
      update: {
        href: collection.href,
        image: collection.image,
        position: collection.position,
        isActive: true,
      },
      create: {
        slug: collection.slug,
        href: collection.href,
        image: collection.image,
        position: collection.position,
        isActive: true,
      },
    });

    const row = await prisma.homeCollection.findUniqueOrThrow({
      where: { slug: collection.slug },
    });

    for (const locale of localeCodes) {
      await prisma.homeCollectionTranslation.upsert({
        where: {
          collectionId_locale: {
            collectionId: row.id,
            locale,
          },
        },
        update: {
          title: collection.title[locale],
          description: collection.description[locale],
          imageAlt: collection.imageAlt[locale],
        },
        create: {
          collectionId: row.id,
          locale,
          title: collection.title[locale],
          description: collection.description[locale],
          imageAlt: collection.imageAlt[locale],
        },
      });
    }
  }
}

async function seedNavigation() {
  for (const item of navigationItems) {
    await prisma.navigationItem.upsert({
      where: { key: item.key },
      update: {
        href: item.href,
        image: item.image,
        position: item.position,
        isActive: true,
      },
      create: {
        key: item.key,
        href: item.href,
        image: item.image,
        position: item.position,
        isActive: true,
      },
    });

    const dbItem = await prisma.navigationItem.findUniqueOrThrow({
      where: { key: item.key },
    });

    for (const locale of localeCodes) {
      await prisma.navigationItemTranslation.upsert({
        where: {
          itemId_locale: { itemId: dbItem.id, locale },
        },
        update: {
          label: item.label[locale],
          imageAlt: item.imageAlt?.[locale],
        },
        create: {
          itemId: dbItem.id,
          locale,
          label: item.label[locale],
          imageAlt: item.imageAlt?.[locale],
        },
      });
    }

    if (!item.groups) continue;

    for (const [groupIndex, group] of item.groups.entries()) {
      await prisma.navigationGroup.upsert({
        where: {
          itemId_key: { itemId: dbItem.id, key: group.key },
        },
        update: { position: groupIndex },
        create: {
          itemId: dbItem.id,
          key: group.key,
          position: groupIndex,
        },
      });

      const dbGroup = await prisma.navigationGroup.findUniqueOrThrow({
        where: { itemId_key: { itemId: dbItem.id, key: group.key } },
      });

      for (const locale of localeCodes) {
        await prisma.navigationGroupTranslation.upsert({
          where: {
            groupId_locale: { groupId: dbGroup.id, locale },
          },
          update: { title: group.title[locale] },
          create: {
            groupId: dbGroup.id,
            locale,
            title: group.title[locale],
          },
        });
      }

      for (const [linkIndex, link] of group.links.entries()) {
        await prisma.navigationLink.upsert({
          where: {
            groupId_href: { groupId: dbGroup.id, href: link.href },
          },
          update: { position: linkIndex },
          create: {
            groupId: dbGroup.id,
            href: link.href,
            position: linkIndex,
          },
        });

        const dbLink = await prisma.navigationLink.findUniqueOrThrow({
          where: { groupId_href: { groupId: dbGroup.id, href: link.href } },
        });

        for (const locale of localeCodes) {
          await prisma.navigationLinkTranslation.upsert({
            where: {
              linkId_locale: { linkId: dbLink.id, locale },
            },
            update: { label: link.label[locale] },
            create: {
              linkId: dbLink.id,
              locale,
              label: link.label[locale],
            },
          });
        }
      }
    }
  }
}

async function seedCmsSections() {
  const dictionaries = { en, ru, hy };
  const sections = [
    { key: "home.hero", page: "home", imageUrl: "/images/banner-image.png", position: 0, values: (locale: keyof typeof dictionaries) => ({ eyebrow: dictionaries[locale].home.heroEyebrow, title: dictionaries[locale].home.heroTitle, text: dictionaries[locale].home.heroText, imageAlt: dictionaries[locale].home.heroImageAlt }) },
    { key: "home.about-teaser", page: "home", imageUrl: null, position: 1, values: (locale: keyof typeof dictionaries) => ({ eyebrow: dictionaries[locale].home.aboutEyebrow, title: dictionaries[locale].home.aboutTitle, text: dictionaries[locale].home.aboutText, ctaLabel: dictionaries[locale].home.aboutCta }) },
    { key: "about.hero", page: "about", imageUrl: "/images/banner-image.png", position: 0, values: (locale: keyof typeof dictionaries) => ({ eyebrow: dictionaries[locale].about.heroEyebrow, title: dictionaries[locale].about.heroTitle, text: dictionaries[locale].about.heroText, imageAlt: dictionaries[locale].about.heroImageAlt }) },
    { key: "about.principle.craft", page: "about", imageUrl: null, position: 1, values: (locale: keyof typeof dictionaries) => ({ title: dictionaries[locale].about.craftTitle, text: dictionaries[locale].about.craftText }) },
    { key: "about.principle.materials", page: "about", imageUrl: null, position: 2, values: (locale: keyof typeof dictionaries) => ({ title: dictionaries[locale].about.materialsPrincipleTitle, text: dictionaries[locale].about.materialsPrincipleText }) },
    { key: "about.principle.design", page: "about", imageUrl: null, position: 3, values: (locale: keyof typeof dictionaries) => ({ title: dictionaries[locale].about.designTitle, text: dictionaries[locale].about.designText }) },
    { key: "about.principle.character", page: "about", imageUrl: null, position: 4, values: (locale: keyof typeof dictionaries) => ({ title: dictionaries[locale].about.characterTitle, text: dictionaries[locale].about.characterText }) },
  ];

  for (const section of sections) {
    const exists = await prisma.cmsSection.findUnique({ where: { key: section.key }, select: { id: true } });
    if (exists) continue;
    await prisma.cmsSection.create({
      data: {
        key: section.key, page: section.page, imageUrl: section.imageUrl, position: section.position,
        translations: { create: localeCodes.map((locale) => ({ locale, ...section.values(locale) })) },
      },
    });
  }
}

async function seedDemoUser() {
  const passwordHash = await hashPassword("Password123!");

  await prisma.user.upsert({
    where: { email: "demo@kapriz.test" },
    update: {
      firstName: "Demo",
      lastName: "Customer",
      passwordHash,
      role: UserRole.CUSTOMER,
    },
    create: {
      firstName: "Demo",
      lastName: "Customer",
      email: "demo@kapriz.test",
      passwordHash,
      role: UserRole.CUSTOMER,
      cart: { create: {} },
    },
  });
}

async function seedAdminUser() {
  const passwordHash = await hashPassword("Password123!");

  await prisma.user.upsert({
    where: { email: "admin@kapriz.test" },
    update: {
      firstName: "Admin",
      lastName: "Kapriz",
      passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      firstName: "Admin",
      lastName: "Kapriz",
      email: "admin@kapriz.test",
      passwordHash,
      role: UserRole.ADMIN,
      cart: { create: {} },
    },
  });
}

async function main() {
  await seedShippingCountries();
  await seedCategories();
  await seedProducts();
  await seedHomeCollections();
  await seedNavigation();
  await seedCmsSections();
  await seedDemoUser();
  await seedAdminUser();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
