'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { offersApi, SellerOffersResponse } from '@/lib/api';
import { GridProductCard } from '@/components/market/GridProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
    Store,
    MapPin,
    Box,
    ArrowLeft,
    Tag,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

// Empty State Component
function EmptyOffers() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-100 to-slate-50 rounded-full blur-lg scale-150"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center border border-card-border">
                    <Box className="w-12 h-12 text-charcoal-light" strokeWidth={1.5} />
                </div>
            </div>
            <h3 className="text-xl font-semibold text-charcoal mb-2">
                Henüz ilan yoktur
            </h3>
            <p className="text-charcoal-light max-w-md">
                Bu satıcı henüz aktif bir ilan yayınlamamış.
            </p>
        </div>
    );
}

// Loading Skeleton
function LoadingSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Back button skeleton */}
            <Skeleton className="h-10 w-32 mb-6" />

            {/* Header skeleton */}
            <div className="bg-white rounded-lg p-6 mb-8 border border-card-border">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div>
                        <Skeleton className="h-7 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            </div>

            {/* Products grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="aspect-square rounded-xl" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Error State
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    const router = useRouter();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold text-charcoal mb-2">Bir hata oluştu</h2>
                <p className="text-charcoal-light mb-6 max-w-md">{message}</p>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Geri Dön
                    </Button>
                    <Button onClick={onRetry}>
                        Tekrar Dene
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function SellerProfilePage() {
    const params = useParams();
    const router = useRouter();
    const sellerId = Number(params.id);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<SellerOffersResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchOffers = async (page: number = 1) => {
        setLoading(true);
        setError(null);

        try {
            const response = await offersApi.getSellerOffers(sellerId, page);

            if (response.error) {
                setError(response.error);
                return;
            }

            if (response.data) {
                setData(response.data);
                setCurrentPage(page);
            }
        } catch {
            setError('Beklenmeyen bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (sellerId) {
            fetchOffers(1);
        }
    }, [sellerId]); // eslint-disable-line react-hooks/exhaustive-deps -- fetchOffers is stable, sellerId is the trigger

    if (loading && !data) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={() => fetchOffers(currentPage)} />;
    }

    if (!data) {
        return <ErrorState message="Veri yüklenemedi" onRetry={() => fetchOffers(1)} />;
    }

    const { seller, offers, pagination } = data;
    const displayName = seller.nickname || seller.business_name;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Back Button */}
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-6 text-charcoal-mid hover:text-charcoal"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
            </Button>

            {/* Seller Header */}
            <div className="bg-white rounded-lg p-6 mb-8 border border-card-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#F1E6D0] to-[#B89968] rounded-full flex items-center justify-center">
                        <Store className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-charcoal">
                            {displayName}
                        </h1>
                        {seller.city && (
                            <div className="flex items-center gap-1 text-charcoal-light mt-1">
                                <MapPin className="w-4 h-4" />
                                <span>{seller.city}</span>
                            </div>
                        )}
                    </div>
                    <div className="ml-auto">
                        <Badge className="bg-[#F1E6D0] text-[#B89968] text-sm px-3 py-1">
                            <Tag className="w-4 h-4 mr-1" />
                            {pagination.total} ilan
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Offers Grid or Empty State */}
            {offers.length === 0 ? (
                <EmptyOffers />
            ) : (
                <>
                    {/* Offers Grid */}
                    <div className="bg-white dark:bg-charcoal rounded-xl border border-black/10 dark:border-slate-700 overflow-clip mb-8">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-3">
                            {offers.map((offer) => (
                                offer.product ? (
                                    <GridProductCard key={offer.id} product={{
                                        ...offer.product,
                                        lowest_price: offer.price,
                                        offers_count: 1,
                                    }} />
                                ) : null
                            ))}
                        </div>
                    </div>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchOffers(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            <div className="flex items-center gap-1">
                                {[...Array(pagination.last_page)].map((_, i) => {
                                    const page = i + 1;
                                    // Show first, last, and pages around current
                                    if (
                                        page === 1 ||
                                        page === pagination.last_page ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <Button
                                                key={page}
                                                variant={page === currentPage ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => fetchOffers(page)}
                                                disabled={loading}
                                                className={cn(
                                                    "w-8 h-8 p-0",
                                                    page === currentPage && "bg-[#B89968]"
                                                )}
                                            >
                                                {page}
                                            </Button>
                                        );
                                    } else if (
                                        page === currentPage - 2 ||
                                        page === currentPage + 2
                                    ) {
                                        return <span key={page} className="text-charcoal-light">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchOffers(currentPage + 1)}
                                disabled={currentPage === pagination.last_page || loading}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
