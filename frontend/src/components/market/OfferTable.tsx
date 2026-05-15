'use client';

import { useState } from 'react';
import { MapPin, Box } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Offer } from '@/lib/api';
import Link from 'next/link';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

interface OfferTableProps {
    offers: Offer[];
    lowestPrice?: number | null;
    className?: string;
}

function initials(name?: string) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

function formatTL(n: number) {
    return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n);
}

function getDelivery(offer: Offer): string {
    const ship = (offer as Offer & { shipping_cost?: number }).shipping_cost;
    if (ship && ship > 0) return '1-2 gün';
    return 'Aynı gün';
}

function getStockState(stock: number): { cls: string; label: string } {
    if (stock <= 0) return { cls: 'out', label: 'Stokta yok' };
    if (stock <= 5) return { cls: 'low', label: `Son ${stock} adet` };
    return { cls: '', label: `Stokta · ${stock}` };
}

export function OfferTable({ offers, className }: OfferTableProps) {
    const [quantities, setQuantities] = useState<Record<number, number>>(() =>
        offers.reduce((acc, o) => ({ ...acc, [o.id]: 1 }), {}),
    );

    if (offers.length === 0) {
        return (
            <div className={cn('border border-[var(--line)] py-16 text-center bg-[var(--bg)]', className)}>
                <Box className="w-12 h-12 text-[var(--ink-3)] mx-auto mb-4" strokeWidth={1.2} />
                <h3 className="font-display italic text-[20px] text-[var(--ink)] mb-2">Henüz teklif yok</h3>
                <p className="text-[var(--ink-2)] text-[13px] max-w-md mx-auto">
                    Bu ürün için henüz aktif bir satıcı teklifi yok. Daha sonra tekrar kontrol edin.
                </p>
            </div>
        );
    }

    const updateQty = (offerId: number, qty: number) => {
        setQuantities((prev) => ({ ...prev, [offerId]: qty }));
    };

    return (
        <div className={cn(className)}>
            <div className="listing-table">
                <div className="th">Bayi</div>
                <div className="th">Fiyat</div>
                <div className="th">Stok</div>
                <div className="th">Kargo</div>
                <div className="th text-right">Aksiyon</div>

                {offers.map((offer, index) => {
                    const isBest = index === 0;
                    const sellerName =
                        offer.seller?.nickname || offer.seller?.business_name || 'Tedarikçi';
                    const rating = offer.seller?.seller_score
                        ? (offer.seller.seller_score / 2).toFixed(1)
                        : null;
                    const reviewCount = offer.seller?.seller_review_count || 0;
                    const quantity = quantities[offer.id] || 1;
                    const stockState = getStockState(offer.stock);

                    return (
                        <div key={offer.id} className="row">
                            {/* BAYİ */}
                            <div className="cell seller">
                                <div className="av">{initials(sellerName)}</div>
                                <div className="info">
                                    {isBest && (
                                        <div className="top">
                                            <span className="best-badge">En Uygun</span>
                                        </div>
                                    )}
                                    <div className="name">
                                        {offer.seller?.id ? (
                                            <Link href={`/market/satici/${offer.seller.id}`}>
                                                {sellerName}
                                            </Link>
                                        ) : (
                                            sellerName
                                        )}
                                    </div>
                                    <div className="meta">
                                        {rating && (
                                            <span className="rating">
                                                <span className="s">★</span> {rating}
                                                {reviewCount > 0 && (
                                                    <span className="text-[var(--ink-3)]">({reviewCount})</span>
                                                )}
                                            </span>
                                        )}
                                        {offer.seller?.city && (
                                            <>
                                                {rating && <span className="dot" />}
                                                <span className="city">
                                                    <MapPin />
                                                    {offer.seller.city}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* FİYAT */}
                            <div className="cell pricecell">
                                <div className="v">
                                    <span className="text-[13px] text-[var(--ink-2)] mr-0.5">₺</span>
                                    {formatTL(offer.price)}
                                </div>
                                <div className="sub">KDV dahil</div>
                            </div>

                            {/* STOK */}
                            <div className="cell">
                                <span className={cn('stock-pill', stockState.cls)}>
                                    <span className="dot" />
                                    {stockState.label}
                                </span>
                            </div>

                            {/* KARGO */}
                            <div className="cell shipping">
                                <div className="v">{getDelivery(offer)}</div>
                                <div className="free">Ücretsiz kargo</div>
                            </div>

                            {/* AKSİYON */}
                            <div className="cell actions">
                                <div className="qty-mini">
                                    <button
                                        type="button"
                                        onClick={() => updateQty(offer.id, Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                        aria-label="Azalt"
                                    >
                                        −
                                    </button>
                                    <input type="text" value={quantity} readOnly />
                                    <button
                                        type="button"
                                        onClick={() => updateQty(offer.id, Math.min(offer.stock, quantity + 1))}
                                        disabled={quantity >= offer.stock}
                                        aria-label="Arttır"
                                    >
                                        +
                                    </button>
                                </div>
                                <AddToCartButton
                                    offerId={offer.id}
                                    stock={offer.stock}
                                    sellerId={offer.seller?.id}
                                    quantity={quantity}
                                    className="btn-add"
                                    showConfetti={isBest}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
