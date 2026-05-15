'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Building2, Box, ArrowRight, Filter, Grid3X3, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo_url?: string | null;
    description?: string | null;
    products_count?: number;
}

function BrandLogo({ brand, size = 'md' }: { brand: Brand; size?: 'sm' | 'md' }) {
    const [imgError, setImgError] = useState(false);
    const handleError = useCallback(() => setImgError(true), []);

    const isSm = size === 'sm';
    const wrapperClass = isSm
        ? 'w-12 h-12 rounded-lg flex-shrink-0'
        : 'w-16 h-16 mb-3 rounded-xl';

    if (brand.logo_url && !imgError) {
        return (
            <div className={`${wrapperClass} overflow-hidden bg-surface-bg flex items-center justify-center`}>
                <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain"
                    onError={handleError}
                />
            </div>
        );
    }

    return (
        <div className={`${wrapperClass} bg-gradient-to-br from-[#F1E6D0] to-[#F1E6D0] flex items-center justify-center`}>
            <span className={`font-bold text-[#B89968] ${isSm ? 'text-lg' : 'text-2xl'}`}>
                {brand.name.charAt(0)}
            </span>
        </div>
    );
}

const FALLBACK_BRANDS: Brand[] = [
    { id: 1, name: 'Abdi Ibrahim', slug: 'abdi-ibrahim', products_count: 245 },
    { id: 2, name: 'Bayer', slug: 'bayer', products_count: 189 },
    { id: 3, name: 'Pfizer', slug: 'pfizer', products_count: 156 },
    { id: 4, name: 'Novartis', slug: 'novartis', products_count: 134 },
    { id: 5, name: 'Sanofi', slug: 'sanofi', products_count: 198 },
    { id: 6, name: 'Roche', slug: 'roche', products_count: 87 },
    { id: 7, name: 'GSK', slug: 'gsk', products_count: 112 },
    { id: 8, name: 'AstraZeneca', slug: 'astrazeneca', products_count: 95 },
    { id: 9, name: 'Johnson & Johnson', slug: 'johnson-johnson', products_count: 167 },
    { id: 10, name: 'Merck', slug: 'merck', products_count: 78 },
    { id: 11, name: 'Eczacibasi', slug: 'eczacibasi', products_count: 234 },
    { id: 12, name: 'Bioderma', slug: 'bioderma', products_count: 89 },
    { id: 13, name: 'La Roche-Posay', slug: 'la-roche-posay', products_count: 76 },
    { id: 14, name: 'Vichy', slug: 'vichy', products_count: 65 },
    { id: 15, name: 'Avene', slug: 'avene', products_count: 54 },
    { id: 16, name: 'Mustela', slug: 'mustela', products_count: 43 },
    { id: 17, name: 'Bepanthen', slug: 'bepanthen', products_count: 32 },
    { id: 18, name: 'Eucerin', slug: 'eucerin', products_count: 67 },
    { id: 19, name: 'CeraVe', slug: 'cerave', products_count: 45 },
    { id: 20, name: 'Neutrogena', slug: 'neutrogena', products_count: 78 },
];

const ALPHABET = 'ABCDEFGHIJKLMNOPRSTUVYZ'.split('');

export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        const loadBrands = async () => {
            try {
                const response = await api.get<{ data: Brand[] } | Brand[]>('/brands');
                if (response.data) {
                    const brandsData = Array.isArray(response.data) ? response.data : response.data.data || [];
                    setBrands(brandsData.length > 0 ? brandsData : FALLBACK_BRANDS);
                    setFilteredBrands(brandsData.length > 0 ? brandsData : FALLBACK_BRANDS);
                }
            } catch {
                setBrands(FALLBACK_BRANDS);
                setFilteredBrands(FALLBACK_BRANDS);
            } finally {
                setIsLoading(false);
            }
        };
        loadBrands();
    }, []);

    useEffect(() => {
        let result = brands;

        if (searchQuery) {
            result = result.filter(brand =>
                brand.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedLetter) {
            result = result.filter(brand =>
                brand.name.toUpperCase().startsWith(selectedLetter)
            );
        }

        setFilteredBrands(result);
    }, [searchQuery, selectedLetter, brands]);

    const groupedBrands = filteredBrands.reduce((acc, brand) => {
        const letter = brand.name.charAt(0).toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(brand);
        return acc;
    }, {} as Record<string, Brand[]>);

    const sortedLetters = Object.keys(groupedBrands).sort();

    return (
        <>
            <div className="crumbs">
                <Link href="/market" className="a">Pazaryeri</Link>
                <span className="sep">›</span>
                <span className="now">Tedarikçiler</span>
            </div>

            <div className="page-head">
                <div className="l">
                    <span className="eyebrow inline-flex items-center gap-3">
                        <span className="gold-rule" /> Pazaryeri
                    </span>
                    <h1>Tüm Tedarikçiler.</h1>
                    <div className="sub">
                        <b>{brands.length}+</b> onaylı tedarikçi · Atölyeden vitrine
                    </div>
                </div>
                <div className="r">
                    <div className="search-min w-full">
                        <Search className="w-4 h-4 text-[var(--ink-2)]" />
                        <Input
                            type="search"
                            placeholder="Tedarikçi ara…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 border-0 outline-0 bg-transparent text-[13px] text-[var(--ink)] focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 shadow-none"
                        />
                    </div>
                </div>
            </div>

            {/* Alphabet Filter */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-card-border shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1">
                            <button
                                onClick={() => setSelectedLetter(null)}
                                className={cn(
                                    "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex-shrink-0",
                                    selectedLetter === null
                                        ? "bg-[#F1E6D0] text-white"
                                        : "text-charcoal-mid hover:bg-surface-bg"
                                )}
                            >
                                Tumu
                            </button>
                            {ALPHABET.map(letter => (
                                <button
                                    key={letter}
                                    onClick={() => setSelectedLetter(letter)}
                                    className={cn(
                                        "w-8 h-8 text-sm font-medium rounded-lg transition-colors flex-shrink-0",
                                        selectedLetter === letter
                                            ? "bg-[#F1E6D0] text-white"
                                            : "text-charcoal-mid hover:bg-surface-bg"
                                    )}
                                >
                                    {letter}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-1 border-l border-card-border pl-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewMode('grid')}
                                className={cn(viewMode === 'grid' && 'bg-surface-bg')}
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewMode('list')}
                                className={cn(viewMode === 'list' && 'bg-surface-bg')}
                            >
                                <List className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Brands Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {Array(20).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-32 rounded-lg" />
                        ))}
                    </div>
                ) : filteredBrands.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-surface-bg rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-charcoal-light" />
                        </div>
                        <h3 className="text-lg font-semibold text-charcoal mb-2">Marka bulunamadi</h3>
                        <p className="text-charcoal-light">Arama kriterlerinize uygun marka bulunamadi.</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedLetter(null);
                            }}
                        >
                            Filtreleri Temizle
                        </Button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="space-y-10">
                        {sortedLetters.map(letter => (
                            <div key={letter}>
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="w-10 h-10 bg-[#F1E6D0] text-[#B89968] rounded-xl flex items-center justify-center font-bold text-lg">
                                        {letter}
                                    </span>
                                    <div className="h-px flex-1 bg-card-border" />
                                    <span className="text-sm text-charcoal-light">{groupedBrands[letter].length} marka</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {groupedBrands[letter].map(brand => (
                                        <Link
                                            key={brand.id}
                                            href={`/market/marka/${brand.slug}`}
                                            className="group bg-white rounded-lg border border-card-border p-5 hover:border-[#D4B896] hover:shadow-lg hover:shadow-[#B89968]/10 transition-all duration-300"
                                        >
                                            <div className="flex flex-col items-center text-center">
                                                <BrandLogo brand={brand} />
                                                <h3 className="font-semibold text-charcoal group-hover:text-[#B89968] transition-colors mb-1 line-clamp-1">
                                                    {brand.name}
                                                </h3>
                                                {brand.products_count !== undefined && (
                                                    <span className="text-xs text-charcoal-light flex items-center gap-1">
                                                        <Box className="w-3 h-3" />
                                                        {brand.products_count} urun
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {sortedLetters.map(letter => (
                            <div key={letter}>
                                <div className="flex items-center gap-4 mb-3">
                                    <span className="w-10 h-10 bg-[#F1E6D0] text-[#B89968] rounded-xl flex items-center justify-center font-bold text-lg">
                                        {letter}
                                    </span>
                                    <div className="h-px flex-1 bg-card-border" />
                                </div>
                                <div className="space-y-2">
                                    {groupedBrands[letter].map(brand => (
                                        <Link
                                            key={brand.id}
                                            href={`/market/marka/${brand.slug}`}
                                            className="group flex items-center gap-4 bg-white rounded-xl border border-card-border p-4 hover:border-[#D4B896] hover:shadow-md transition-all"
                                        >
                                            <BrandLogo brand={brand} size="sm" />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-charcoal group-hover:text-[#B89968] transition-colors">
                                                    {brand.name}
                                                </h3>
                                                {brand.description && (
                                                    <p className="text-sm text-charcoal-light line-clamp-1">{brand.description}</p>
                                                )}
                                            </div>
                                            {brand.products_count !== undefined && (
                                                <span className="text-sm text-charcoal-light flex items-center gap-1 flex-shrink-0">
                                                    <Box className="w-4 h-4" />
                                                    {brand.products_count} urun
                                                </span>
                                            )}
                                            <ArrowRight className="w-5 h-5 text-charcoal-light group-hover:text-[#B89968] group-hover:translate-x-1 transition-all flex-shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
