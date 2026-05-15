import { MetadataRoute } from 'next';

const BASE_URL = 'https://i-bijuteri.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004/api';

interface SitemapProduct {
    id: number;
    updated_at?: string;
}

interface SitemapCategory {
    slug: string;
}

interface SitemapBrand {
    slug: string;
}

interface SitemapDynamicPage {
    slug: string;
    updated_at?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${BASE_URL}/market`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/market/products`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/market/markalar`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/register`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/sayfalar/kurumsal`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/sayfalar/legal`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/sayfalar/yardim`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        },
    ];

    try {
        const [productsRes, catsRes, brandsRes, kurumsalRes, legalRes, yardimRes] = await Promise.all([
            fetch(`${API_URL}/products?per_page=1000`, { next: { revalidate: 3600 } }),
            fetch(`${API_URL}/categories`, { next: { revalidate: 3600 } }),
            fetch(`${API_URL}/brands`, { next: { revalidate: 3600 } }),
            fetch(`${API_URL}/pages-by-category/kurumsal`, { next: { revalidate: 3600 } }),
            fetch(`${API_URL}/pages-by-category/legal`, { next: { revalidate: 3600 } }),
            fetch(`${API_URL}/pages-by-category/yardim`, { next: { revalidate: 3600 } }),
        ]);

        let productPages: MetadataRoute.Sitemap = [];
        let categoryPages: MetadataRoute.Sitemap = [];
        let brandPages: MetadataRoute.Sitemap = [];
        let dynamicPagePages: MetadataRoute.Sitemap = [];

        const collectDynamicPages = async (res: Response, priority: number) => {
            if (!res.ok) return [] as MetadataRoute.Sitemap;
            const json = (await res.json()) as { pages?: SitemapDynamicPage[] };
            return (json.pages ?? []).map((p) => ({
                url: `${BASE_URL}/sayfa/${p.slug}`,
                lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
                changeFrequency: 'monthly' as const,
                priority,
            }));
        };

        dynamicPagePages = [
            ...(await collectDynamicPages(kurumsalRes, 0.5)),
            ...(await collectDynamicPages(legalRes, 0.4)),
            ...(await collectDynamicPages(yardimRes, 0.5)),
        ];

        if (productsRes.ok) {
            const productsData = await productsRes.json();
            const products: SitemapProduct[] = productsData.products || [];
            productPages = products.map((p) => ({
                url: `${BASE_URL}/market/product/${p.id}`,
                lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
                changeFrequency: 'daily' as const,
                priority: 0.8,
            }));
        }

        if (catsRes.ok) {
            const catsData = await catsRes.json();
            const categories: SitemapCategory[] = catsData.categories || catsData || [];
            categoryPages = categories.map((c) => ({
                url: `${BASE_URL}/market/category/${c.slug}`,
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }));
        }

        if (brandsRes.ok) {
            const brandsData = await brandsRes.json();
            const brands: SitemapBrand[] = brandsData.brands || brandsData || [];
            brandPages = brands.map((b) => ({
                url: `${BASE_URL}/market/marka/${b.slug}`,
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            }));
        }

        return [...staticPages, ...productPages, ...categoryPages, ...brandPages, ...dynamicPagePages];
    } catch {
        return staticPages;
    }
}
