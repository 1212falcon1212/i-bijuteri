'use client';

import { useEffect, useState, useCallback, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { productsApi, Product, Category, api } from '@/lib/api';
import { ProductCard } from '@/components/market/ProductCard';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { ArrowLeft, Box, Filter, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const formatSlugToName = (slug: string): string =>
    slug
        .replace(/-/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

interface Filters {
    brand: string;
    minPrice: string;
    maxPrice: string;
    sortBy: string;
}

interface Subcategory {
    id: number;
    name: string;
    slug: string;
    full_slug?: string;
    products_count?: number;
}

interface BreadcrumbItem {
    id: number;
    name: string;
    slug: string;
    full_slug?: string;
}

interface CategoryInfo extends Category {
    full_slug?: string;
    parent?: {
        id: number;
        name: string;
        slug: string;
        full_slug?: string;
    };
}

const SORT_OPTIONS: { value: string; label: string }[] = [
    { value: 'offers_count', label: 'Önerilenler' },
    { value: 'price_asc', label: 'Fiyat (Artan)' },
    { value: 'price_desc', label: 'Fiyat (Azalan)' },
    { value: 'newest', label: 'Yeni Eklenenler' },
    { value: 'name', label: 'En Çok Satanlar' },
];

const MATERIAL_CHIPS = ['14 Ayar', '18 Ayar', '22 Ayar', '925 Gümüş', 'Çelik', 'Pirinç'];

type StockKey = 'in' | 'low' | 'all';
const STOCK_OPTIONS: { key: StockKey; label: string }[] = [
    { key: 'in', label: 'Stokta Olanlar' },
    { key: 'low', label: 'Stoğu Az Olanlar' },
    { key: 'all', label: 'Tümünü Göster' },
];

const INITIAL_BRAND_LIMIT = 5;

function MarketCategoryContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const slugArray = Array.isArray(params.slug) ? params.slug : [params.slug];
    const fullSlug = slugArray.join('/');
    const lastSlug = slugArray[slugArray.length - 1];

    const [categoryInfo, setCategoryInfo] = useState<CategoryInfo | null>(null);
    const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [availableBrands, setAvailableBrands] = useState<string[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalProducts, setTotalProducts] = useState(0);
    const filtersRef = useRef(0);

    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showAllBrands, setShowAllBrands] = useState(false);
    const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
    const [stockFilter, setStockFilter] = useState<StockKey>('all');

    const initialBrands = (searchParams.get('brand') || '')
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean);

    const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrands);

    const [filters, setFilters] = useState<Filters>({
        brand: searchParams.get('brand') || '',
        minPrice: searchParams.get('min_price') || '',
        maxPrice: searchParams.get('max_price') || '',
        sortBy: searchParams.get('sort_by') || 'offers_count',
    });

    const [priceDraft, setPriceDraft] = useState({
        min: filters.minPrice,
        max: filters.maxPrice,
    });

    const categoryName = categoryInfo?.name || formatSlugToName(lastSlug || '');

    const loadCategoryInfo = useCallback(async () => {
        try {
            const res = await api.get<{
                category?: CategoryInfo & { children?: Subcategory[] };
                breadcrumb?: BreadcrumbItem[];
            }>(`/categories/slug/${fullSlug}`);
            if (res.data) {
                if (res.data.category) setCategoryInfo(res.data.category);
                if (res.data.breadcrumb) setBreadcrumb(res.data.breadcrumb);
                if (res.data.category?.children) setSubcategories(res.data.category.children);
            }
        } catch (err) {
            console.error('Failed to load category:', err);
        }
    }, [fullSlug]);

    const loadProducts = useCallback(
        async (page: number, append: boolean) => {
            const requestId = ++filtersRef.current;
            if (append) setIsLoadingMore(true);
            else setIsLoading(true);
            try {
                const response = await productsApi.getAll({
                    category: lastSlug,
                    page,
                    per_page: 12,
                    brand: filters.brand || undefined,
                    min_price: filters.minPrice || undefined,
                    max_price: filters.maxPrice || undefined,
                    sort_by: filters.sortBy,
                });
                if (filtersRef.current !== requestId) return;
                if (response.data) {
                    const newProducts = response.data.products;
                    setProducts((prev) => (append ? [...prev, ...newProducts] : newProducts));
                    setTotalProducts(response.data.pagination?.total || 0);
                    setHasMore(page < (response.data.pagination?.last_page || 1));

                    if (response.data.filters) {
                        if (response.data.filters.brands) {
                            setAvailableBrands(response.data.filters.brands);
                        }
                        if (response.data.filters.subcategories && subcategories.length === 0) {
                            setSubcategories(response.data.filters.subcategories);
                        }
                        if (response.data.filters.category && !categoryInfo) {
                            setCategoryInfo(response.data.filters.category);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to load products:', err);
            } finally {
                if (filtersRef.current === requestId) {
                    setIsLoading(false);
                    setIsLoadingMore(false);
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [lastSlug, filters],
    );

    useEffect(() => {
        loadCategoryInfo();
    }, [loadCategoryInfo]);

    useEffect(() => {
        setProducts([]);
        setCurrentPage(1);
        setHasMore(true);
        loadProducts(1, false);
    }, [loadProducts]);

    const handleLoadMore = useCallback(() => {
        const next = currentPage + 1;
        setCurrentPage(next);
        loadProducts(next, true);
    }, [currentPage, loadProducts]);

    const { sentinelRef } = useInfiniteScroll({
        hasMore,
        isLoading: isLoading || isLoadingMore,
        onLoadMore: handleLoadMore,
    });

    const applyFilters = (next: Filters) => {
        setFilters(next);
        const usp = new URLSearchParams();
        if (next.brand) usp.set('brand', next.brand);
        if (next.minPrice) usp.set('min_price', next.minPrice);
        if (next.maxPrice) usp.set('max_price', next.maxPrice);
        if (next.sortBy && next.sortBy !== 'offers_count') usp.set('sort_by', next.sortBy);
        const qs = usp.toString();
        router.push(`/market/category/${fullSlug}${qs ? `?${qs}` : ''}`, { scroll: false });
        setMobileFilterOpen(false);
    };

    const handleSortChange = (sortBy: string) => applyFilters({ ...filters, sortBy });

    const handleBrandToggle = (brand: string, checked: boolean) => {
        const nextBrands = checked
            ? [...selectedBrands, brand]
            : selectedBrands.filter((b) => b !== brand);
        setSelectedBrands(nextBrands);
        applyFilters({ ...filters, brand: nextBrands.join(',') });
    };

    const handleMaterialToggle = (material: string) => {
        setSelectedMaterials((prev) =>
            prev.includes(material) ? prev.filter((m) => m !== material) : [...prev, material],
        );
    };

    const handlePriceApply = () => {
        applyFilters({ ...filters, minPrice: priceDraft.min, maxPrice: priceDraft.max });
    };

    const clearFilters = () => {
        setSelectedBrands([]);
        setSelectedMaterials([]);
        setStockFilter('all');
        setPriceDraft({ min: '', max: '' });
        applyFilters({ brand: '', minPrice: '', maxPrice: '', sortBy: 'offers_count' });
    };

    const activeFilters: { key: string; label: string; onRemove: () => void }[] = [];
    selectedBrands.forEach((b) =>
        activeFilters.push({
            key: `brand-${b}`,
            label: b,
            onRemove: () => handleBrandToggle(b, false),
        }),
    );
    if (filters.minPrice || filters.maxPrice) {
        activeFilters.push({
            key: 'price',
            label: `₺${filters.minPrice || 0} – ₺${filters.maxPrice || '∞'}`,
            onRemove: () => {
                setPriceDraft({ min: '', max: '' });
                applyFilters({ ...filters, minPrice: '', maxPrice: '' });
            },
        });
    }
    selectedMaterials.forEach((m) =>
        activeFilters.push({
            key: `material-${m}`,
            label: m,
            onRemove: () => handleMaterialToggle(m),
        }),
    );

    const visibleProducts = useMemo(() => {
        if (stockFilter === 'all') return products;
        return products.filter((p) => {
            const oc = typeof p.offers_count === 'number' ? p.offers_count : Number(p.offers_count) || 0;
            if (stockFilter === 'in') return oc > 0;
            if (stockFilter === 'low') return oc > 0 && oc <= 2;
            return true;
        });
    }, [products, stockFilter]);

    const hasActiveFilters = activeFilters.length > 0 || filters.sortBy !== 'offers_count' || stockFilter !== 'all';

    const getSubcategoryLink = (sub: Subcategory) =>
        sub.full_slug
            ? `/market/category/${sub.full_slug}`
            : `/market/category/${fullSlug}/${sub.slug}`;

    const visibleBrands = showAllBrands ? availableBrands : availableBrands.slice(0, INITIAL_BRAND_LIMIT);

    const FilterSidebar = () => (
        <aside className="filters">
            <div className="head">
                <span className="l">
                    <SlidersHorizontal className="w-3.5 h-3.5 inline-block mr-2 align-middle" />
                    Filtreler
                </span>
                {hasActiveFilters && (
                    <button type="button" className="clear" onClick={clearFilters}>
                        Temizle
                    </button>
                )}
            </div>

            <div className="f-block">
                <div className="label">Sıralama</div>
                <select
                    className="sel"
                    value={filters.sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                >
                    {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            </div>

            {subcategories.length > 0 && (
                <div className="f-block">
                    <div className="label">Alt Kategoriler</div>
                    <ul className="sub-list">
                        {subcategories.map((sub) => {
                            const isActive = sub.slug === lastSlug;
                            return (
                                <li key={sub.id}>
                                    <Link href={getSubcategoryLink(sub)} className={cn(isActive && 'active')}>
                                        <span>{sub.name}</span>
                                        {typeof sub.products_count === 'number' && (
                                            <span className="count">{sub.products_count}</span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            <div className="f-block">
                <div className="label">Materyal</div>
                <div className="chip-row">
                    {MATERIAL_CHIPS.map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => handleMaterialToggle(m)}
                            className={cn('chip', selectedMaterials.includes(m) && 'active')}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            {availableBrands.length > 0 && (
                <div className="f-block">
                    <div className="label">Marka / Tedarikçi</div>
                    <div className="check-list">
                        {visibleBrands.map((brand) => {
                            const checked = selectedBrands.includes(brand);
                            return (
                                <label key={brand}>
                                    <span className="l">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={(e) => handleBrandToggle(brand, e.target.checked)}
                                        />
                                        <span>{brand}</span>
                                    </span>
                                </label>
                            );
                        })}
                        {availableBrands.length > INITIAL_BRAND_LIMIT && (
                            <button
                                type="button"
                                onClick={() => setShowAllBrands((s) => !s)}
                                className="text-[11.5px] text-[var(--accent-2)] hover:text-[var(--ink)] mt-2 inline-block text-left"
                            >
                                {showAllBrands
                                    ? 'Daha az göster'
                                    : `+ ${availableBrands.length - INITIAL_BRAND_LIMIT} tedarikçi daha`}
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="f-block">
                <div className="label">Fiyat Aralığı</div>
                <div className="price-row">
                    <input
                        type="number"
                        min={0}
                        placeholder="Min"
                        value={priceDraft.min}
                        onChange={(e) => setPriceDraft({ ...priceDraft, min: e.target.value })}
                    />
                    <span className="dash">—</span>
                    <input
                        type="number"
                        min={0}
                        placeholder="Max"
                        value={priceDraft.max}
                        onChange={(e) => setPriceDraft({ ...priceDraft, max: e.target.value })}
                    />
                </div>
                <button type="button" onClick={handlePriceApply} className="price-apply">
                    Uygula
                </button>
            </div>

            <div className="f-block">
                <div className="label">Stok Durumu</div>
                <div className="check-list">
                    {STOCK_OPTIONS.map((opt) => (
                        <label key={opt.key}>
                            <span className="l">
                                <input
                                    type="checkbox"
                                    checked={stockFilter === opt.key}
                                    onChange={(e) => {
                                        if (e.target.checked) setStockFilter(opt.key);
                                    }}
                                />
                                <span>{opt.label}</span>
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </aside>
    );

    const totalPages = totalProducts > 0 ? Math.ceil(totalProducts / 12) : 1;

    return (
        <>
            {/* Breadcrumb */}
            <div className="crumbs">
                <Link href="/market" className="a">
                    Pazaryeri
                </Link>
                {breadcrumb.length > 0
                    ? breadcrumb.map((item, idx) => {
                          const isLast = idx === breadcrumb.length - 1;
                          return (
                              <span key={item.id} className="flex items-center gap-2.5">
                                  <span className="sep">›</span>
                                  {isLast ? (
                                      <span className="now">{item.name}</span>
                                  ) : (
                                      <Link href={`/market/category/${item.full_slug || item.slug}`} className="a">
                                          {item.name}
                                      </Link>
                                  )}
                              </span>
                          );
                      })
                    : slugArray.map((slug, idx) => {
                          const isLast = idx === slugArray.length - 1;
                          return (
                              <span key={idx} className="flex items-center gap-2.5">
                                  <span className="sep">›</span>
                                  {isLast ? (
                                      <span className="now">
                                          {categoryInfo?.name || formatSlugToName(slug || '')}
                                      </span>
                                  ) : (
                                      <Link
                                          href={`/market/category/${slugArray.slice(0, idx + 1).join('/')}`}
                                          className="a"
                                      >
                                          {formatSlugToName(slug || '')}
                                      </Link>
                                  )}
                              </span>
                          );
                      })}
            </div>

            {/* Page Head */}
            <div className="page-head">
                <div className="l">
                    <div className="eyebrow">
                        <span className="gold-rule" /> Kategori · {categoryName}
                    </div>
                    <h1>{categoryName}.</h1>
                    <div className="sub">
                        <b>{totalProducts}</b> model{availableBrands.length > 0 && (
                            <>
                                {' · '}
                                <b>{availableBrands.length}</b> tedarikçi
                            </>
                        )}
                    </div>
                </div>
                {categoryInfo?.description && (
                    <div className="r">{categoryInfo.description}</div>
                )}
            </div>

            <div className="cat-layout">
                <div className="hidden lg:block">
                    <FilterSidebar />
                </div>

                <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                    <SheetTrigger asChild>
                        <button
                            type="button"
                            className="lg:hidden fixed bottom-6 left-6 z-40 inline-flex items-center gap-2 px-5 py-3 bg-[var(--ink)] text-[var(--bg)] text-[11px] font-semibold uppercase tracking-[.18em]"
                            aria-label="Filtreleri aç"
                        >
                            <Filter className="w-4 h-4" />
                            Filtrele
                            {activeFilters.length > 0 && (
                                <span className="inline-flex items-center justify-center w-5 h-5 bg-[var(--accent)] text-[var(--ink)] text-[10px] font-bold">
                                    {activeFilters.length}
                                </span>
                            )}
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[320px] sm:w-[360px] bg-[var(--bg)] p-0 overflow-y-auto border-r border-[var(--line)]">
                        <SheetHeader className="px-5 py-4 border-b border-[var(--line)]">
                            <SheetTitle className="text-[var(--ink)] font-display italic text-[22px]">
                                Filtreler
                            </SheetTitle>
                        </SheetHeader>
                        <div className="p-4">
                            <FilterSidebar />
                        </div>
                    </SheetContent>
                </Sheet>

                <div className="min-w-0">
                    {/* Results bar */}
                    <div className="results-bar">
                        <div className="left">
                            <span className="count">
                                <b>{totalProducts}</b> ürün
                            </span>
                            {activeFilters.map((f) => (
                                <span key={f.key} className="filter-chip">
                                    {f.label}
                                    <span className="x" onClick={f.onRemove}>
                                        ×
                                    </span>
                                </span>
                            ))}
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-[11px] text-[var(--accent-2)] uppercase tracking-[.12em] hover:text-[var(--ink)]"
                                >
                                    Hepsini Temizle
                                </button>
                            )}
                        </div>
                        <div className="right">
                            <div className="sort-wrap">
                                <label className="hidden sm:inline">Sırala</label>
                                <select
                                    className="sort-sel"
                                    value={filters.sortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                >
                                    {SORT_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="view-toggle hidden sm:inline-flex">
                                <button
                                    type="button"
                                    aria-label="Izgara"
                                    onClick={() => setViewMode('grid')}
                                    className={cn(viewMode === 'grid' && 'active')}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Liste"
                                    onClick={() => setViewMode('list')}
                                    className={cn(viewMode === 'list' && 'active')}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Products */}
                    {isLoading ? (
                        <div className="products-grid">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="mp-card">
                                    <div className="photo bg-[var(--surface-2)] animate-pulse" />
                                    <div className="body">
                                        <div className="h-3 w-16 bg-[var(--line)] mb-2 animate-pulse" />
                                        <div className="h-5 w-full bg-[var(--line)] mb-3 animate-pulse" />
                                        <div className="h-4 w-20 bg-[var(--line)] animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : visibleProducts.length === 0 ? (
                        <div className="border border-[var(--line)] py-16 px-6 text-center bg-[var(--bg)]">
                            <Box className="h-12 w-12 text-[var(--ink-3)] mx-auto mb-4" />
                            <h2 className="font-display italic text-[22px] text-[var(--ink)] mb-2">
                                {hasActiveFilters
                                    ? 'Filtrelere uygun ürün bulunamadı'
                                    : 'Bu kategoride ürün yok'}
                            </h2>
                            <p className="text-[var(--ink-2)] mb-6 text-[14px]">
                                {hasActiveFilters
                                    ? 'Filtreleri değiştirerek tekrar deneyebilirsiniz.'
                                    : 'Başka kategorilere göz atabilirsiniz.'}
                            </p>
                            {hasActiveFilters ? (
                                <button onClick={clearFilters} className="btn btn-dark">
                                    <X className="w-4 h-4" /> Filtreleri Temizle
                                </button>
                            ) : (
                                <Link href="/market" className="btn btn-dark">
                                    <ArrowLeft className="w-4 h-4" /> Pazaryerine Dön
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div
                            className={cn(
                                viewMode === 'grid'
                                    ? 'products-grid'
                                    : 'flex flex-col gap-4',
                            )}
                        >
                            {visibleProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    )}

                    {/* Infinite scroll sentinel */}
                    {!isLoading && visibleProducts.length > 0 && (
                        <div className="text-center py-10 text-[var(--ink-3)] text-[12px]">
                            {isLoadingMore && (
                                <div className="flex justify-center items-center gap-3">
                                    <div className="h-4 w-4 animate-spin border border-[var(--accent)] border-t-transparent rounded-full" />
                                    <span>Daha fazla ürün yükleniyor…</span>
                                </div>
                            )}
                            {hasMore && !isLoadingMore && <div ref={sentinelRef} className="h-1" />}
                            {!hasMore && (
                                <p>
                                    Tüm ürünler görüntülendi ({visibleProducts.length} / {totalProducts})
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export function CategoryClient() {
    return (
        <Suspense
            fallback={
                <div className="max-w-[1320px] mx-auto px-8 py-12">
                    <div className="h-4 w-48 bg-[var(--line)] mb-8 animate-pulse" />
                    <div className="h-12 w-64 bg-[var(--line)] mb-12 animate-pulse" />
                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-9">
                        <div className="h-[500px] bg-[var(--surface-2)] animate-pulse" />
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-[340px] bg-[var(--surface-2)] animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>
            }
        >
            <MarketCategoryContent />
        </Suspense>
    );
}
