import type { LocaleText } from "./locale";

export type NavigationLinkSeed = {
  href: string;
  label: LocaleText;
};

export type NavigationGroupSeed = {
  key: string;
  title: LocaleText;
  links: NavigationLinkSeed[];
};

export type NavigationItemSeed = {
  key: string;
  href: string;
  image?: string;
  position: number;
  label: LocaleText;
  imageAlt?: LocaleText;
  groups?: NavigationGroupSeed[];
};

export const navigationItems: NavigationItemSeed[] = [
  {
    key: "men",
    href: "/men",
    image: "/images/for-al-boxes.png",
    position: 0,
    label: { en: "Men", ru: "Мужчинам", hy: "Տղամարդկանց" },
    imageAlt: {
      en: "Men's classic footwear by Kapriz",
      ru: "Мужская классическая обувь Kapriz",
      hy: "Kapriz տղամարդկանց դասական կոշիկ",
    },
    groups: [
      {
        key: "footwear",
        title: { en: "Footwear", ru: "Обувь", hy: "Կոշիկ" },
        links: [
          {
            href: "/men",
            label: { en: "All models", ru: "Все модели", hy: "Բոլոր մոդելները" },
          },
          {
            href: "/men/styles/oxford",
            label: { en: "Oxfords", ru: "Оксфорды", hy: "Օքսֆորդներ" },
          },
          {
            href: "/men/styles/derby",
            label: { en: "Derby", ru: "Дерби", hy: "Դերբի" },
          },
          {
            href: "/men/styles/loafer",
            label: { en: "Loafers", ru: "Лоферы", hy: "Լոֆերներ" },
          },
          {
            href: "/men/styles/monk-strap",
            label: { en: "Monk straps", ru: "Монки", hy: "Մոնքեր" },
          },
          {
            href: "/men/styles/boot",
            label: { en: "Boots", ru: "Ботинки", hy: "Ճտքավոր կոշիկներ" },
          },
        ],
      },
      {
        key: "collections",
        title: { en: "Collections", ru: "Коллекции", hy: "Հավաքածուներ" },
        links: [
          {
            href: "/personalisation",
            label: {
              en: "Personalisation",
              ru: "Персонализация",
              hy: "Անհատականացում",
            },
          },
          {
            href: "/about",
            label: { en: "Our story", ru: "Наша история", hy: "Մեր պատմությունը" },
          },
        ],
      },
    ],
  },
  {
    key: "women",
    href: "/women",
    image: "/images/for-al-boxes.png",
    position: 1,
    label: { en: "Women", ru: "Женщинам", hy: "Կանանց" },
    imageAlt: {
      en: "Women's classic footwear by Kapriz",
      ru: "Женская классическая обувь Kapriz",
      hy: "Kapriz կանանց դասական կոշիկ",
    },
    groups: [
      {
        key: "footwear",
        title: { en: "Footwear", ru: "Обувь", hy: "Կոշիկ" },
        links: [
          {
            href: "/women",
            label: { en: "All models", ru: "Все модели", hy: "Բոլոր մոդելները" },
          },
          {
            href: "/women/styles/loafer",
            label: { en: "Loafers", ru: "Лоферы", hy: "Լոֆերներ" },
          },
          {
            href: "/women/styles/pump",
            label: { en: "Pumps", ru: "Туфли", hy: "Կրունկավոր կոշիկ" },
          },
          {
            href: "/women/styles/ballet-flat",
            label: { en: "Ballet flats", ru: "Балетки", hy: "Բալետկաներ" },
          },
          {
            href: "/women/styles/mary-jane",
            label: { en: "Mary Janes", ru: "Мери Джейн", hy: "Մերի Ջեյն" },
          },
          {
            href: "/women/styles/slingback",
            label: { en: "Slingbacks", ru: "Слингбэки", hy: "Սլինգբեք" },
          },
        ],
      },
      {
        key: "collections",
        title: { en: "Collections", ru: "Коллекции", hy: "Հավաքածուներ" },
        links: [
          {
            href: "/personalisation",
            label: {
              en: "Personalisation",
              ru: "Персонализация",
              hy: "Անհատականացում",
            },
          },
          {
            href: "/shipping",
            label: {
              en: "Shipping & Delivery",
              ru: "Доставка",
              hy: "Առաքում",
            },
          },
        ],
      },
    ],
  },
  {
    key: "about",
    href: "/about",
    position: 2,
    label: { en: "About us", ru: "О нас", hy: "Մեր մասին" },
  },
  {
    key: "shipping",
    href: "/shipping",
    position: 3,
    label: {
      en: "Shipping & Delivery",
      ru: "Доставка",
      hy: "Առաքում",
    },
  },
];
