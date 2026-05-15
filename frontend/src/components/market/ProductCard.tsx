"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Package, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { wishlistApi } from "@/lib/api";
import { toast } from "sonner";

interface ProductCardProps {
    product: {
        id: number;
        name: string;
        image?: string;
        image_url?: string;
        brand?: string;
        lowest_price?: number;
        highest_price?: number;
        offers_count?: number;
        stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
        default_offer_id?: number;
    };
    badge?: string;
    className?: string;
}

/**
 * Marketplace product card (.mp-card)
 * Editorial design with square photo, favori toggle, seller chip, price range.
 * Note: quick-add-to-cart UI removed — add to cart happens on /market/product/[id].
 */
export const ProductCard = React.memo(function ProductCard({ product, className }: ProductCardProps) {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
    const [imgError, setImgError] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const formatPrice = (price?: number) => {
        if (!price && price !== 0) return null;
        return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(price);
    };

    const offersCount = typeof product.offers_count === 'number'
        ? product.offers_count
        : parseInt(product.offers_count as unknown as string) || 0;

    const getStockInfo = () => {
        if (product.stock_status === 'out_of_stock' || offersCount === 0) {
            return { status: 'out' as const, label: 'Stokta Yok' };
        }
        if (product.stock_status === 'low_stock' || offersCount <= 2) {
            return { status: 'low' as const, label: `Son birimler · ${offersCount} satıcı` };
        }
        return { status: 'in' as const, label: `Stokta · ${offersCount} satıcı` };
    };
    const stockInfo = getStockInfo();

    const handleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            toast.error('Favorilere eklemek için giriş yapmalısınız.');
            router.push('/login');
            return;
        }
        if (isTogglingWishlist) return;
        setIsTogglingWishlist(true);
        try {
            const response = await wishlistApi.toggle(product.id);
            if (response.data) {
                setIsWishlisted(response.data.in_wishlist);
                toast.success(response.data.in_wishlist ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı');
            }
        } catch (error) {
            console.error('Failed to toggle wishlist:', error);
            toast.error('Bir hata oluştu.');
        } finally {
            setIsTogglingWishlist(false);
        }
    };

    const hasImage = (product.image_url || product.image) && !imgError;
    const lowest = formatPrice(product.lowest_price);
    const highest = formatPrice(product.highest_price);

    return (
        <Link href={`/market/product/${product.id}`} className={cn("mp-card", className)}>
            <div className="photo">
                {hasImage ? (
                    <Image
                        src={product.image_url || product.image || ''}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw"
                        className="object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="photo-fallback">
                        <Package className="w-10 h-10" strokeWidth={1.2} />
                    </div>
                )}

                <button
                    type="button"
                    className={cn("fav", isWishlisted && "on")}
                    aria-label="Favoriye ekle"
                    onClick={handleWishlist}
                    disabled={isTogglingWishlist}
                >
                    {isTogglingWishlist ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Heart className={cn("w-3.5 h-3.5", isWishlisted && "fill-current")} strokeWidth={1.5} />
                    )}
                </button>

                {offersCount > 0 && (
                    <span className="seller-chip">
                        <span className="dot" />
                        {offersCount} satıcı
                    </span>
                )}
            </div>

            <div className="body">
                {product.brand && <div className="brand">{product.brand}</div>}
                <div className="name">{product.name}</div>

                <div className="price-row">
                    <div className="left">
                        <div className="lbl">En düşük</div>
                        <div className="val">
                            {lowest ? (
                                <>
                                    <span className="cur">₺</span>{lowest}
                                </>
                            ) : (
                                <span className="text-[var(--ink-3)]">—</span>
                            )}
                        </div>
                    </div>
                    {highest && highest !== lowest && (
                        <div className="right">
                            <div className="lbl">Fiyat aralığı</div>
                            <div className="val">₺{lowest} – ₺{highest}</div>
                        </div>
                    )}
                </div>

                <div className={cn("stock-line", stockInfo.status === 'low' && 'low', stockInfo.status === 'out' && 'out')}>
                    <span className="dot" />
                    {stockInfo.label}
                </div>
            </div>
        </Link>
    );
});
