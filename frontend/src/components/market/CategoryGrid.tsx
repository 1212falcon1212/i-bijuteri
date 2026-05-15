'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { categoriesApi, type Category } from '@/lib/api';

interface CategoryIcon {
  slug: string;
  name: string;
  path: React.ReactNode;
}

// Fallback bijuteri categories — used until backend categories load.
// Icon paths mirror i-bijuteri.html `.cat-ic` SVGs (catnav).
const FALLBACK_CATEGORIES: CategoryIcon[] = [
  {
    slug: 'kolyeler',
    name: 'Kolyeler',
    path: (
      <g>
        <path d="M12 3v6" />
        <circle cx="12" cy="15" r="6" />
        <path d="M9 3h6" />
      </g>
    ),
  },
  {
    slug: 'yuzukler',
    name: 'Yüzükler',
    path: (
      <g>
        <circle cx="12" cy="14" r="6" />
        <path d="m9 4 3 4 3-4" />
      </g>
    ),
  },
  {
    slug: 'kupeler',
    name: 'Küpeler',
    path: (
      <g>
        <circle cx="8" cy="5" r="2" />
        <circle cx="16" cy="5" r="2" />
        <path d="M8 7v5a2 2 0 0 0 4 0M16 7v9a2 2 0 0 1-4 0v-4" />
      </g>
    ),
  },
  {
    slug: 'bilezikler',
    name: 'Bilezikler',
    path: (
      <g>
        <ellipse cx="12" cy="12" rx="9" ry="5" />
        <path d="M3 12c0-2 4-4 9-4s9 2 9 4" />
      </g>
    ),
  },
  {
    slug: 'saatler',
    name: 'Saatler',
    path: (
      <g>
        <circle cx="12" cy="12" r="6" />
        <path d="M12 9v3l2 1M9 4l1.5 2M15 4l-1.5 2M9 20l1.5-2M15 20l-1.5-2" />
      </g>
    ),
  },
  {
    slug: 'taki-setleri',
    name: 'Takı Setleri',
    path: (
      <g>
        <rect x="4" y="6" width="16" height="14" rx="2" />
        <path d="M8 6V4h8v2M9 12h6M9 16h4" />
      </g>
    ),
  },
  {
    slug: 'aksesuarlar',
    name: 'Aksesuarlar',
    path: (
      <g>
        <path d="M4 7h16l-2 13H6L4 7z" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2" />
      </g>
    ),
  },
  {
    slug: 'erkek-taki',
    name: 'Erkek Takı',
    path: (
      <g>
        <path d="M6 4h12l-2 6h-8z" />
        <path d="M9 10v4M15 10v4M8 14h8l1 6H7z" />
      </g>
    ),
  },
];

function CatIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function pickIcon(slug: string, index: number): React.ReactNode {
  const match = FALLBACK_CATEGORIES.find((c) => c.slug === slug);
  if (match) return match.path;
  return FALLBACK_CATEGORIES[index % FALLBACK_CATEGORIES.length].path;
}

export function CategoryGrid() {
  const [categories, setCategories] = useState<
    { slug: string; name: string; icon: React.ReactNode }[]
  >(
    FALLBACK_CATEGORIES.map((c) => ({
      slug: c.slug,
      name: c.name,
      icon: c.path,
    }))
  );

  useEffect(() => {
    let cancelled = false;
    categoriesApi
      .getAll()
      .then((res) => {
        if (cancelled) return;
        const list = (res.data?.categories ?? []) as Category[];
        if (list.length === 0) return;
        const mapped = list.slice(0, 8).map((c, idx) => ({
          slug: c.slug,
          name: c.name,
          icon: pickIcon(c.slug, idx),
        }));
        setCategories(mapped);
      })
      .catch(() => {
        // Silent — fallback is already shown.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="max-w-[1320px] mx-auto px-4 lg:px-8 mt-10">
      <div className="bg-white border border-card-border rounded-3xl py-6 lg:py-7 px-4 lg:px-8 shadow-card">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 lg:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/market/category/${cat.slug}`}
              className="group flex flex-col items-center gap-2 rounded-2xl px-3 py-4 hover:bg-surface-bg transition-colors"
            >
              <span className="w-12 h-12 rounded-xl bg-primary-light text-primary-dark grid place-items-center group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <CatIcon>{cat.icon}</CatIcon>
              </span>
              <span className="text-[12.5px] font-medium text-charcoal text-center leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
