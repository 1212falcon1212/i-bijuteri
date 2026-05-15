import type { Metadata } from 'next';
import { MarketHomeClient } from './MarketHomeClient';

export const metadata: Metadata = {
  title: 'Pazaryeri | i-Bijuteri - B2B Bijuteri Tedarik Platformu',
  description:
    "Toptan bijuteri ihtiyaçlarınızı en uygun fiyatlarla karşılayın. Binlerce ürün, doğrulanmış satıcılar ve esnek kargo ile i-Bijuteri'de.",
  openGraph: {
    title: 'i-Bijuteri - B2B Bijuteri Tedarik Platformu',
    description:
      'Toptan bijuteri ihtiyaçlarınızı en uygun fiyatlarla karşılayın. Binlerce ürün, doğrulanmış satıcılar.',
    type: 'website',
    siteName: 'i-Bijuteri',
    url: 'https://i-bijuteri.com/market',
    images: [
      {
        url: 'https://i-bijuteri.com/images/og-default.png',
        width: 1200,
        height: 630,
        alt: 'i-Bijuteri B2B Bijuteri Platformu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'i-Bijuteri - B2B Bijuteri Tedarik Platformu',
    description:
      'Toptan bijuteri ihtiyaçlarınızı en uygun fiyatlarla karşılayın.',
    images: ['https://i-bijuteri.com/images/og-default.png'],
  },
  alternates: {
    canonical: 'https://i-bijuteri.com/market',
  },
};

export default function MarketHomePage() {
  return <MarketHomeClient />;
}
