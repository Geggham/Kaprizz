"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslate } from "@/hooks/use-translate";

const VIDEO_SRC = "/videos/IMG_3720.MOV";

type AboutSectionVideoProps = {
  className?: string;
};

export function AboutSectionVideo({ className }: AboutSectionVideoProps) {
  const { t } = useTranslate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inlineVideoRef = useRef<HTMLVideoElement>(null);
  const lightboxVideoRef = useRef<HTMLVideoElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.4 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = inlineVideoRef.current;
    if (!video || isExpanded) return;

    if (isInView) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [isInView, isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;

    const lightboxVideo = lightboxVideoRef.current;
    const inlineVideo = inlineVideoRef.current;
    inlineVideo?.pause();

    if (lightboxVideo) {
      lightboxVideo.currentTime = inlineVideo?.currentTime ?? 0;
      lightboxVideo.muted = false;
      void lightboxVideo.play().catch(() => undefined);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsExpanded(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      lightboxVideo?.pause();
    };
  }, [isExpanded]);

  useEffect(() => {
    if (isExpanded) return;

    const inlineVideo = inlineVideoRef.current;
    if (!inlineVideo || !isInView) return;

    void inlineVideo.play().catch(() => undefined);
  }, [isExpanded, isInView]);

  const openExpanded = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const closeExpanded = useCallback(() => {
    setIsExpanded(false);
  }, []);

  return (
    <>
      <div ref={containerRef} className={className}>
        <button
          type="button"
          onClick={openExpanded}
          aria-label={t("about.expandVideo")}
          className="group relative block h-full min-h-[360px] w-full overflow-hidden bg-sand md:min-h-[560px]"
        >
          <video
            ref={inlineVideoRef}
            src={VIDEO_SRC}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={t("about.handmadeImageAlt")}
          />
          <span className="pointer-events-none absolute inset-0 bg-brown/0 transition-colors group-hover:bg-brown/15" />
          <span className="pointer-events-none absolute bottom-4 right-4 border border-white/80 bg-brown/55 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white opacity-90 transition-opacity group-hover:opacity-100">
            {t("about.expandVideo")}
          </span>
        </button>
      </div>

      {isExpanded
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={t("about.handmadeImageAlt")}
              className="fixed inset-0 z-[80] overflow-hidden overscroll-none bg-charcoal/90"
              onClick={closeExpanded}
            >
              <button
                type="button"
                onClick={closeExpanded}
                className="absolute right-4 top-4 z-10 border border-white/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-brown sm:right-8 sm:top-8"
              >
                {t("about.closeVideo")}
              </button>
              <div className="flex h-[100dvh] w-full max-w-full items-center justify-center overflow-hidden p-4 sm:p-8">
                <video
                  ref={lightboxVideoRef}
                  src={VIDEO_SRC}
                  className="about-section-video-lightbox h-auto w-auto min-h-0 min-w-0 max-h-full max-w-full object-contain"
                  controls
                  playsInline
                  loop
                  onClick={(event) => event.stopPropagation()}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
