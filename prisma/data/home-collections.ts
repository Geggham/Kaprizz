import type { LocaleText } from "./locale";

export type HomeCollectionSeed = {
  slug: string;
  href: string;
  image: string;
  position: number;
  title: LocaleText;
  description: LocaleText;
  imageAlt: LocaleText;
};

export const homeCollections: HomeCollectionSeed[] = [
  {
    slug: "men",
    href: "/men",
    image: "/images/for-al-boxes.png",
    position: 0,
    title: {
      en: "Men's collection",
      ru: "Мужская коллекция",
      hy: "Տղամարդկանց հավաքածու",
    },
    description: {
      en: "Clean lines and a precise fit",
      ru: "Строгие линии и безупречная посадка",
      hy: "Խիստ գծեր և անթերի նստվածք",
    },
    imageAlt: {
      en: "Men's classic footwear collection",
      ru: "Мужская коллекция классической обуви",
      hy: "Տղամարդկանց դասական կոշիկի հավաքածու",
    },
  },
  {
    slug: "women",
    href: "/women",
    image: "/images/for-al-boxes.png",
    position: 1,
    title: {
      en: "Women's collection",
      ru: "Женская коллекция",
      hy: "Կանանց հավաքածու",
    },
    description: {
      en: "Elegance in every detail",
      ru: "Элегантность в каждой детали",
      hy: "Նրբագեղություն յուրաքանչյուր դետալում",
    },
    imageAlt: {
      en: "Women's classic footwear collection",
      ru: "Женская коллекция классической обуви",
      hy: "Կանանց դասական կոշիկի հավաքածու",
    },
  },
  {
    slug: "personalisation",
    href: "/personalisation",
    image: "/images/personalisation-box.png",
    position: 2,
    title: {
      en: "Personalisation",
      ru: "Personalisation",
      hy: "Personalisation",
    },
    description: {
      en: "Make each pair distinctly your own",
      ru: "Сделайте каждую пару по-настоящему вашей",
      hy: "Դարձրեք յուրաքանչյուր զույգ իսկապես ձերը",
    },
    imageAlt: {
      en: "Kapriz personalised classic leather shoe",
      ru: "Персонализированная классическая кожаная обувь Kapriz",
      hy: "Kapriz անհատականացված դասական կաշվե կոշիկ",
    },
  },
];
