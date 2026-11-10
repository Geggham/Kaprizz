import { cache } from "react";
import "server-only";

import type { Locale } from "@/lib/i18n/config";
import { prisma } from "@/lib/prisma";
import { pickTranslation } from "@/lib/server/locale";
import { safeQuery } from "@/lib/server/safe-query";
import type { NavigationItemView } from "@/types/navigation";

export const getNavigation = cache(
  async (locale: Locale): Promise<NavigationItemView[]> => {
    return safeQuery([], async () => {
      if (!prisma.navigationItem) {
        return [];
      }

      const items = await prisma.navigationItem.findMany({
    where: { isActive: true },
    orderBy: { position: "asc" },
    include: {
      translations: true,
      groups: {
        orderBy: { position: "asc" },
        include: {
          translations: true,
          links: {
            orderBy: { position: "asc" },
            include: { translations: true },
          },
        },
      },
    },
  });

    return items.flatMap((item) => {
      const translation = pickTranslation(item.translations, locale);
      if (!translation) return [];

      const groups = item.groups.flatMap((group) => {
        const groupTranslation = pickTranslation(group.translations, locale);
        if (!groupTranslation) return [];

        return [
          {
            id: group.id,
            title: groupTranslation.title,
            links: group.links.flatMap((link) => {
              const linkTranslation = pickTranslation(link.translations, locale);
              if (!linkTranslation) return [];
              return [{ href: link.href, label: linkTranslation.label }];
            }),
          },
        ];
      });

      return [
        {
          id: item.id,
          href: item.href,
          label: translation.label,
          image: item.image ?? undefined,
          imageAlt: translation.imageAlt ?? undefined,
          groups: groups.length > 0 ? groups : undefined,
        },
      ];
    });
    });
  },
);

