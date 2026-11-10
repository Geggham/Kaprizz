import Link from "next/link";
import { getTranslator } from "@/lib/i18n/get-translator";

export default async function NotFound() {
  const { t } = await getTranslator();

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[900px] flex-col items-start justify-center px-6 py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-leather">
        404
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal">
        {t("notFound.title")}
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-leather">
        {t("notFound.text")}
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/"
          className="border-b border-brown pb-1 text-sm font-semibold text-brown"
        >
          {t("notFound.home")}
        </Link>
        <Link
          href="/men"
          className="border-b border-brown pb-1 text-sm font-semibold text-brown"
        >
          {t("notFound.men")}
        </Link>
        <Link
          href="/women"
          className="border-b border-brown pb-1 text-sm font-semibold text-brown"
        >
          {t("notFound.women")}
        </Link>
      </div>
    </main>
  );
}
