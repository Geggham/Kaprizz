"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslate } from "@/hooks/use-translate";
import type { ProductImage } from "@/types";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const { t } = useTranslate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const lightboxImageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const activeImage = images[activeIndex];

  useEffect(() => {
    if (!isLightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsLightboxOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => {
      lightboxImageRefs.current[activeIndex]?.scrollIntoView({
        block: "start",
      });
    });
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, isLightboxOpen]);

  const updateThumbArrows = useCallback(() => {
    const thumbs = thumbsRef.current;
    if (!thumbs) return;

    const maxScrollLeft = thumbs.scrollWidth - thumbs.clientWidth;
    setCanScrollLeft(thumbs.scrollLeft > 1);
    setCanScrollRight(maxScrollLeft > 1 && thumbs.scrollLeft < maxScrollLeft - 1);
  }, []);

  useEffect(() => {
    const thumbs = thumbsRef.current;
    if (!thumbs) return;

    updateThumbArrows();
    const resizeObserver = new ResizeObserver(updateThumbArrows);
    resizeObserver.observe(thumbs);
    thumbs.addEventListener("scroll", updateThumbArrows, { passive: true });

    return () => {
      resizeObserver.disconnect();
      thumbs.removeEventListener("scroll", updateThumbArrows);
    };
  }, [images.length, updateThumbArrows]);

  const scrollThumbs = (direction: "left" | "right") => {
    thumbsRef.current?.scrollBy({
      left: direction === "right" ? 180 : -180,
      behavior: "smooth",
    });
  };

  if (!activeImage) return null;

  return (
    <>
      <div className="relative aspect-[4/5] overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          aria-label={t("productPage.openImageViewer", { product: productName })}
          className="absolute inset-0 z-10 cursor-crosshair focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-brown"
        />
        <Image src={activeImage.src} alt={activeImage.alt} fill priority className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
      </div>
      <div className="relative mt-3 flex items-center gap-2">
        {canScrollLeft ? (
          <button
            type="button"
            onClick={() => scrollThumbs("left")}
            aria-label={t("productPage.previousImages")}
            className="shrink-0 p-1 text-brown"
          >
            ←
          </button>
        ) : null}
        <div ref={thumbsRef} className="flex min-w-0 gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((image, index) => (
            <button key={image.id} type="button" aria-label={t("productPage.viewProductImage", { number: index + 1, product: productName })} aria-pressed={index === activeIndex} onClick={() => setActiveIndex(index)} className={`relative aspect-square w-16 shrink-0 overflow-hidden border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown ${index === activeIndex ? "border-brown" : "border-sand"}`}>
              <Image src={image.src} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
        {canScrollRight ? (
          <button
            type="button"
            onClick={() => scrollThumbs("right")}
            aria-label={t("productPage.moreImages")}
            className="shrink-0 p-1 text-brown"
          >
            →
          </button>
        ) : null}
      </div>
      {isLightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("productPage.imageViewer", { product: productName })}
          className="fixed inset-0 z-[80] snap-y snap-mandatory overflow-y-auto bg-charcoal/95"
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="fixed right-4 top-4 z-10 bg-ivory px-3 py-2 text-sm font-semibold text-brown sm:right-6 sm:top-6"
          >
            {t("productPage.closeImageViewer")}
          </button>
          <div className="mx-auto w-full max-w-6xl">
            {images.map((image, index) => (
              <div
                key={image.id}
                ref={(element) => {
                  lightboxImageRefs.current[index] = element;
                }}
                className="relative h-svh w-full snap-start"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  priority={index === activeIndex}
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
