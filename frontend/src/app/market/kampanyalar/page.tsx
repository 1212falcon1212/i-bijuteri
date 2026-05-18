'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Tag,
    ArrowLeft,
    ChevronDown,
    X,
    SlidersHorizontal
} from 'lucide-react';
import { productsApi, categoriesApi, Product, Category } from '@/lib/api';
import { ProductCard } from '@/components/market/ProductCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Extended product type for deals
interface DealProduct extends Product {
    original_price?: number;
    discount_percentage?: number;
    deal_ends_at?: string;
}

// Loading Skeleton
function LoadingSkeleton() {
    return (
        <div className="bg-white dark:bg-charcoal rounded-xl border border-black/10 dark:border-slate-700 overflow-clip">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
                {[...Array(8)].map((_, i) => (
                    <Card key={i} className="border-card-border dark:border-slate-800 overflow-hidden">
                        <CardContent className="p-0">
                            <Skeleton className="aspect-square w-full" />
                            <div className="p-4 space-y-3">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-3/4" />
                                <div className="pt-2 border-t border-card-border dark:border-slate-800">
                                    <Skeleton className="h-6 w-28" />
                                    <Skeleton className="h-4 w-20 mt-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default function KampanyalarPage() {
    const [products, setProducts] = useState<DealProduct[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedDiscount, setSelectedDiscount] = useState<string>('all');
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
                // Add mock discount data to products
                const dealsProducts = response.data.products.map((product) => ({
                    ...product,
                    discount_percentage: Math.floor(Math.random() * 40) + 10,
                    original_price: product.lowest_price ? product.lowest_price * (1 + (Math.random() * 0.5 + 0.1)) : undefined,
                    deal_ends_at: new Date(Date.now() + (Math.random() * 7 + 1) * 24 * 60 * 60 * 1000).toISOString(),
                }));

                // Filter by discount percentage if selected
                let filteredProducts = dealsProducts;
                if (selectedDiscount !== 'all') {
                    const minDiscount = parseInt(selectedDiscount);
                    filteredProducts = dealsProducts.filter(p => (p.discount_percentage || 0) >= minDiscount);
                }

                setProducts(filteredProducts);
                setTotalPages(response.data.pagination?.last_page || 1);
            }
        } catch (error) {
            console.error('Failed to load deals:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, selectedCategory, selectedDiscount]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const clearFilters = () => {
        setSelectedCategory('all');
        setSelectedDiscount('all');
        setCurrentPage(1);
    };

    const hasActiveFilters = selectedCategory !== 'all' || selectedDiscount !== 'all';

    return (
        <>
            <div className="crumbs">
                <Link href="/market" className="a">Pazaryeri</Link>
                <span className="sep">›</span>
                <span className="now">Kampanyalar</span>
            </div>

            <div className="page-head">
                <div className="l">
                    <span className="eyebrow inline-flex items-center gap-3">
                        <span className="gold-rule" /> Özel Fırsatlar
                    </span>
                    <h1>Kampanyalar.</h1>
                    <div className="sub">
                        Sezona özel toptan indirimler ve sınırlı süreli kampanyalar
                    </div>
                </div>
                <div className="r">
                    Tedarikçilerden gelen kampanyalar bu sayfada toplanır. Sınırlı süre ve
                    miktarla geçerli; kaçırmayın.
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
                                        <SelectItem value="all">Tüm Kategoriler</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.slug}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Discount Filter */}
                                <Select value={selectedDiscount} onValueChange={(value) => { setSelectedDiscount(value); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <SelectValue placeholder="İndirim Oranı" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tüm İndirimler</SelectItem>
                                        <SelectItem value="10">%10 ve üzeri</SelectItem>
                                        <SelectItem value="20">%20 ve üzeri</SelectItem>
                                        <SelectItem value="30">%30 ve üzeri</SelectItem>
                                        <SelectItem value="40">%40 ve üzeri</SelectItem>
                                        <SelectItem value="50">%50 ve üzeri</SelectItem>
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
                                {products.length} kampanyalı ürün
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
                                        <Tag className="h-10 w-10 text-[#B89968] dark:text-[#D4B896]" />
                                    </div>
                                    <h2 className="text-xl font-semibold mb-2 text-charcoal dark:text-white">
                                        Aktif kampanya bulunamadı
                                    </h2>
                                    <p className="text-charcoal-light dark:text-charcoal-light mb-4 text-center max-w-md">
                                        Seçtiğiniz filtrelere uygun kampanya bulunmuyor.
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
                                            <Button className="bg-[#B89968] hover:bg-[#8C6F3F] text-white">
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
                        >
                            <div className="bg-white dark:bg-charcoal rounded-xl border border-black/10 dark:border-slate-700 overflow-clip">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
                                    {products.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </div>
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
