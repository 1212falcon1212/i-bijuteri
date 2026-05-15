"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cmsApi, type CmsPageListItem } from "@/lib/api";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface BijuteriFooterProps {
  description?: string;
  phone?: string;
  email?: string;
  copyrightYear?: number;
  columns?: FooterColumn[];
}

const MARKETPLACE_COLUMN: FooterColumn = {
  title: "Pazaryeri",
  links: [
    { label: "Kolyeler", href: "/market/category/kolye" },
    { label: "Yüzükler", href: "/market/category/yuzuk" },
    { label: "Küpeler", href: "/market/category/kupe" },
    { label: "Bilezikler", href: "/market/category/bilezik" },
    { label: "Saatler", href: "/market/category/saat" },
    { label: "Tüm Tedarikçiler", href: "/market/markalar" },
  ],
};

const AFTERSALES_COLUMN: FooterColumn = {
  title: "Satış Sonrası",
  links: [
    { label: "Sepetim", href: "/market/sepet" },
    { label: "Siparişlerim", href: "/market/hesabim?tab=siparislerim" },
    { label: "Kargo Takip", href: "/market/kargo-bilgi" },
    { label: "İade", href: "/sayfa/iade-politikasi" },
    { label: "Güvenli Ödeme", href: "/sayfa/odeme-bilgileri" },
  ],
};

const FALLBACK_KURUMSAL: FooterLink[] = [
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "İletişim", href: "/iletisim" },
  { label: "Blog", href: "/market/blog" },
  { label: "Gizlilik", href: "/sayfa/gizlilik-politikasi" },
  { label: "KVKK", href: "/sayfa/kvkk" },
];

const FALLBACK_YARDIM: FooterLink[] = [
  { label: "Tüm Yardım Konuları", href: "/sayfalar/yardim" },
  { label: "Nasıl Satıcı Olurum?", href: "/register" },
  { label: "Kargo Bilgileri", href: "/market/kargo-bilgi" },
  { label: "İade Süreci", href: "/sayfa/iade-politikasi" },
];

function buildColumns(groups: {
  kurumsal: FooterLink[];
  yardim: FooterLink[];
}): FooterColumn[] {
  return [
    MARKETPLACE_COLUMN,
    AFTERSALES_COLUMN,
    {
      title: "Yardım",
      links: groups.yardim.length ? groups.yardim : FALLBACK_YARDIM,
    },
    {
      title: "Kurumsal",
      links: groups.kurumsal.length ? groups.kurumsal : FALLBACK_KURUMSAL,
    },
  ];
}

const DEFAULT_COLUMNS: FooterColumn[] = buildColumns({ kurumsal: [], yardim: [] });

interface FooterPageGroups {
  kurumsal?: CmsPageListItem[];
  legal?: CmsPageListItem[];
  yardim?: CmsPageListItem[];
}

const DEFAULT_DESCRIPTION =
  "Türkiye'nin güvenilir B2B bijuteri tedarik platformu. Onaylı toptancılarla, şeffaf fiyatlama ve hızlı kargo ile vitrininize doğrudan tedarik.";

export default function BijuteriFooter({
  description = DEFAULT_DESCRIPTION,
  phone = "0 542 848 26 46",
  email = "destek@i-bijuteri.com",
  copyrightYear,
  columns,
}: BijuteriFooterProps) {
  const year = copyrightYear ?? new Date().getFullYear();
  const [dynamicColumns, setDynamicColumns] = useState<FooterColumn[] | null>(
    null
  );

  useEffect(() => {
    if (columns) return;
    let cancelled = false;

    cmsApi
      .getHomepage()
      .then((res) => {
        if (cancelled) return;
        const body = res.data as unknown as
          | { footer?: { pages?: FooterPageGroups } }
          | { data?: { footer?: { pages?: FooterPageGroups } } }
          | undefined;
        const footer =
          (body as { footer?: { pages?: FooterPageGroups } } | undefined)
            ?.footer ??
          (body as { data?: { footer?: { pages?: FooterPageGroups } } } | undefined)
            ?.data?.footer;
        const pages = footer?.pages;
        if (!pages) return;

        const toLinks = (items?: CmsPageListItem[]): FooterLink[] =>
          (items ?? []).map((p) => ({
            label: p.title,
            href: `/sayfa/${p.slug}`,
          }));

        const built = buildColumns({
          kurumsal: [
            ...toLinks(pages.kurumsal),
            ...toLinks(pages.legal),
          ],
          yardim: [
            ...toLinks(pages.yardim),
            { label: "Tüm Yardım Konuları", href: "/sayfalar/yardim" },
          ],
        });
        setDynamicColumns(built);
      })
      .catch(() => {
        // fallback columns
      });

    return () => {
      cancelled = true;
    };
  }, [columns]);

  const renderedColumns: FooterColumn[] =
    columns ?? dynamicColumns ?? DEFAULT_COLUMNS;

  return (
    <footer className="site">
      <div className="top">
        {/* About column */}
        <div className="about">
          <Link href="/" aria-label="i-bijuteri" className="inline-block mb-3">
            <img
              src="/i-bijuteri-logo.webp"
              alt="i-bijuteri"
              className="block h-10 w-auto object-contain"
              width={200}
              height={50}
            />
          </Link>
          <p>{description}</p>
        </div>

        {/* Link columns */}
        {renderedColumns.map((col) => (
          <div key={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((link) => (
                <li key={`${col.title}-${link.label}`}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bottom">
        <span>© {year} i-bijuteri · B2B Bijuteri Pazaryeri · Tüm hakları saklıdır</span>
        <span>
          {phone} · {email}
        </span>
      </div>
    </footer>
  );
}
