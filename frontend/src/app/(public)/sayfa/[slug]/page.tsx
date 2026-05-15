import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { CmsPage } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function fetchPage(slug: string): Promise<CmsPage | null> {
  try {
    const res = await fetch(`${API_URL}/pages/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { page?: CmsPage };
    return json.page ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchPage(slug);
  if (!page) return { title: "Sayfa Bulunamadı" };
  return {
    title: page.meta_title || page.title,
    description: page.meta_description || page.excerpt,
  };
}

const CATEGORY_LABELS: Record<CmsPage["category"], string> = {
  kurumsal: "Kurumsal",
  legal: "Yasal",
  yardim: "Yardım",
};

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await fetchPage(slug);
  if (!page) notFound();

  const categoryLabel = CATEGORY_LABELS[page.category] ?? page.category;
  const lastUpdated = new Date(page.updated_at).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-surface-bg">
      <article className="max-w-3xl mx-auto px-6 py-12">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[13px] text-charcoal-light mb-6"
        >
          <Link href="/" className="hover:text-primary-dark">
            Anasayfa
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/sayfalar/${page.category}`}
            className="hover:text-primary-dark"
          >
            {categoryLabel}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-charcoal font-medium">{page.title}</span>
        </nav>

        <header className="mb-8 pb-6 border-b border-card-border">
          <h1 className="font-display text-[42px] font-semibold text-charcoal -tracking-[.015em] leading-tight">
            {page.title}
          </h1>
          {page.excerpt && (
            <p className="text-charcoal-mid text-[16px] mt-3 leading-relaxed">
              {page.excerpt}
            </p>
          )}
          <div className="text-[12px] text-charcoal-light mt-3">
            Son güncelleme: {lastUpdated}
          </div>
        </header>

        <div
          className="prose prose-charcoal max-w-none text-charcoal-mid leading-relaxed
            prose-headings:font-display prose-headings:text-charcoal prose-headings:tracking-[-.015em]
            prose-h2:text-[26px] prose-h2:mt-8 prose-h2:mb-3
            prose-h3:text-[20px] prose-h3:mt-6 prose-h3:mb-2
            prose-p:my-3 prose-p:text-[15px]
            prose-a:text-primary-dark prose-a:no-underline hover:prose-a:underline
            prose-strong:text-charcoal prose-strong:font-semibold
            prose-ul:my-3 prose-li:my-1
            prose-img:rounded-xl prose-img:border prose-img:border-card-border"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>
    </div>
  );
}
