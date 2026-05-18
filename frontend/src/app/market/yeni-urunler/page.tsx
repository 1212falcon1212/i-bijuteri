'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Box,
    ArrowLeft,
    ChevronDown,
    X,
    SlidersHorizontal,
    Calendar
} from 'lucide-react';
import { productsApi, categoriesApi, Product, Category } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Extended product type for new products
interface NewProduct extends Product {
    added_at?: string;
    days_since_added?: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const REFERENCE_NOW = Date.UTC(2026, 4, 18);

function stableDaysAgo(seed: number): number {
    return Math.abs(seed * 1103515245 + 12345) % 30;
}

// Helper function to format date
function formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    return `${Math.floor(diffDays / 30)} ay önce`;
}

// New Product Card Component - Horizontal Layout
function NewProductCard({ product, index }: { product: NewProduct; index: number }) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(price);
    };

    const productSeed = Number(product.id) || index + 1;
    const addedAt = product.added_at || new Date(REFERENCE_NOW - stableDaysAgo(productSeed) * MS_PER_DAY).toISOString();
    const daysSinceAdded = product.days_since_added ?? Math.floor((REFERENCE_NOW - new Date(addedAt).getTime()) / MS_PER_DAY);
    const isVeryNew = daysSinceAdded <= 3;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
        >
            <Link href={`/market/product/${product.id}`}>
                <Card className="group relative border-card-border dark:border-slate-800 hover:shadow-md dark:hover:shadow-[#B89968]/10 transition-all duration-300 cursor-pointer overflow-hidden h-full rounded-2xl">
                    <CardContent className="p-0">
                        <div className="flex flex-row">
                            {/* Left: Info */}
                            <div className="flex-1 min-w-0 p-4 flex flex-col justify-center gap-1.5">
                                {/* Brand */}
                                {product.brand && (
                                    <p className="text-[11px] font-bold text-[#B89968] dark:text-[#D4B896] uppercase tracking-wider">
                                        {product.brand}
                                    </p>
                                )}

                                {/* Name */}
                                <h3 className="font-semibold text-sm text-charcoal dark:text-white group-hover:text-[#B89968] dark:group-hover:text-[#D4B896] line-clamp-2 transition-colors">
                                    {product.name}
                                </h3>

                                {/* Date Badge */}
                                <div className="flex items-center gap-1.5 text-[11px] text-charcoal-light dark:text-charcoal-light">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatRelativeDate(addedAt)}</span>
                                </div>

                                {/* Price */}
                                <div className="mt-1">
                                    {product.lowest_price ? (
                                        <p className="text-lg font-black text-[#B89968] dark:text-[#D4B896]">
                                            {formatPrice(product.lowest_price)}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-charcoal-light dark:text-charcoal-light">
                                            Fiyat için tıklayın
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Right: Image */}
                            <div className="relative w-[140px] sm:w-[160px] flex-shrink-0 bg-[#faf8f6] dark:bg-charcoal flex items-center justify-center overflow-hidden">
                                {(product.image_url || product.image) ? (
                                    <img
                                        src={product.image_url || product.image}
                                        alt={product.name}
                                        className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <Box className="w-12 h-12 text-charcoal-light dark:text-charcoal-mid" />
                                )}

                                {/* New Badge */}
                                <div className="absolute top-2 right-2 z-10">
                                    <Badge className={`border-0 shadow-lg font-bold text-[10px] px-1.5 py-0.5 ${
                                        isVeryNew
                                            ? 'bg-gradient-to-r from-[#B89968] to-[#D4B896] text-white shadow-[#B89968]/30'
                                            : 'bg-gradient-to-r from-[#C9A961] to-[#D4B896] text-white shadow-[#C9A961]/30'
                                    }`}>
                                        <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                                        Yeni!
                                    </Badge>
                                </div>

                                {/* Gradient overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-l from-[#B89968]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
}

// Loading Skeleton
function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-[120px] rounded-2xl" />
            ))}
        </div>
    );
}

// Time Period Options
const TIME_PERIODS = [
    { value: 'all', label: 'Tum Yeni Ürünler' },
    { value: '7', label: 'Son 7 gun' },
    { value: '14', label: 'Son 14 gun' },
    { value: '30', label: 'Son 30 gun' },
];

export default function YeniUrunlerPage() {
    const [products, setProducts] = useState<NewProduct[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await categoriesApi.getAll();
                if (response.data?.categories) {
                    setCategories(response.data.categories);
                }
            } catch (error) {
                console.error('Failed to load categories:', error);
            }
        };
        loadCategories();
    }, []);

    // Load products
    const loadProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: { page?: number; per_page?: number; category?: string } = {
                page: currentPage,
                per_page: 12,
            };

            if (selectedCategory !== 'all') {
                params.category = selectedCategory;
            }

            const response = await productsApi.getAll(params);

            if (response.data) {
                // Add mock added_at dates and sort by newest
                const newProducts: NewProduct[] = response.data.products.map((product) => {
                    const daysAgo = Math.floor(Math.random() * 30);
                    return {
                        ...product,
                        added_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
                        days_since_added: daysAgo,
                    };
                });

                // Sort by newest first
                newProducts.sort((a, b) => (a.days_since_added || 0) - (b.days_since_added || 0));

                // Filter by time period if selected
                let filteredProducts = newProducts;
                if (selectedPeriod !== 'all') {
                    const maxDays = parseInt(selectedPeriod);
                    filteredProducts = newProducts.filter(p => (p.days_since_added || 0) <= maxDays);
                }

                setProducts(filteredProducts);
                setTotalPages(response.data.pagination?.last_page || 1);
            }
        } catch (error) {
            console.error('Failed to load new products:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, selectedCategory, selectedPeriod]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const clearFilters = () => {
        setSelectedCategory('all');
        setSelectedPeriod('all');
        setCurrentPage(1);
    };

    const hasActiveFilters = selectedCategory !== 'all' || selectedPeriod !== 'all';

    // Stats
    const veryNewCount = products.filter(p => (p.days_since_added || 0) <= 3).length;
    const thisWeekCount = products.filter(p => (p.days_since_added || 0) <= 7).length;

    return (
        <>
            <div className="crumbs">
                <Link href="/market" className="a">Pazaryeri</Link>
                <span className="sep">›</span>
                <span className="now">Yeni Ürünler</span>
            </div>

            <div className="page-head">
                <div className="l">
                    <span className="eyebrow inline-flex items-center gap-3">
                        <span className="gold-rule" /> Pazaryeri · Yeni
                    </span>
                    <h1>Yeni eklenenler.</h1>
                    <div className="sub">
                        <b>{products.length}</b> ürün · Son 3 günde <b>{veryNewCount}</b>, bu hafta <b>{thisWeekCount}</b>
                    </div>
                </div>
                <div className="r">
                    Pazaryerine en son eklenen ürünler ve yeni tedarikçi koleksiyonları. Sürekli
                    güncellenir.
                </div>
            </div>

            <div className="max-w-[1320px] mx-auto px-8 pb-16">

                {/* Filters Bar */}
                <div className="bg-white dark:bg-charcoal rounded-lg border border-card-border dark:border-slate-800 p-4 mb-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 md:hidden"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filtrele
                                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </Button>

                            <div className={`flex flex-col md:flex-row gap-3 ${showFilters ? 'flex' : 'hidden md:flex'} w-full md:w-auto`}>
                                {/* Category Filter */}
                                <Select value={selectedCategory} onValueChange={(value) => { setSelectedCategory(value); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <SelectValue placeholder="Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tum Kategoriler</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.slug}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Time Period Filter */}
                                <Select value={selectedPeriod} onValueChange={(value) => { setSelectedPeriod(value); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <SelectValue placeholder="Zaman Aralığı" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIME_PERIODS.map((period) => (
                                            <SelectItem key={period.value} value={period.value}>
                                                {period.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Active Filters & Results Count */}
                        <div className="flex items-center gap-3">
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-charcoal-light hover:text-red-500"
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Filtreleri Temizle
                                </Button>
                            )}
                            <span className="text-sm text-charcoal-light dark:text-charcoal-light">
                                {products.length} yeni ürün
                            </span>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <LoadingSkeleton />
                    ) : products.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Card className="border-card-border dark:border-slate-800">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <div className="w-20 h-20 rounded-full bg-[#F1E6D0] dark:bg-[#8C6F3F]/30 flex items-center justify-center mb-4">
                                        <Sparkles className="h-10 w-10 text-[#B89968] dark:text-[#D4B896]" />
                                    </div>
                                    <h2 className="text-xl font-semibold mb-2 text-charcoal dark:text-white">
                                        Yeni ürün bulunamadı
                                    </h2>
                                    <p className="text-charcoal-light dark:text-charcoal-light mb-4 text-center max-w-md">
                                        Sectiginiz filtrelere uygun yeni ürün bulunmuyor.
                                        Filtreleri değiştirmeyi veya daha sonra tekrar kontrol etmeyi deneyin.
                                    </p>
                                    <div className="flex gap-3">
                                        {hasActiveFilters && (
                                            <Button variant="outline" onClick={clearFilters}>
                                                <X className="w-4 h-4 mr-2" />
                                                Filtreleri Temizle
                                            </Button>
                                        )}
                                        <Link href="/market">
                                            <Button className="bg-[#B89968] hover:bg-[#8C6F3F]">
                                                <ArrowLeft className="w-4 h-4 mr-2" />
                                                Pazaryerine Dön
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                        >
                            {products.map((product, index) => (
                                <NewProductCard key={product.id} product={product} index={index} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center gap-2 pt-8"
                    >
                        <Button
                            variant="outline"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                            className="border-card-border dark:border-slate-700"
                        >
                            Önceki
                        </Button>
                        <span className="flex items-center px-4 text-charcoal-mid dark:text-charcoal-light font-medium">
                            {currentPage} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                            className="border-card-border dark:border-slate-700"
                        >
                            Sonraki
                        </Button>
                    </motion.div>
                )}
            </div>
        </>
    );
}
