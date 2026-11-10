import Image from "next/image";
import Link from "next/link";
import { EmptyNotice } from "@/components/ui/empty-notice";
import type { TranslateFn } from "@/lib/i18n/create-translator";
import type { HomeCollectionView } from "@/types/collection";

type CollectionsProps = {
  t: TranslateFn;
  collections: HomeCollectionView[];
};

export function Collections({ t, collections }: CollectionsProps) {
  return (
    <section
      aria-labelledby="collections-title"
      className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-24 lg:px-10"
    >
      <div
        className="mb-8 flex items-end justify-between"
        data-collections-heading
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-leather">
            {t("home.chooseStyle")}
          </p>
          <h2
            id="collections-title"
            className="mt-2 text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl"
          >
            {t("home.collectionsTitle")}
          </h2>
        </div>
      </div>

      {collections.length > 0 ? (
        <div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          data-collections-cards
        >
          {collections.map((collection) => (
            <article
              key={collection.id}
              className="group relative aspect-[4/5] overflow-hidden bg-sand sm:aspect-[5/4] lg:aspect-[4/5]"
              data-collection-card
            >
              <Link
                href={collection.href}
                className="absolute inset-0 block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown"
                aria-label={collection.title}
              >
                <Image
                  src={collection.image}
                  alt={collection.imageAlt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brown/70 via-transparent to-transparent transition-opacity duration-500 group-hover:from-brown/80" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                  <h3 className="text-2xl font-semibold transition-transform duration-500 group-hover:translate-y-[-2px]">
                    {collection.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/80">
                    {collection.description}
                  </p>
                  <span className="mt-5 inline-block border-b border-white pb-1 text-sm font-semibold">
                    {t("home.viewCollection")}
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <EmptyNotice text={t("home.emptyCollections")} />
      )}
    </section>
  );
}
