"use client";

import { useState } from "react";
import { CmsManager } from "@/components/admin/cms-manager";
import {
  HomeCollectionsManager,
  NavigationManager,
} from "@/components/admin/cms-commerce-managers";

const cmsTabs = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "collections", label: "Collections" },
  { id: "navigation", label: "Navigation" },
] as const;

type CmsTab = (typeof cmsTabs)[number]["id"];

type CmsSection = {
  id: string;
  key: string;
  page: string;
  imageUrl: string | null;
  position: number;
  isActive: boolean;
  translations: {
    locale: string;
    eyebrow: string | null;
    title: string | null;
    text: string | null;
    imageAlt: string | null;
    ctaLabel: string | null;
  }[];
};

type Collection = {
  id: string;
  slug: string;
  href: string;
  image: string;
  position: number;
  isActive: boolean;
  translations: {
    locale: string;
    title: string;
    description: string;
    imageAlt: string;
  }[];
};

type NavigationItem = {
  id: string;
  key: string;
  href: string;
  image: string | null;
  position: number;
  isActive: boolean;
  translations: { locale: string; label: string; imageAlt: string | null }[];
  groups: {
    id: string;
    key: string;
    position: number;
    translations: { locale: string; title: string }[];
    links: {
      id: string;
      href: string;
      position: number;
      translations: { locale: string; label: string }[];
    }[];
  }[];
};

export function CmsAdmin({
  sections,
  collections,
  navigation,
}: {
  sections: CmsSection[];
  collections: Collection[];
  navigation: NavigationItem[];
}) {
  const [tab, setTab] = useState<CmsTab>("home");

  return (
    <div>
      <div
        role="tablist"
        aria-label="CMS sections"
        className="inline-flex max-w-full flex-wrap gap-1 rounded-md border border-sand bg-white p-1"
      >
        {cmsTabs.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`cms-tab-${item.id}`}
              aria-controls={`cms-panel-${item.id}`}
              onClick={() => setTab(item.id)}
              className={`rounded px-3 py-2 text-sm font-semibold transition-colors ${
                selected
                  ? "bg-brown text-white"
                  : "text-leather hover:bg-sand hover:text-charcoal"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {tab === "home" && (
          <div
            role="tabpanel"
            id="cms-panel-home"
            aria-labelledby="cms-tab-home"
          >
            <CmsManager sections={sections} page="home" />
          </div>
        )}
        {tab === "about" && (
          <div
            role="tabpanel"
            id="cms-panel-about"
            aria-labelledby="cms-tab-about"
          >
            <CmsManager sections={sections} page="about" />
          </div>
        )}
        {tab === "collections" && (
          <div
            role="tabpanel"
            id="cms-panel-collections"
            aria-labelledby="cms-tab-collections"
          >
            <HomeCollectionsManager collections={collections} />
          </div>
        )}
        {tab === "navigation" && (
          <div
            role="tabpanel"
            id="cms-panel-navigation"
            aria-labelledby="cms-tab-navigation"
          >
            <NavigationManager items={navigation} />
          </div>
        )}
      </div>
    </div>
  );
}
