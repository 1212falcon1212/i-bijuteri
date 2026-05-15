import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import type { CmsPageCategory, CmsPageListItem } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004/api";

const VALID_CATEGORIES: readonly CmsPageCategory[] = [
  "kurumsal",
  "legal",
  "yardim",
] as const;

const TITLES: Record<CmsPageCategory, { title: string; desc: string }> = {
  kurumsal: {
    title: "Kurumsal",
    desc: "i-Bijuteri hakkında daha fazla bilgi",
  },
  legal: {
    title: "Yasal Bilgiler",
    desc: "Hukuki sözleşmeler ve politikalar",
  },
  yardim: {
    title: "Yardım Merkezi",
    desc: "Sıkça sorulan sorular ve kılavuzlar",
  },
};

interface PageProps {
  params: Promise<{ category: string }>;
}

function isValidCategory(value: string): value is CmsPageCategory {
  return (VALID_CATEGORIES as readonly string[]).includes(value);
}

async function fetchPages(category: CmsPageCategory): Promise<CmsPageListItem[]> {
  try {
    const res = await fetch(
      `${API_URL}/pages-by-category/${category}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { pages?: CmsPageListItem[] };
    return json.pages ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  if (!isValidCategory(category)) {
    return { title: "Sayfa Bulunamadı" };
  }
  const info = TITLES[category];
  return { title: info.title, description: info.desc };
}

export default async function CategoryPages({ params }: PageProps) {
  const { category } = await params;
  if (!isValidCategory(category)) notFound();
  const pages = await fetchPages(category);
  const info = TITLES[category];

  return (
    <div className="min-h-screen bg-surface-bg">
      <section className="max-w-5xl mx-auto px-6 py-12">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[13px] text-charcoal-light mb-6"
        >
          <Link href="/" className="hover:text-primary-dark">
            Anasayfa
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-charcoal font-medium">{info.title}</span>
        </nav>

        <header className="mb-10 pb-6 border-b border-card-border">
          <h1 className="font-display text-[42px] font-semibold text-charcoal -tracking-[.015em] leading-tight">
            {info.title}
          </h1>
          <p className="text-charcoal-mid text-[16px] mt-3">{info.desc}</p>
        </header>

        {pages.length === 0 ? (
          <p className="text-charcoal-light text-center py-16">
            Henüz içerik yok.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pages.map((p) => (
              <Link
                key={p.id}
                href={`/sayfa/${p.slug}`}
                className="bg-white border border-card-border rounded-2xl p-6 hover:border-primary hover:-translate-y-0.5 hover:shadow-lift transition-all flex gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-light text-primary-dark grid place-items-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-[20px] font-semibold text-charcoal -tracking-[.01em] mb-1">
                    {p.title}
                  </h2>
                  {p.excerpt && (
                    <p className="text-charcoal-mid text-[13.5px] line-clamp-2">
                      {p.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
