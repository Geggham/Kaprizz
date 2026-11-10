import { cache } from "react";
import "server-only";

import type { Locale } from "@/lib/i18n/config";
import { prisma } from "@/lib/prisma";
import { pickTranslation } from "@/lib/server/locale";
import { safeQuery } from "@/lib/server/safe-query";
import type { HomeCollectionInput, NavigationItemInput } from "@/lib/validation/admin-cms";

export type CmsSectionView = {
  key: string;
  page: string;
  imageUrl?: string;
  position: number;
  eyebrow?: string;
  title?: string;
  text?: string;
  imageAlt?: string;
  ctaLabel?: string;
};

export const getCmsSection = cache(async (key: string, locale: Locale): Promise<CmsSectionView | null> =>
  safeQuery(null, async () => {
    const section = await prisma.cmsSection.findFirst({
      where: { key, isActive: true },
      include: { translations: true },
    });
    if (!section) return null;
    const translation = pickTranslation(section.translations, locale);
    return {
      key: section.key,
      page: section.page,
      imageUrl: section.imageUrl ?? undefined,
      position: section.position,
      eyebrow: translation?.eyebrow ?? undefined,
      title: translation?.title ?? undefined,
      text: translation?.text ?? undefined,
      imageAlt: translation?.imageAlt ?? undefined,
      ctaLabel: translation?.ctaLabel ?? undefined,
    };
  }),
);

export async function listAdminCmsSections() {
  return prisma.cmsSection.findMany({
    include: { translations: { orderBy: { locale: "asc" } } },
    orderBy: [{ page: "asc" }, { position: "asc" }],
  });
}

export async function listAdminHomeCollections() {
  return prisma.homeCollection.findMany({
    include: { translations: { orderBy: { locale: "asc" } } },
    orderBy: { position: "asc" },
  });
}

export async function listAdminNavigationItems() {
  return prisma.navigationItem.findMany({
    include: {
      translations: { orderBy: { locale: "asc" } },
      groups: {
        orderBy: { position: "asc" },
        include: {
          translations: { orderBy: { locale: "asc" } },
          links: { orderBy: { position: "asc" }, include: { translations: { orderBy: { locale: "asc" } } } },
        },
      },
    },
    orderBy: { position: "asc" },
  });
}

function localized(rows: { locale: string; value: string }[]) {
  return rows.map(({ locale, value }) => ({ locale, value }));
}

export async function saveHomeCollection(data: HomeCollectionInput, id?: string) {
  const payload = {
    slug: data.slug,
    href: data.href,
    image: data.image,
    position: data.position,
    isActive: data.isActive,
    translations: {
      create: data.title.map((title) => ({
        locale: title.locale,
        title: title.value,
        description: data.description.find((item) => item.locale === title.locale)?.value ?? "",
        imageAlt: data.imageAlt.find((item) => item.locale === title.locale)?.value ?? "",
      })),
    },
  };
  if (!id) return prisma.homeCollection.create({ data: payload, include: { translations: true } });
  return prisma.$transaction(async (tx) => {
    await tx.homeCollectionTranslation.deleteMany({ where: { collectionId: id } });
    return tx.homeCollection.update({ where: { id }, data: payload, include: { translations: true } });
  });
}

export async function saveNavigationItem(data: NavigationItemInput, id?: string) {
  return prisma.$transaction(async (tx) => {
    const item = id
      ? await tx.navigationItem.update({
          where: { id },
          data: { key: data.key, href: data.href, image: data.image || null, position: data.position, isActive: data.isActive },
        })
      : await tx.navigationItem.create({
          data: { key: data.key, href: data.href, image: data.image || null, position: data.position, isActive: data.isActive },
        });

    await tx.navigationItemTranslation.deleteMany({ where: { itemId: item.id } });
    await tx.navigationGroup.deleteMany({ where: { itemId: item.id } });
    await tx.navigationItemTranslation.createMany({
      data: data.labels.map((label) => ({
        itemId: item.id,
        locale: label.locale,
        label: label.value,
        imageAlt: data.imageAlts.find((itemAlt) => itemAlt.locale === label.locale)?.value || null,
      })),
    });
    for (const group of data.groups) {
      const createdGroup = await tx.navigationGroup.create({
        data: {
          itemId: item.id,
          key: group.key,
          position: group.position,
          translations: { create: localized(group.titles).map(({ locale, value }) => ({ locale, title: value })) },
        },
      });
      for (const link of group.links) {
        await tx.navigationLink.create({
          data: {
            groupId: createdGroup.id,
            href: link.href,
            position: link.position,
            translations: { create: localized(link.labels).map(({ locale, value }) => ({ locale, label: value })) },
          },
        });
      }
    }
    return tx.navigationItem.findUniqueOrThrow({
      where: { id: item.id },
      include: { translations: true, groups: { include: { translations: true, links: { include: { translations: true } } } } },
    });
  });
}
