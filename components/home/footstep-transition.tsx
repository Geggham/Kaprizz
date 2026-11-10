"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type FootstepTransitionProps = {
  hero: ReactNode;
  collections: ReactNode;
};

type Phase = "idle" | "lead" | "walking" | "revealing";

type Footstep = {
  side: "left" | "right";
  top: number;
  offset: number;
  rotation: number;
  delay: number;
};

type LockedStyles = {
  htmlScrollBehavior: string;
  bodyOverscrollBehavior: string;
  bodyOverflow: string;
  bodyTouchAction: string;
};

const HEADER_HEIGHT = 72;
const HERO_LEAD_RATIO = 0.5;
const LEAD_DURATION = 400;
const WALK_DURATION = 1000;
const REVEAL_DURATION = 700;
const STEP_SRC = "/images/my-step.svg";

const footsteps: Footstep[] = [
  { side: "left", top: 8, offset: -42, rotation: 180, delay: 0 },
  { side: "right", top: 42, offset: 48, rotation: 180, delay: 320 },
  { side: "left", top: 76, offset: -46, rotation: 180, delay: 640 },
];

function easeInOutCubic(progress: number): number {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export function FootstepTransition({
  hero,
  collections,
}: FootstepTransitionProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const collectionsRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const revealTimeoutRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const hasPlayedRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const lockedStylesRef = useRef<LockedStyles | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  const isCovered = phase === "lead" || phase === "walking";

  const restoreScrollStyles = useCallback(() => {
    const lockedStyles = lockedStylesRef.current;
    if (!lockedStyles) {
      return;
    }

    document.documentElement.style.scrollBehavior =
      lockedStyles.htmlScrollBehavior;
    document.body.style.overscrollBehavior =
      lockedStyles.bodyOverscrollBehavior;
    document.body.style.overflow = lockedStyles.bodyOverflow;
    document.body.style.touchAction = lockedStyles.bodyTouchAction;
    lockedStylesRef.current = null;
  }, []);

  const lockScrollStyles = useCallback(() => {
    if (lockedStylesRef.current) {
      return;
    }

    lockedStylesRef.current = {
      htmlScrollBehavior: document.documentElement.style.scrollBehavior,
      bodyOverscrollBehavior: document.body.style.overscrollBehavior,
      bodyOverflow: document.body.style.overflow,
      bodyTouchAction: document.body.style.touchAction,
    };
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.overscrollBehavior = "none";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  }, []);

  const isHeroActive = useCallback((): boolean => {
    const element = heroRef.current;
    if (!element) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    const visibleTop = Math.max(rect.top, HEADER_HEIGHT);
    const visibleBottom = Math.min(rect.bottom, window.innerHeight);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    const referenceHeight = Math.min(
      rect.height,
      window.innerHeight - HEADER_HEIGHT,
    );

    return referenceHeight > 0 && visibleHeight / referenceHeight >= 0.35;
  }, []);

  const finishTransition = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    restoreScrollStyles();
    isTransitioningRef.current = false;
    setPhase("revealing");

    revealTimeoutRef.current = window.setTimeout(() => {
      revealTimeoutRef.current = null;
      setPhase("idle");
    }, REVEAL_DURATION);
  }, [restoreScrollStyles]);

  const animateScrollTo = useCallback(
    (targetY: number, duration: number, onComplete: () => void) => {
      const startY = window.scrollY;
      const distance = targetY - startY;

      if (Math.abs(distance) < 2 || duration <= 0) {
        window.scrollTo(0, targetY);
        onComplete();
        return;
      }

      let startedAt: number | null = null;

      const step = (timestamp: number) => {
        startedAt ??= timestamp;
        const progress = Math.min((timestamp - startedAt) / duration, 1);
        window.scrollTo(0, startY + distance * easeInOutCubic(progress));

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(step);
          return;
        }

        animationFrameRef.current = null;
        onComplete();
      };

      animationFrameRef.current = requestAnimationFrame(step);
    },
    [],
  );

  const startTransition = useCallback(() => {
    const heroElement = heroRef.current;
    const collectionsElement = collectionsRef.current;

    if (
      hasPlayedRef.current ||
      isTransitioningRef.current ||
      !heroElement ||
      !collectionsElement
    ) {
      return;
    }

    hasPlayedRef.current = true;

    const collectionsTarget = Math.max(
      0,
      window.scrollY +
        collectionsElement.getBoundingClientRect().top -
        HEADER_HEIGHT,
    );

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo({ top: collectionsTarget, behavior: "auto" });
      return;
    }

    isTransitioningRef.current = true;
    lockScrollStyles();
    setPhase("lead");

    const heroRect = heroElement.getBoundingClientRect();
    const heroTop = window.scrollY + heroRect.top;
    const leadTarget = Math.min(
      collectionsTarget,
      Math.max(0, heroTop + heroRect.height * HERO_LEAD_RATIO - HEADER_HEIGHT),
    );

    animateScrollTo(leadTarget, LEAD_DURATION, () => {
      setPhase("walking");
      animateScrollTo(collectionsTarget, WALK_DURATION, finishTransition);
    });
  }, [animateScrollTo, finishTransition, lockScrollStyles]);

  useEffect(() => {
    const shouldStart = (): boolean =>
      !hasPlayedRef.current &&
      !isTransitioningRef.current &&
      isHeroActive();

    const handleWheel = (event: WheelEvent) => {
      if (isTransitioningRef.current) {
        event.preventDefault();
        return;
      }

      if (event.deltaY > 6 && shouldStart()) {
        event.preventDefault();
        startTransition();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (isTransitioningRef.current) {
        event.preventDefault();
        return;
      }

      const startY = touchStartYRef.current;
      const currentY = event.touches[0]?.clientY;
      if (
        startY !== null &&
        currentY !== undefined &&
        startY - currentY > 12 &&
        shouldStart()
      ) {
        event.preventDefault();
        touchStartYRef.current = null;
        startTransition();
      }
    };

    const handleTouchEnd = () => {
      touchStartYRef.current = null;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTransitioningRef.current) {
        const isScrollKey = [
          "ArrowDown",
          "ArrowUp",
          "PageDown",
          "PageUp",
          "Home",
          "End",
          " ",
        ].includes(event.key);

        if (isScrollKey) {
          event.preventDefault();
        }
        return;
      }

      const isDownwardKey =
        event.key === "ArrowDown" ||
        event.key === "PageDown" ||
        event.key === "End" ||
        (event.key === " " && !event.shiftKey);

      if (isDownwardKey && shouldStart()) {
        event.preventDefault();
        startTransition();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (revealTimeoutRef.current !== null) {
        clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
      restoreScrollStyles();
    };
  }, [isHeroActive, restoreScrollStyles, startTransition]);

  return (
    <div className="relative" data-footstep-transition={phase}>
      {isCovered ? <div className="footstep-transition__blocker" /> : null}

      <div ref={heroRef}>{hero}</div>

      <div className="relative h-0">
        {isCovered ? (
          <div className="footstep-transition" aria-hidden="true">
            <div className="footstep-transition__cover" />

            {phase === "walking" ? (
              <div className="footstep-transition__path">
                {footsteps.map((step, index) => {
                  const style = {
                    top: `${step.top}%`,
                    animationDelay: `${step.delay}ms`,
                    "--step-offset": `${step.offset}px`,
                    "--step-mobile-offset": `${step.offset * 0.6}px`,
                    "--step-rotation": `${step.rotation}deg`,
                  } as CSSProperties;

                  return (
                    <Image
                      key={`${step.side}-${step.delay}`}
                      src={STEP_SRC}
                      alt=""
                      width={96}
                      height={96}
                      priority={index < 2}
                      className="footstep-transition__step"
                      style={style}
                    />
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div ref={collectionsRef}>{collections}</div>
    </div>
  );
}
