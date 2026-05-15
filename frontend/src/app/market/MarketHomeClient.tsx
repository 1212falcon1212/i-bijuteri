'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  ShieldCheck,
  CreditCard,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import {
  cmsApi,
  productsApi,
  type Product,
  type CategoryItem,
  type MarketHomeContent,
  type MarketHomeSeller,
} from '@/lib/api';
import { ProductCard } from '@/components/market/ProductCard';
import { cn } from '@/lib/utils';

const HERO_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=1200&q=85&auto=format&fit=crop';
const UNSPLASH_PARAMS = 'w=900&q=85&auto=format&fit=crop';
const CATEGORY_PLACEHOLDER: Record<string, string> = {
  // En spesifik eşleşmeler önce — eşleşme `slug.includes(key)` ile yapılır
  kozmetik: `https://images.unsplash.com/photo-1596462502278-27bfdc403348?${UNSPLASH_PARAMS}`,
  makyaj: `https://images.unsplash.com/photo-1596462502278-27bfdc403348?${UNSPLASH_PARAMS}`,
  parfum: `https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?${UNSPLASH_PARAMS}`,
  toka: `https://images.unsplash.com/photo-1556228720-195a672e8a03?${UNSPLASH_PARAMS}`,
  sac: `https://images.unsplash.com/photo-1559599101-f09722fb4948?${UNSPLASH_PARAMS}`,
  canta: `https://images.unsplash.com/photo-1584917865442-de89df76afd3?${UNSPLASH_PARAMS}`,
  cuzdan: `https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?${UNSPLASH_PARAMS}`,
  kemer: `https://images.unsplash.com/photo-1624222247344-550fb60583dc?${UNSPLASH_PARAMS}`,
  celik: `https://images.unsplash.com/photo-1602173574767-37ac01994b2a?${UNSPLASH_PARAMS}`,
  gumus: `https://images.unsplash.com/photo-1602173574767-37ac01994b2a?${UNSPLASH_PARAMS}`,
  cocuk: `https://images.unsplash.com/photo-1577896851231-70ef18881754?${UNSPLASH_PARAMS}`,
  erkek: `https://images.unsplash.com/photo-1622434641406-a158123450f9?${UNSPLASH_PARAMS}`,
  gelin: `https://images.unsplash.com/photo-1606800052052-a08af7148866?${UNSPLASH_PARAMS}`,
  nisan: `https://images.unsplash.com/photo-1606800052052-a08af7148866?${UNSPLASH_PARAMS}`,
  dovme: `https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?${UNSPLASH_PARAMS}`,
  gozluk: `https://images.unsplash.com/photo-1620712943543-bcc4688e7485?${UNSPLASH_PARAMS}`,
  anahtar: `https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?${UNSPLASH_PARAMS}`,
  pirlanta: `https://images.unsplash.com/photo-1605100804763-247f67b3557e?${UNSPLASH_PARAMS}`,
  altin: `https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?${UNSPLASH_PARAMS}`,
  // Klasik takı
  kolye: `https://images.unsplash.com/photo-1611591437281-460bfbe1220a?${UNSPLASH_PARAMS}`,
  yuzuk: `https://images.unsplash.com/photo-1605100804763-247f67b3557e?${UNSPLASH_PARAMS}`,
  kupe: `https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?${UNSPLASH_PARAMS}`,
  bileklik: `https://images.unsplash.com/photo-1611652022419-a9419f74343d?${UNSPLASH_PARAMS}`,
  bilezik: `https://images.unsplash.com/photo-1611652022419-a9419f74343d?${UNSPLASH_PARAMS}`,
  saat: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?${UNSPLASH_PARAMS}`,
  set: `https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?${UNSPLASH_PARAMS}`,
  // Genel kadın/erkek/aksesuar fallback'ları en sonda
  kadin: `https://images.unsplash.com/photo-1605651531144-51381895e23d?${UNSPLASH_PARAMS}`,
  taki: `https://images.unsplash.com/photo-1605651531144-51381895e23d?${UNSPLASH_PARAMS}`,
  aksesuar: `https://images.unsplash.com/photo-1583394293214-28ded15ee548?${UNSPLASH_PARAMS}`,
};
const CATEGORY_DEFAULT_IMAGE = `https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?${UNSPLASH_PARAMS}`;
const BANNER_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1600&q=85&auto=format&fit=crop';
const CTA_SPLIT_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&q=85&auto=format&fit=crop';

const DEFAULT_CONTENT: MarketHomeContent = {
  hero: {
    eyebrow: 'İlkbahar Tedarik Sezonu · 2026',
    title_prefix: 'Pırıltıyı',
    title_em: 'toptan fiyatla',
    title_suffix: 'vitrininize taşıyın.',
    description:
      '340+ onaylı tedarikçi, 12.400+ aktif ürün. Şeffaf fiyatlandırma ve 48 saatte teslimat ile B2B bijuteri pazaryeri.',
    cta_primary: { text: 'Koleksiyonu Keşfet', url: '/market/products' },
    cta_secondary: { text: 'Tedarikçileri Gör', url: '/market/markalar' },
    trustline: ['Onaylı Tedarikçi', 'Ücretsiz Kargo', 'Şeffaf Fiyat'],
    tag: {
      label: 'Bu hafta öne çıkan',
      title: 'Damla Pırlanta Kolye',
      meta: 'Aurum · 14 Ayar',
    },
  },
  trust_strip: [
    { title: '340+ Onaylı Tedarikçi', subtitle: 'Belgeli, doğrulanmış' },
    { title: '48 Saatte Teslim', subtitle: 'Türkiye geneli' },
    { title: 'Güvenli Ödeme', subtitle: 'SSL · 3D Secure' },
    { title: 'Şeffaf Fiyatlama', subtitle: 'Açık tedarikçi profili' },
  ],
  categories_section: {
    eyebrow: 'Pazaryeri',
    title: 'Koleksiyonu keşfedin.',
    description:
      'Her kategoride farklı tedarikçilerin fiyatlarını karşılaştırın, en uygun olanı vitrininize alın.',
    link_text: 'Tüm kategorileri gör',
  },
  editorial_banner: {
    eyebrow: 'Haftanın Koleksiyonu',
    title_prefix: 'Beyaz Pırlanta —',
    title_em: 'haftanın',
    title_suffix: 'öne çıkanı.',
    description:
      'Bursa atölyelerinden 24 model. Onaylı 3 tedarikçiden anında temin, haftaya özel toptan fiyat avantajı.',
    stats: [
      { value: '24', label: 'Model' },
      { value: '3', label: 'Tedarikçi' },
      { value: '₺489+', label: 'Başlangıç' },
    ],
    cta: { text: 'Koleksiyonu Gör', url: '/market/onerilen' },
  },
  featured_products: {
    eyebrow: 'Çok Tercih Edilenler',
    title: 'Bu sezonun favorileri.',
    tab_all_label: 'Tümü',
  },
  sellers_section: {
    eyebrow: 'Onaylı Tedarikçiler',
    title: 'Vitrininize doğrudan tedarik.',
    description:
      'Belgeli, doğrulanmış atölyelerden doğrudan alın. Şeffaf değerlendirme, hızlı kargo, güvenli ödeme.',
    cta_text: 'Mağazaya git',
    items: [
      { name: 'AurumToptan', city: 'İstanbul', years: 7, products: 142, rating: 4.9, slug: 'aurum' },
      { name: 'Bursa Atölye', city: 'Bursa', years: 12, products: 287, rating: 4.8, slug: 'bursa-atolye' },
      { name: 'Zarif Mücevher', city: 'İzmir', years: 5, products: 98, rating: 4.7, slug: 'zarif' },
      { name: 'Pırıltı Bijuteri', city: 'Ankara', years: 9, products: 213, rating: 4.9, slug: 'pirilti' },
    ],
  },
  cta_split: {
    eyebrow: 'Yeni Sezon',
    title: 'Saatler · 2026 koleksiyonu.',
    description:
      'Klasik formlar, modern detaylar. 148 model 9 tedarikçiden, toptan fiyatlarla vitrinize.',
    stats: [
      { value: '148', label: 'Model' },
      { value: '9', label: 'Tedarikçi' },
      { value: '₺320+', label: 'Başlangıç' },
    ],
    cta: { text: 'Koleksiyonu İncele', url: '/market/category/saat' },
    image_url: null,
  },
};

function pickCategoryImage(slug: string, supplied?: string | null): string {
  if (supplied) return supplied;
  const normalized = slug
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');
  const key = Object.keys(CATEGORY_PLACEHOLDER).find((k) => normalized.includes(k));
  return key ? CATEGORY_PLACEHOLDER[key] : CATEGORY_DEFAULT_IMAGE;
}

const TRUST_ICONS = [
  <Check key="i1" strokeWidth={1.5} />,
  <Truck key="i2" strokeWidth={1.5} />,
  <ShieldCheck key="i3" strokeWidth={1.5} />,
  <Sparkles key="i4" strokeWidth={1.5} />,
];

const HERO_TRUST_ICONS = [
  <ShieldCheck key="t1" strokeWidth={1.5} />,
  <Truck key="t2" strokeWidth={1.5} />,
  <Sparkles key="t3" strokeWidth={1.5} />,
];

/* ────────────────────────────────────────────────────────────
   1. Hero
   ──────────────────────────────────────────────────────────── */
function HeroSection({
  heroImage,
  hero,
}: {
  heroImage?: string;
  hero: MarketHomeContent['hero'];
}) {
  return (
    <section className="v1-hero">
      <div className="copy">
        <span className="eyebrow">{hero.eyebrow}</span>
        <h1>
          {hero.title_prefix} <em>{hero.title_em}</em> {hero.title_suffix}
        </h1>
        <p>{hero.description}</p>
        <div className="ctas">
          <Link href={hero.cta_primary.url} className="btn btn-dark">
            {hero.cta_primary.text}
          </Link>
          <Link href={hero.cta_secondary.url} className="btn btn-ghost-dark">
            {hero.cta_secondary.text}
          </Link>
        </div>
        <div className="trustline">
          {hero.trustline.map((label, i) => (
            <span key={i} className="item">
              {HERO_TRUST_ICONS[i % HERO_TRUST_ICONS.length]} {label}
            </span>
          ))}
        </div>
      </div>
      <div className="photo">
        <img src={heroImage || HERO_IMAGE_FALLBACK} alt="" />
        <div className="tag">
          <div className="l">{hero.tag.label}</div>
          <div className="n">{hero.tag.title}</div>
          <div className="p">{hero.tag.meta}</div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   2. Trust strip
   ──────────────────────────────────────────────────────────── */
function TrustStrip({ items }: { items: MarketHomeContent['trust_strip'] }) {
  return (
    <section className="trust-strip">
      <div className="inner">
        {items.map((it, i) => (
          <div key={i} className="item">
            <span className="ic">{TRUST_ICONS[i % TRUST_ICONS.length]}</span>
            <div>
              <div className="t">{it.title}</div>
              <div className="s">{it.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   3. Category showcase
   ──────────────────────────────────────────────────────────── */
function CategoryShowcase({
  categories,
  copy,
}: {
  categories: CategoryItem[];
  copy: MarketHomeContent['categories_section'];
}) {
  const items = categories.slice(0, 6);
  return (
    <section className="v1-cats">
      <div className="sec-head">
        <div className="l">
          <span className="eyebrow">
            <span className="gold-rule" /> {copy.eyebrow}
          </span>
          <h2>{copy.title}</h2>
        </div>
        <div className="r">
          {copy.description}
          <br />
          <Link
            href="/market/products"
            className="inline-flex items-center gap-1.5 mt-3 font-medium text-[var(--ink)] hover:text-[var(--accent-2)] transition-colors border-b border-[var(--ink)] hover:border-[var(--accent-2)] pb-0.5"
          >
            {copy.link_text} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
      <div className="grid">
        {items.length === 0
          ? Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="cat">
                  <div className="photo bg-[var(--surface-2)] animate-pulse" />
                  <div className="info">
                    <div className="h-5 w-32 bg-[var(--line)] animate-pulse" />
                  </div>
                </div>
              ))
          : items.map((cat) => (
              <Link
                key={cat.id}
                href={`/market/category/${cat.full_slug || cat.slug}`}
                className="cat"
              >
                <div className="photo">
                  <img src={pickCategoryImage(cat.slug, cat.icon)} alt={cat.name} />
                </div>
                <div className="info">
                  <div>
                    <div className="name">{cat.name}</div>
                    <div className="stats">Tedarikçiler · Geniş seçim</div>
                  </div>
                  <span className="arrow">→</span>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   4. Dark editorial banner
   ──────────────────────────────────────────────────────────── */
function EditorialBanner({
  image,
  copy,
}: {
  image?: string;
  copy: MarketHomeContent['editorial_banner'];
}) {
  return (
    <section className="v1-banner">
      <div className="bg-img">
        <img src={image || BANNER_IMAGE_FALLBACK} alt="" />
      </div>
      <div className="inner">
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h2>
            {copy.title_prefix} <em>{copy.title_em}</em> {copy.title_suffix}
          </h2>
          <p>{copy.description}</p>
          <div className="meta-row">
            {copy.stats.map((s, i) => (
              <div key={i} className="item">
                <div className="v">{s.value}</div>
                <div className="l">{s.label}</div>
              </div>
            ))}
          </div>
          <Link href={copy.cta.url} className="btn btn-gold-outline">
            {copy.cta.text} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   5. Featured products — tabs + 4-col mp-card grid
   ──────────────────────────────────────────────────────────── */
function FeaturedProducts({
  products,
  categories,
  copy,
}: {
  products: Product[];
  categories: CategoryItem[];
  copy: MarketHomeContent['featured_products'];
}) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [filtered, setFiltered] = useState<Product[]>(products);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFiltered(products);
  }, [products]);

  const handleTab = async (slug: string) => {
    setActiveTab(slug);
    if (slug === 'all') {
      setFiltered(products);
      return;
    }
    setLoading(true);
    try {
      const res = await productsApi.getAll({ category: slug, per_page: 8, sort_by: 'popular' });
      if (res.data?.products) setFiltered(res.data.products);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { slug: 'all', name: copy.tab_all_label },
    ...categories.slice(0, 4).map((c) => ({ slug: c.full_slug || c.slug, name: c.name })),
  ];

  return (
    <section className="v1-products">
      <div className="head">
        <div className="l">
          <span className="eyebrow">
            <span className="gold-rule" /> {copy.eyebrow}
          </span>
          <h2>{copy.title}</h2>
        </div>
        <div className="tabs">
          {tabs.map((t) => (
            <button
              key={t.slug}
              onClick={() => handleTab(t.slug)}
              className={cn(activeTab === t.slug && 'active')}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>
      <div className="grid">
        {loading
          ? Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="mp-card">
                  <div className="photo bg-[var(--surface-2)] animate-pulse" />
                  <div className="body">
                    <div className="h-3 w-16 bg-[var(--line)] mb-2 animate-pulse" />
                    <div className="h-5 w-full bg-[var(--line)] mb-3 animate-pulse" />
                    <div className="h-4 w-20 bg-[var(--line)] animate-pulse" />
                  </div>
                </div>
              ))
          : filtered.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   6. Sellers spotlight
   ──────────────────────────────────────────────────────────── */
function SellersSpotlight({ copy }: { copy: MarketHomeContent['sellers_section'] }) {
  const sellers: MarketHomeSeller[] = copy.items?.length ? copy.items : DEFAULT_CONTENT.sellers_section.items;
  return (
    <section className="v1-sellers">
      <div className="head">
        <span className="eyebrow">{copy.eyebrow}</span>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
      </div>
      <div className="grid">
        {sellers.map((s, i) => (
          <Link key={`${s.slug}-${i}`} href={`/market/marka/${s.slug}`} className="seller-card">
            <div className="logo">{s.name?.[0] ?? '?'}</div>
            <div className="name">
              {s.name} <span className="verified">✓</span>
            </div>
            <div className="city">
              {[s.city, s.years ? `${s.years} yıldır üye` : null].filter(Boolean).join(' · ')}
            </div>
            <div className="stats">
              <div>
                <div className="v">{s.products ?? '—'}</div>
                <div className="l">Aktif Ürün</div>
              </div>
              <div>
                <div className="v">{s.rating ?? '—'}</div>
                <div className="l">Puan / 5</div>
              </div>
            </div>
            <span className="cta">
              {copy.cta_text} <ArrowUpRight className="w-3 h-3" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   7. CTA split
   ──────────────────────────────────────────────────────────── */
function CategorySplit({ copy }: { copy: MarketHomeContent['cta_split'] }) {
  return (
    <section className="v1-cta-split">
      <div className="photo">
        <img src={copy.image_url || CTA_SPLIT_IMAGE_FALLBACK} alt="" />
      </div>
      <div className="copy">
        <span className="eyebrow">{copy.eyebrow}</span>
        <h3>{copy.title}</h3>
        <p>{copy.description}</p>
        <div className="meta-row">
          {copy.stats.map((s, i) => (
            <div key={i}>
              <span className="v">{s.value}</span> <span className="l">{s.label}</span>
            </div>
          ))}
        </div>
        <Link href={copy.cta.url} className="btn btn-gold-outline">
          {copy.cta.text} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   Main client
   ──────────────────────────────────────────────────────────── */
export function MarketHomeClient() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [heroImage, setHeroImage] = useState<string | undefined>();
  const [bannerImage, setBannerImage] = useState<string | undefined>();
  const [content, setContent] = useState<MarketHomeContent>(DEFAULT_CONTENT);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [homepage, productsRes] = await Promise.all([
          cmsApi.getHomepage(),
          productsApi.getAll({ per_page: 8, sort_by: 'popular' }),
        ]);
        if (cancelled) return;

        if (homepage.data?.categories) setCategories(homepage.data.categories);
        if (homepage.data?.banners?.hero?.[0]) {
          setHeroImage(homepage.data.banners.hero[0].image_url || undefined);
        }
        if (homepage.data?.banners?.middle?.[0]) {
          setBannerImage(homepage.data.banners.middle[0].image_url || undefined);
        }
        if (homepage.data?.market_home) {
          setContent(homepage.data.market_home);
        }
        if (productsRes.data?.products) setProducts(productsRes.data.products);
      } catch (e) {
        console.error('Homepage data load failed:', e);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <HeroSection heroImage={heroImage} hero={content.hero} />
      <TrustStrip items={content.trust_strip} />
      <CategoryShowcase categories={categories} copy={content.categories_section} />
      <EditorialBanner image={bannerImage} copy={content.editorial_banner} />
      <FeaturedProducts
        products={products}
        categories={categories}
        copy={content.featured_products}
      />
      <SellersSpotlight copy={content.sellers_section} />
      <CategorySplit copy={content.cta_split} />
    </>
  );
}
