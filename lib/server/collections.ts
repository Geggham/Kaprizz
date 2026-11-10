import { cache } from "react";
import "server-only";

import type { Locale } from "@/lib/i18n/config";
import { prisma } from "@/lib/prisma";
import { pickTranslation } from "@/lib/server/locale";
import { safeQuery } from "@/lib/server/safe-query";
import type { HomeCollectionView } from "@/types/collection";

export const getHomeCollections = cache(
  async (locale: Locale): Promise<HomeCollectionView[]> => {
    return safeQuery([], async () => {
      if (!prisma.homeCollection) {
        return [];
      }

      const collections = await prisma.homeCollection.findMany({
    where: { isActive: true },
    orderBy: { position: "asc" },
    include: { translations: true },
  });

      return collections.flatMap((collection) => {
        const translation = pickTranslation(collection.translations, locale);
        if (!translation) return [];

        return [
          {
            id: collection.id,
            slug: collection.slug,
            href: collection.href,
            image: collection.image,
            title: translation.title,
            description: translation.description,
            imageAlt: translation.imageAlt,
          },
        ];
      });
    });
  },
);

