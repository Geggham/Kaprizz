import Image from "next/image";
import Link from "next/link";
import type { TranslateFn } from "@/lib/i18n/create-translator";
import type { CmsSectionView } from "@/lib/server/cms";

type HeroProps = {
  t: TranslateFn;
  menLabel: string;
  womenLabel: string;
  content?: CmsSectionView | null;
};

export function Hero({ t, menLabel, womenLabel, content }: HeroProps) {
  return (
    <section className="relative min-h-[calc(100svh-72px)] overflow-hidden bg-brown">
      <Image
        src={content?.imageUrl ?? "/images/banner-image.png"}
        alt={content?.imageAlt ?? t("home.heroImageAlt")}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-brown/80 via-brown/35 to-transparent" />
      <div className="relative mx-auto flex min-h-[calc(100svh-72px)] max-w-[1440px] items-end px-6 pb-16 sm:items-center sm:pb-0 lg:px-10">
        <div className="max-w-xl text-white">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-gold">
            {content?.eyebrow ?? t("home.heroEyebrow")}
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            {content?.title ?? t("home.heroTitle")}
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-white/85 sm:text-lg">
            {content?.text ?? t("home.heroText")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/men"
              className="bg-white px-6 py-3 text-sm font-semibold text-brown transition-colors hover:bg-sand"
            >
              {menLabel}
            </Link>
            <Link
              href="/women"
              className="border border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-brown"
            >
              {womenLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
