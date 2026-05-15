import type { Metadata } from 'next';
import { serverFetch } from '@/lib/server-fetch';
import { BrandClient } from './BrandClient';

interface BrandData {
  status: string;
  data: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
  };
}

function formatSlugToName(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await serverFetch<BrandData>(`/brands/${slug}`, { revalidate: 300 });
  const brand = data?.data;

  const brandName = brand?.name || formatSlugToName(slug);
  const description =
    brand?.description || `${brandName} markali urunleri i-Bijuteri'da kesfedin`;
  const logoUrl = brand?.logo || 'https://i-bijuteri.com/images/og-default.png';

  return {
    title: `${brandName} Urunleri | i-Bijuteri`,
    description,
    openGraph: {
      title: `${brandName} Urunleri | i-Bijuteri`,
      description,
      images: [{ url: logoUrl, width: 400, height: 400, alt: brandName }],
      type: 'website',
      siteName: 'i-Bijuteri',
      url: `https://i-bijuteri.com/market/marka/${slug}`,
    },
    twitter: {
      card: 'summary',
      title: `${brandName} Urunleri | i-Bijuteri`,
      description,
    },
    alternates: {
      canonical: `https://i-bijuteri.com/market/marka/${slug}`,
    },
  };
}

export default function MarketBrandPage() {
  return <BrandClient />;
}
