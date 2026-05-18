import type { Metadata } from "next";
import LandingClient, {
  DEFAULT_CONTENT,
  type LandingContent,
} from "./LandingClient";

export const metadata: Metadata = {
  title: "i-Bijuteri | Türkiye'nin B2B Bijuteri Pazaryeri",
  description:
    "Toptan bijuteri ticaretinin dijital adresi. VKN doğrulamalı satıcılar, %10 komisyon + ₺50 hizmet bedeli, esnek kargo.",
  keywords: [
    "bijuteri",
    "toptan bijuteri",
    "B2B bijuteri",
    "kolye",
    "küpe",
    "yüzük",
    "bilezik",
    "bijuteri pazaryeri",
    "kuyumcu toptan",
  ],
  openGraph: {
    title: "i-Bijuteri | Türkiye'nin B2B Bijuteri Pazaryeri",
    description:
      "Toptan bijuteri ticaretinin dijital adresi. VKN doğrulamalı satıcılar, %10 komisyon + ₺50 hizmet bedeli, esnek kargo.",
    type: "website",
    siteName: "i-Bijuteri",
  },
  twitter: {
    card: "summary_large_image",
    title: "i-Bijuteri | Türkiye'nin B2B Bijuteri Pazaryeri",
    description:
      "Toptan bijuteri ticaretinin dijital adresi. VKN doğrulamalı satıcılar, %10 komisyon + ₺50 hizmet bedeli, esnek kargo.",
  },
};

// Skip build-time prerender — landing renders SSR per-request with cached fetch
export const dynamic = "force-dynamic";
export const fetchCache = "default-cache";

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

function mergeContent(data: DeepPartial<LandingContent>): LandingContent {
  const safe = <T,>(d: T | undefined, fallback: T): T => (d == null ? fallback : d);
  return {
    hero: { ...DEFAULT_CONTENT.hero, ...safe(data.hero, {}) },
    how_it_works: {
      ...DEFAULT_CONTENT.how_it_works,
      ...safe(data.how_it_works, {}),
      steps: safe(data.how_it_works?.steps as typeof DEFAULT_CONTENT.how_it_works.steps | undefined, DEFAULT_CONTENT.how_it_works.steps),
      verification_checklist: safe(data.how_it_works?.verification_checklist as string[] | undefined, DEFAULT_CONTENT.how_it_works.verification_checklist),
      trusted_by_cities: safe(data.how_it_works?.trusted_by_cities as string[] | undefined, DEFAULT_CONTENT.how_it_works.trusted_by_cities),
    },
    advantages: {
      ...DEFAULT_CONTENT.advantages,
      ...safe(data.advantages, {}),
      features: safe(data.advantages?.features as typeof DEFAULT_CONTENT.advantages.features | undefined, DEFAULT_CONTENT.advantages.features),
    },
    stats: {
      ...DEFAULT_CONTENT.stats,
      ...safe(data.stats, {}),
      items: safe(data.stats?.items as typeof DEFAULT_CONTENT.stats.items | undefined, DEFAULT_CONTENT.stats.items),
    },
    testimonials: {
      ...DEFAULT_CONTENT.testimonials,
      ...safe(data.testimonials, {}),
      items: safe(data.testimonials?.items as typeof DEFAULT_CONTENT.testimonials.items | undefined, DEFAULT_CONTENT.testimonials.items),
    },
    faq: {
      ...DEFAULT_CONTENT.faq,
      ...safe(data.faq, {}),
      items: safe(data.faq?.items as typeof DEFAULT_CONTENT.faq.items | undefined, DEFAULT_CONTENT.faq.items),
    },
    cta: { ...DEFAULT_CONTENT.cta, ...safe(data.cta, {}) },
  };
}

async function fetchLandingContent(): Promise<LandingContent> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8004/api";
  try {
    const res = await fetch(`${apiUrl}/landing-content`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return DEFAULT_CONTENT;
    const data = (await res.json()) as DeepPartial<LandingContent>;
    return mergeContent(data ?? {});
  } catch {
    return DEFAULT_CONTENT;
  }
}

export default async function HomePage() {
  const content = await fetchLandingContent();
  return <LandingClient initialContent={content} />;
}
