"use client";

import { useRef, useState } from "react";
import type { ProductColor } from "@/types";

type ProductColorSwatchesProps = {
  colors: ProductColor[];
  productName: string;
};

export function ProductColorSwatches({
  colors,
  productName,
}: ProductColorSwatchesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedColor, setSelectedColor] = useState(colors[0]?.id);
  const [canScrollForward, setCanScrollForward] = useState(colors.length > 5);
  const [canScrollBackward, setCanScrollBackward] = useState(false);

  const updateScrollButtons = () => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    setCanScrollBackward(element.scrollLeft > 2);
    setCanScrollForward(
      element.scrollLeft + element.clientWidth < element.scrollWidth - 2,
    );
  };

  const scroll = (direction: "backward" | "forward") => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    element.scrollBy({
      left: direction === "forward" ? 104 : -104,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex min-w-0 items-center gap-1 pt-3">
      {canScrollBackward ? (
        <button
          type="button"
          aria-label={`Show previous colours for ${productName}`}
          onClick={() => scroll("backward")}
          className="shrink-0 p-1 text-leather transition-colors hover:text-brown focus-visible:outline-2 focus-visible:outline-brown"
        >
          ←
        </button>
      ) : null}

      <div
        ref={scrollRef}
        onScroll={updateScrollButtons}
        className="flex min-w-0 gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {colors.map((color) => {
          const selected = color.id === selectedColor;

          return (
            <button
              key={color.id}
              type="button"
              aria-label={`Select ${color.name} for ${productName}`}
              aria-pressed={selected}
              onClick={() => setSelectedColor(color.id)}
              className={`flex size-5 shrink-0 items-center justify-center rounded-full border border-charcoal/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown ${
                selected ? "ring-1 ring-brown ring-offset-2" : ""
              }`}
              style={{ backgroundColor: color.hex }}
            >
              <span className="sr-only">
                {color.name}
                {selected ? ", selected" : ""}
              </span>
            </button>
          );
        })}
      </div>

      {canScrollForward ? (
        <button
          type="button"
          aria-label={`Show more colours for ${productName}`}
          onClick={() => scroll("forward")}
          className="shrink-0 p-1 text-leather transition-colors hover:text-brown focus-visible:outline-2 focus-visible:outline-brown"
        >
          →
        </button>
      ) : null}
    </div>
  );
}
