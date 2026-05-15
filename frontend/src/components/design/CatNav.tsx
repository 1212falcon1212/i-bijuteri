"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { cmsApi, type CategoryItem } from "@/lib/api";

interface CatNavProps {
  /** Categories — typically from cmsApi.getHomepage().categories. */
  categories?: CategoryItem[];
  /** Default static fallback when categories haven't loaded yet (for landing). */
  fallback?: boolean;
  /** Max categories to show (default 12). */
  max?: number;
}

// Slug → Iconify mapping (bijuteri-specific)
const CATEGORY_ICON_MAP: Record<string, string> = {
  kolye: "ph:gem-duotone",
  kupe: "mdi:earring",
  yuzuk: "mdi:ring",
  bilezik: "ph:circle-half-tilt-duotone",
  halhal: "ph:waves-duotone",
  saat: "ph:watch-duotone",
  set: "ph:diamonds-four-duotone",
  bros: "ph:flower-duotone",
  toka: "ph:flower-duotone",
  sac: "ph:flow-arrow-duotone",
  kozmetik: "ph:lipstick-duotone",
  gelin: "ph:crown-simple-duotone",
  celik: "ph:diamond-duotone",
  kadin: "ph:gender-female-duotone",
  erkek: "ph:gender-male-duotone",
  cocuk: "ph:baby-duotone",
  canta: "ph:handbag-duotone",
  cuzdan: "ph:wallet-duotone",
  kemer: "ph:circle-dashed-duotone",
  gecici: "ph:paint-brush-duotone",
  dovme: "ph:paint-brush-duotone",
  aksesuar: "ph:sparkle-duotone",
  marka: "ph:storefront-duotone",
};

const DEFAULT_ICON = "ph:gem-duotone";

function getCategoryIcon(slug: string): string {
  const lowered = (slug || "").toLowerCase();
  const key = Object.keys(CATEGORY_ICON_MAP).find((k) => lowered.includes(k));
  return key ? CATEGORY_ICON_MAP[key] : DEFAULT_ICON;
}

// Static fallback for landing visitors (no auth → no /cms/homepage data)
const FALLBACK_CATEGORIES: CategoryItem[] = [
  { id: -1, name: "Kolyeler", slug: "kolye", icon: "", products_count: 0 },
  { id: -2, name: "Yüzükler", slug: "yuzuk", icon: "", products_count: 0 },
  { id: -3, name: "Küpeler", slug: "kupe", icon: "", products_count: 0 },
  { id: -4, name: "Bilezikler", slug: "bilezik", icon: "", products_count: 0 },
  { id: -5, name: "Saatler", slug: "saat", icon: "", products_count: 0 },
  { id: -6, name: "Takı Setleri", slug: "set", icon: "", products_count: 0 },
  { id: -7, name: "Aksesuarlar", slug: "aksesuar", icon: "", products_count: 0 },
  { id: -8, name: "Erkek Takı", slug: "erkek-taki", icon: "", products_count: 0 },
  { id: -9, name: "Tüm Markalar", slug: "markalar", icon: "", products_count: 0 },
];

/**
 * 3-row header pattern, row 3:
 *  - Horizontal category navigation with bottom-border accent on hover/active.
 *  - Uses horizontal scroll (hidden scrollbar) when categories overflow the
 *    container width — supports 12+ root categories without clipping.
 *  - On wider categories: shows a simple mega menu (subcategories grid).
 */
export default function CatNav({
  categories: categoriesProp,
  fallback = false,
  max = 12,
}: CatNavProps = {}) {
  const initial: CategoryItem[] =
    categoriesProp && categoriesProp.length > 0
      ? categoriesProp
      : fallback
        ? FALLBACK_CATEGORIES
        : [];

  const [categories, setCategories] = useState<CategoryItem[]>(initial);
  const [activeId, setActiveId] = useState<number | null>(null);

  // Fetch from /cms/homepage when no categories prop provided.
  useEffect(() => {
    if (categoriesProp && categoriesProp.length > 0) {
      setCategories(categoriesProp);
      return;
    }

    let cancelled = false;
    cmsApi
      .getHomepage()
      .then((res) => {
        if (cancelled) return;
        const cats = res.data?.categories ?? [];
        if (cats.length > 0) {
          setCategories(cats);
        } else if (fallback) {
          setCategories(FALLBACK_CATEGORIES);
        }
      })
      .catch(() => {
        if (!cancelled && fallback) setCategories(FALLBACK_CATEGORIES);
      });

    return () => {
      cancelled = true;
    };
  }, [categoriesProp, fallback]);

  if (categories.length === 0) return null;

  const visible = categories.slice(0, max);

  return (
    <nav className="hidden lg:block bg-white border-b border-card-border relative z-40">
      <div className="max-w-[1320px] mx-auto px-4 lg:px-8">
        {/* Horizontal scroll wrapper — overflows to scroll instead of clip */}
        <div className="flex items-stretch gap-1 overflow-x-auto scrollbar-hide">
          {visible.map((category) => {
            const hasChildren = !!category.children && category.children.length > 0;
            const isActive = activeId === category.id;
            const href =
              category.slug === "markalar"
                ? "/market/markalar"
                : `/market/category/${category.full_slug || category.slug}`;

            return (
              <div
                key={category.id}
                className="relative flex items-stretch shrink-0"
                onMouseEnter={() => hasChildren && setActiveId(category.id)}
                onMouseLeave={() => setActiveId(null)}
              >
                <Link
                  href={href}
                  className={cn(
                    "group flex items-center gap-2 px-3 py-3.5 text-[13.5px] font-medium whitespace-nowrap relative cursor-pointer transition-colors",
                    isActive
                      ? "text-primary-dark"
                      : "text-charcoal hover:text-primary-dark",
                  )}
                >
                  <Icon
                    icon={getCategoryIcon(category.slug)}
                    className="w-4 h-4 text-primary-dark shrink-0"
                  />
                  <span>{category.name}</span>
                  {hasChildren && (
                    <ChevronDown
                      className={cn(
                        "w-3 h-3 text-charcoal-light transition-transform",
                        isActive && "rotate-180 text-primary-dark",
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "absolute left-3 right-3 bottom-0 h-0.5 bg-primary transition-transform origin-left",
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </Link>

                {/* Mega menu */}
                {isActive && hasChildren && (
                  <div
                    className="absolute left-0 top-full bg-white shadow-lift border-t border-card-border rounded-b-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                    style={{ minWidth: 480 }}
                  >
                    <div className="p-6 grid grid-cols-2 gap-x-6 gap-y-1">
                      {category.children!.slice(0, 12).map((child) => (
                        <Link
                          key={child.id}
                          href={`/market/category/${child.full_slug || child.slug}`}
                          className="py-2 px-3 rounded-lg text-sm text-charcoal hover:bg-primary-light hover:text-primary-dark transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
