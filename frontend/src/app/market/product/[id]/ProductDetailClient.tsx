'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    productsApi,
    wishlistApi,
    reviewsApi,
    Product,
    Offer,
    Review,
    ReviewableItem,
    CreateReviewData,
} from '@/lib/api';
import { ProductCard } from '@/components/market/ProductCard';
import { ProductGallery } from '@/components/market/ProductGallery';
import { OfferTable } from '@/components/market/OfferTable';
import { cn } from '@/lib/utils';
import {
    Heart,
    Box,
    Truck,
    Star,
    AlertCircle,
    ShoppingCart,
    Loader2,
    Check,
    MessageSquare,
    PenLine,
    Send,
    CreditCard,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { ProductJsonLd } from '@/components/seo/ProductJsonLd';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { useCartStore } from '@/stores/useCartStore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type TabKey = 'all' | 'in_stock' | 'verified';

function initials(name?: string) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

function getRelativeDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTL(n: number) {
    return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function splitPrice(price: number | string | undefined | null) {
    const numPrice = Number(price) || 0;
    const [whole, decimal] = numPrice.toFixed(2).split('.');
    return { whole, decimal };
}

export function ProductDetailClient() {
    const params = useParams();
    const productId = Number(params.id);

    const [product, setProduct] = useState<Product | null>(null);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
    const [activeTab, setActiveTab] = useState<TabKey>('all');
    const [topQuantity, setTopQuantity] = useState(1);
    const [addingMain, setAddingMain] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewSummary, setReviewSummary] = useState<{
        averageRating: number;
        totalCount: number;
        distribution: Record<number, number>;
    }>({ averageRating: 0, totalCount: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });

    const [reviewableItems, setReviewableItems] = useState<ReviewableItem[]>([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [selectedOrderItem, setSelectedOrderItem] = useState<ReviewableItem | null>(null);
    const [reviewForm, setReviewForm] = useState({
        rating: 0,
        deliveryRating: 0,
        qualityRating: 0,
        communicationRating: 0,
        comment: '',
    });
    const [submittingReview, setSubmittingReview] = useState(false);

    const { addItem, setOpen } = useCartStore();
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        loadProductDetails();
        loadProductReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    useEffect(() => {
        if (user) loadReviewableItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, productId]);

    const loadReviewableItems = async () => {
        try {
            const response = await reviewsApi.getReviewableItems();
            if (response.data) {
                const itemsForProduct = response.data.items.filter(
                    (item: ReviewableItem) => item.product_id === productId,
                );
                setReviewableItems(itemsForProduct);
            }
        } catch (error) {
            console.error('Failed to load reviewable items:', error);
        }
    };

    const handleSubmitReview = async () => {
        if (!selectedOrderItem || reviewForm.rating === 0) {
            toast.error('Lütfen bir puan seçin');
            return;
        }
        setSubmittingReview(true);
        try {
            const data: CreateReviewData = {
                order_item_id: selectedOrderItem.id,
                rating: reviewForm.rating,
                delivery_rating: reviewForm.deliveryRating || undefined,
                quality_rating: reviewForm.qualityRating || undefined,
                communication_rating: reviewForm.communicationRating || undefined,
                comment: reviewForm.comment || undefined,
            };
            const response = await reviewsApi.create(data);
            if (response.data) {
                toast.success('Yorumunuz başarıyla gönderildi. Onaylandıktan sonra yayınlanacaktır.');
                setShowReviewForm(false);
                setSelectedOrderItem(null);
                setReviewForm({ rating: 0, deliveryRating: 0, qualityRating: 0, communicationRating: 0, comment: '' });
                setReviewableItems((prev) => prev.filter((item) => item.id !== selectedOrderItem.id));
                loadProductReviews();
            }
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Yorum gönderilemedi');
        } finally {
            setSubmittingReview(false);
        }
    };

    const StarRating = ({
        value,
        onChange,
        size = 'md',
    }: {
        value: number;
        onChange: (v: number) => void;
        size?: 'sm' | 'md';
    }) => {
        const [hovered, setHovered] = useState(0);
        const sizeClass = size === 'sm' ? 'w-5 h-5' : 'w-7 h-7';
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => onChange(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                        aria-label={`${star} yıldız`}
                    >
                        <Star
                            className={cn(
                                sizeClass,
                                'transition-colors',
                                (hovered || value) >= star
                                    ? 'fill-[var(--star)] text-[var(--star)]'
                                    : 'text-[var(--ink-3)]',
                            )}
                        />
                    </button>
                ))}
            </div>
        );
    };

    const loadProductReviews = async () => {
        setReviewsLoading(true);
        try {
            const response = await reviewsApi.getProductReviews(productId);
            if (response.data) {
                const reviewsData = response.data.reviews || [];
                setReviews(reviewsData);
                if (reviewsData.length > 0) {
                    const totalRating = reviewsData.reduce((sum: number, r: Review) => sum + r.rating, 0);
                    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                    reviewsData.forEach((r: Review) => {
                        distribution[r.rating] = (distribution[r.rating] || 0) + 1;
                    });
                    setReviewSummary({
                        averageRating: totalRating / reviewsData.length,
                        totalCount: reviewsData.length,
                        distribution,
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    const loadProductDetails = async () => {
        setIsLoading(true);
        try {
            const offersRes = await productsApi.getOffers(productId);
            if (offersRes.data) {
                setProduct(offersRes.data.product);
                setOffers(offersRes.data.offers || []);
                const loadedProduct = offersRes.data.product;
                if (loadedProduct.category?.slug) {
                    try {
                        const relatedRes = await productsApi.getAll({
                            category: loadedProduct.category.slug,
                            per_page: 6,
                        });
                        if (relatedRes.data) {
                            const filtered = relatedRes.data.products
                                .filter((p) => p.id !== productId)
                                .slice(0, 4);
                            setRelatedProducts(filtered);
                        }
                    } catch (error) {
                        console.error('Failed to load related products:', error);
                    }
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (!user) {
            toast.error('Favorilere eklemek için giriş yapmalısınız.');
            router.push('/login');
            return;
        }
        if (isTogglingFavorite || !product) return;
        setIsTogglingFavorite(true);
        try {
            const response = await wishlistApi.toggle(product.id);
            if (response.data) {
                setIsFavorite(response.data.in_wishlist);
                toast.success(response.data.in_wishlist ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı');
            }
        } catch (error) {
            console.error('Failed to toggle wishlist:', error);
            toast.error('Bir hata oluştu.');
        } finally {
            setIsTogglingFavorite(false);
        }
    };

    const handleReportError = () => {
        toast.info('Hata bildirme özelliği yakında aktif olacak.');
    };

    const verifiedCount = useMemo(
        () => offers.filter((o) => (o.seller?.seller_score ?? 0) / 2 >= 4.0).length,
        [offers],
    );
    const inStockCount = useMemo(() => offers.filter((o) => o.stock > 0).length, [offers]);

    const filteredOffers = useMemo(() => {
        let result = [...offers];
        if (activeTab === 'in_stock') {
            result = result.filter((o) => o.stock > 0);
        } else if (activeTab === 'verified') {
            result = result.filter((o) => (o.seller?.seller_score ?? 0) / 2 >= 4.0);
        }
        result.sort((a, b) => a.price - b.price);
        return result;
    }, [offers, activeTab]);

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <div className="max-w-[1320px] mx-auto px-8 py-8">
                    <div className="h-4 w-72 bg-[var(--line)] animate-pulse mb-8" />
                    <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-10">
                        <div className="aspect-square bg-[var(--surface-2)] animate-pulse" />
                        <div className="space-y-4">
                            <div className="h-10 w-3/4 bg-[var(--line)] animate-pulse" />
                            <div className="h-24 w-full bg-[var(--surface-2)] animate-pulse" />
                            <div className="h-14 w-full bg-[var(--surface-2)] animate-pulse" />
                            <div className="h-96 w-full bg-[var(--surface-2)] animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-[1320px] mx-auto px-8 py-16">
                <div className="border border-[var(--line)] py-16 px-6 text-center bg-[var(--bg)]">
                    <Box className="w-12 h-12 mx-auto text-[var(--ink-3)] mb-4" strokeWidth={1.2} />
                    <h3 className="font-display italic text-[24px] text-[var(--ink)] mb-2">Ürün bulunamadı</h3>
                    <p className="text-[var(--ink-2)] mb-6 text-[14px]">İstediğiniz ürün mevcut değil.</p>
                    <Link href="/market" className="btn btn-dark">
                        Pazaryerine Dön
                    </Link>
                </div>
            </div>
        );
    }

    const breadcrumbJsonLdItems = [
        { name: 'Pazaryeri', url: 'https://i-bijuteri.com/market' },
        ...(product.category
            ? [
                {
                    name: product.category.name,
                    url: `https://i-bijuteri.com/market/category/${product.category.slug}`,
                },
            ]
            : []),
        { name: product.name, url: `https://i-bijuteri.com/market/product/${product.id}` },
    ];

    const validPrices = offers.map((o) => Number(o.price)).filter((p) => p > 0);
    const lowestPrice = validPrices.length ? Math.min(...validPrices) : 0;
    const highestPrice = validPrices.length ? Math.max(...validPrices) : 0;
    const lowestOffer = offers.find((o) => Number(o.price) === lowestPrice && o.stock > 0);
    const psf = product?.psf != null ? Number(product.psf) : 0;
    const sellerCount = offers.length;
    const totalReviews = reviewSummary.totalCount;
    const avgRating = reviewSummary.averageRating;
    const lowestParts = splitPrice(lowestPrice);
    const brandSlug = product.brand ? product.brand.toLowerCase().replace(/\s+/g, '-') : '';
    const galleryImages = (() => {
        const arr: string[] = [];
        if (product.image) arr.push(product.image);
        if (product.image_url && product.image_url !== product.image) arr.push(product.image_url);
        return arr;
    })();

    const handleAddMain = async () => {
        if (!lowestOffer) return;
        setAddingMain(true);
        try {
            await addItem(lowestOffer.id, topQuantity);
            toast.success(
                <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    <span>{topQuantity > 1 ? `${topQuantity} adet ürün` : 'Ürün'} sepete eklendi</span>
                </div>,
                {
                    action: { label: 'Sepeti Gör', onClick: () => setOpen(true) },
                },
            );
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Ürün eklenemedi.');
        } finally {
            setAddingMain(false);
        }
    };

    return (
        <>
            <ProductJsonLd
                name={product.name}
                description={product.description}
                image={product.image_url || product.image}
                brand={product.brand}
                barcode={product.barcode}
                lowestPrice={product.lowest_price}
                highestPrice={product.highest_price}
                offersCount={offers.length}
                inStock={offers.length > 0}
                reviewCount={reviewSummary.totalCount}
                averageRating={reviewSummary.averageRating}
            />
            <BreadcrumbJsonLd items={breadcrumbJsonLdItems} />

            {/* Breadcrumb */}
            <div className="crumbs">
                <Link href="/market" className="a">
                    Pazaryeri
                </Link>
                {product.category && (
                    <>
                        <span className="sep">›</span>
                        <Link href={`/market/category/${product.category.slug}`} className="a">
                            {product.category.name}
                        </Link>
                    </>
                )}
                <span className="sep">›</span>
                <span className="now">{product.name}</span>
            </div>

            {/* Main pd-layout */}
            <div className="pd-layout">
                {/* LEFT: Gallery */}
                <div className="pd-images">
                    <ProductGallery images={galleryImages} productName={product.name} />
                    {psf > 0 && (
                        <div className="pd-psf">
                            <span className="l">PSF · Önerilen Satış</span>
                            <span className="v">₺ {formatTL(psf)}</span>
                        </div>
                    )}
                    <button type="button" onClick={handleReportError} className="pd-report">
                        <AlertCircle className="w-3.5 h-3.5" /> Hata bildir
                    </button>
                </div>

                {/* RIGHT: Details */}
                <div className="pd-details">
                    {/* Head: badges + SKU */}
                    <div className="pd-head">
                        <div className="badges">
                            <span className="badge gold">
                                <Sparkles className="w-3 h-3" /> Çok Tercih Edilen
                            </span>
                            <span className="badge success">
                                <ShieldCheck className="w-3 h-3" /> Onaylı Ürün
                            </span>
                        </div>
                        <div className="sku">
                            SKU: <b>{product.barcode || '—'}</b>
                        </div>
                    </div>

                    {/* Title block */}
                    <div className="pd-title">
                        {product.brand && (
                            <div className="eyebrow uppercase tracking-[.22em] font-semibold">
                                {product.brand}
                            </div>
                        )}
                        <h1>{product.name}</h1>
                        <div className="meta">
                            {product.brand && (
                                <Link href={`/market/marka/${brandSlug}`}>{product.brand}</Link>
                            )}
                            {totalReviews > 0 ? (
                                <span className="stars">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star
                                            key={i}
                                            className={cn(
                                                'w-3.5 h-3.5',
                                                i <= Math.round(avgRating) ? 'fill-current' : 'fill-transparent',
                                            )}
                                        />
                                    ))}
                                    <span className="num">{avgRating.toFixed(1)}</span>
                                    <span className="cnt">({totalReviews.toLocaleString('tr-TR')} değerlendirme)</span>
                                </span>
                            ) : (
                                <span className="cnt">Henüz değerlendirilmedi</span>
                            )}
                        </div>
                    </div>

                    {/* Price card */}
                    <div className="pd-price">
                        <div className="psf">
                            <div className="l">PSF</div>
                            <div className="v">{psf > 0 ? `₺${formatTL(psf)}` : '—'}</div>
                        </div>
                        <div className="best">
                            <div className="l">En Düşük İlan Fiyatı</div>
                            <div className="v">
                                <span className="cur">₺</span>
                                {lowestParts.whole}
                                <span className="sub">,{lowestParts.decimal}</span>
                            </div>
                            <div className="note">KDV dahil · adet başı</div>
                        </div>
                    </div>

                    {/* Range banner */}
                    {sellerCount > 1 && (
                        <div className="pd-range">
                            <AlertCircle />
                            <span>
                                <b>{sellerCount} satıcı</b> bu ürünü listeliyor — fiyat aralığı{' '}
                                <b>
                                    ₺{formatTL(lowestPrice)} – ₺{formatTL(highestPrice)}
                                </b>
                            </span>
                        </div>
                    )}

                    {/* CTA row */}
                    <div className="pd-cta-row">
                        <div className="qty">
                            <button
                                type="button"
                                onClick={() => setTopQuantity((q) => Math.max(1, q - 1))}
                                disabled={topQuantity <= 1}
                                aria-label="Azalt"
                            >
                                −
                            </button>
                            <input
                                type="text"
                                value={topQuantity}
                                onChange={(e) => {
                                    const v = Number(e.target.value) || 1;
                                    setTopQuantity(Math.max(1, Math.min(lowestOffer?.stock || 999, v)));
                                }}
                                aria-label="Adet"
                            />
                            <button
                                type="button"
                                onClick={() => setTopQuantity((q) => Math.min(lowestOffer?.stock || 999, q + 1))}
                                disabled={lowestOffer ? topQuantity >= lowestOffer.stock : false}
                                aria-label="Arttır"
                            >
                                +
                            </button>
                        </div>
                        {lowestOffer ? (
                            <button
                                type="button"
                                onClick={handleAddMain}
                                disabled={addingMain}
                                className="btn-cart"
                            >
                                {addingMain ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <ShoppingCart className="w-4 h-4" />
                                        En ucuz ilanı sepete ekle
                                    </>
                                )}
                            </button>
                        ) : (
                            <button type="button" disabled className="btn-cart opacity-50 cursor-not-allowed">
                                Stokta Yok
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleToggleFavorite}
                            disabled={isTogglingFavorite}
                            className={cn('btn-fav-lg', isFavorite && 'on')}
                            aria-label="Favori"
                        >
                            {isTogglingFavorite ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Heart className={cn('w-5 h-5', isFavorite && 'fill-current')} />
                            )}
                        </button>
                    </div>

                    {/* Trust strip */}
                    <div className="pd-trust">
                        <div className="item">
                            <span className="ic">
                                <Truck className="w-4 h-4" />
                            </span>
                            <div>
                                <div className="t">1–2 günde teslim</div>
                                <div className="s">Türkiye geneli</div>
                            </div>
                        </div>
                        <div className="item">
                            <span className="ic">
                                <ShieldCheck className="w-4 h-4" />
                            </span>
                            <div>
                                <div className="t">Onaylı satıcı</div>
                                <div className="s">Ayar &amp; iade güvencesi</div>
                            </div>
                        </div>
                        <div className="item">
                            <span className="ic">
                                <CreditCard className="w-4 h-4" />
                            </span>
                            <div>
                                <div className="t">Güvenli ödeme</div>
                                <div className="s">SSL · 3D Secure</div>
                            </div>
                        </div>
                    </div>

                    {/* Listings card */}
                    <div className="listings-card">
                        <div className="listings-head">
                            <h3>Ürünün tüm ilanları</h3>
                            <div className="listings-controls">
                                <span>{offers.length} teklif</span>
                            </div>
                        </div>
                        <div className="listings-tabs">
                            <button
                                type="button"
                                onClick={() => setActiveTab('all')}
                                className={cn(activeTab === 'all' && 'active')}
                            >
                                Tümü <span className="count">{offers.length}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('in_stock')}
                                className={cn(activeTab === 'in_stock' && 'active')}
                            >
                                Stokta <span className="count">{inStockCount}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('verified')}
                                className={cn(activeTab === 'verified' && 'active')}
                            >
                                Onaylı <span className="count">{verifiedCount}</span>
                            </button>
                        </div>
                        <OfferTable offers={filteredOffers} lowestPrice={lowestPrice} />
                    </div>
                </div>
            </div>

            {/* Description + Reviews */}
            <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 lg:mt-16 mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                    {/* Description */}
                    <div>
                        <div className="eyebrow mb-3 inline-flex items-center gap-3">
                            <span className="gold-rule" /> Ürün Hakkında
                        </div>
                        <h3 className="font-display italic text-[28px] text-[var(--ink)] mb-5 font-medium">
                            Açıklama
                        </h3>
                        {product.description ? (
                            <p className="text-[var(--ink-2)] leading-[1.85] text-[14px] whitespace-pre-wrap">
                                {product.description}
                            </p>
                        ) : (
                            <p className="text-[var(--ink-3)] leading-[1.85] text-[14px] italic">
                                Bu ürün için henüz açıklama bulunmuyor.
                            </p>
                        )}
                    </div>

                    {/* Reviews */}
                    <div>
                        <div className="flex items-start justify-between mb-5 gap-4">
                            <div>
                                <div className="eyebrow mb-3 inline-flex items-center gap-3">
                                    <span className="gold-rule" /> Değerlendirmeler
                                </div>
                                <h3 className="font-display italic text-[28px] text-[var(--ink)] font-medium">
                                    Müşteri Yorumları
                                </h3>
                            </div>
                            {reviewableItems.length > 0 && !showReviewForm && (
                                <button
                                    onClick={() => {
                                        setSelectedOrderItem(reviewableItems[0]);
                                        setShowReviewForm(true);
                                    }}
                                    className="btn btn-dark text-[11px] py-3 px-5"
                                >
                                    <PenLine className="w-3.5 h-3.5" /> Yorum Yaz
                                </button>
                            )}
                        </div>

                        {totalReviews > 0 && (
                            <div className="flex items-center gap-5 mb-5 pb-5 border-b border-[var(--line)]">
                                <div className="font-display text-[48px] text-[var(--ink)] leading-none">
                                    {avgRating.toFixed(1)}
                                    <small className="text-[18px] text-[var(--ink-3)]">/5</small>
                                </div>
                                <div>
                                    <div className="inline-flex gap-0.5 text-[var(--star)]">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <Star
                                                key={i}
                                                className={cn(
                                                    'w-4 h-4',
                                                    i <= Math.round(avgRating) ? 'fill-current' : 'fill-transparent',
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <div className="text-[12.5px] text-[var(--ink-3)] mt-1">
                                        {totalReviews.toLocaleString('tr-TR')} değerlendirme
                                    </div>
                                </div>
                            </div>
                        )}

                        {showReviewForm && selectedOrderItem && (
                            <div className="p-5 bg-[var(--surface-2)] border-l-2 border-[var(--accent)] mb-5">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-display italic text-[18px] text-[var(--ink)]">Yorum Yaz</h4>
                                        <button
                                            onClick={() => {
                                                setShowReviewForm(false);
                                                setSelectedOrderItem(null);
                                            }}
                                            className="text-[var(--ink-3)] hover:text-[var(--ink)] text-[11.5px] uppercase tracking-[.12em]"
                                        >
                                            Vazgeç
                                        </button>
                                    </div>

                                    <div className="text-[12px] text-[var(--ink-2)] bg-[var(--bg)] p-3 border border-[var(--line)]">
                                        <span className="text-[var(--ink-3)]">Sipariş:</span>{' '}
                                        <span className="font-medium text-[var(--ink)]">
                                            {selectedOrderItem.order.order_number}
                                        </span>
                                        <span className="mx-2 text-[var(--ink-3)]">|</span>
                                        <span className="text-[var(--ink-3)]">Satıcı:</span>{' '}
                                        <span className="font-medium text-[var(--ink)]">
                                            {selectedOrderItem.seller.nickname || selectedOrderItem.seller.business_name}
                                        </span>
                                    </div>

                                    {reviewableItems.length > 1 && (
                                        <div>
                                            <label className="block text-[11px] font-semibold text-[var(--ink)] uppercase tracking-[.22em] mb-2">
                                                Sipariş Seçin
                                            </label>
                                            <select
                                                value={selectedOrderItem.id}
                                                onChange={(e) => {
                                                    const item = reviewableItems.find((i) => i.id === Number(e.target.value));
                                                    if (item) setSelectedOrderItem(item);
                                                }}
                                                className="w-full h-10 px-3 text-[13px] border border-[var(--line)] bg-[var(--bg)] focus:outline-none focus:border-[var(--ink)]"
                                            >
                                                {reviewableItems.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.order.order_number} - {item.seller.nickname || item.seller.business_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[11px] font-semibold text-[var(--ink)] uppercase tracking-[.22em] mb-2">
                                            Genel Puan <span className="text-[var(--danger)]">*</span>
                                        </label>
                                        <StarRating
                                            value={reviewForm.rating}
                                            onChange={(v) => setReviewForm((prev) => ({ ...prev, rating: v }))}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-semibold text-[var(--ink-2)] uppercase tracking-[.18em] mb-1.5">
                                                Teslimat
                                            </label>
                                            <StarRating
                                                value={reviewForm.deliveryRating}
                                                onChange={(v) => setReviewForm((prev) => ({ ...prev, deliveryRating: v }))}
                                                size="sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-[var(--ink-2)] uppercase tracking-[.18em] mb-1.5">
                                                Ürün Kalitesi
                                            </label>
                                            <StarRating
                                                value={reviewForm.qualityRating}
                                                onChange={(v) => setReviewForm((prev) => ({ ...prev, qualityRating: v }))}
                                                size="sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-[var(--ink-2)] uppercase tracking-[.18em] mb-1.5">
                                                İletişim
                                            </label>
                                            <StarRating
                                                value={reviewForm.communicationRating}
                                                onChange={(v) => setReviewForm((prev) => ({ ...prev, communicationRating: v }))}
                                                size="sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-[var(--ink)] uppercase tracking-[.22em] mb-2">
                                            Yorumunuz
                                        </label>
                                        <textarea
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                                            placeholder="Deneyiminizi paylaşın..."
                                            rows={3}
                                            className="w-full px-3 py-2 text-[13px] border border-[var(--line)] bg-[var(--bg)] focus:outline-none focus:border-[var(--ink)] resize-none"
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleSubmitReview}
                                            disabled={submittingReview || reviewForm.rating === 0}
                                            className="btn btn-dark text-[11px] py-3 px-6 disabled:opacity-50"
                                        >
                                            {submittingReview ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                            Yorumu Gönder
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {reviewsLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] animate-pulse" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 w-32 bg-[var(--surface-2)] animate-pulse" />
                                            <div className="h-3 w-full bg-[var(--surface-2)] animate-pulse" />
                                            <div className="h-3 w-3/4 bg-[var(--surface-2)] animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-10">
                                <MessageSquare className="w-12 h-12 mx-auto text-[var(--ink-3)] mb-3" strokeWidth={1.2} />
                                <p className="text-[var(--ink-2)] text-[14px]">Henüz yorum yapılmamış</p>
                                {reviewableItems.length === 0 && user && (
                                    <p className="text-[11.5px] text-[var(--ink-3)] mt-2">
                                        Yorum yapmak için bu ürünü satın alıp teslim almanız gerekiyor.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {reviews.slice(0, 3).map((review) => (
                                    <div key={review.id} className="py-4 border-b border-[var(--line)] last:border-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-9 h-9 rounded-full bg-[var(--accent-soft)] text-[var(--accent-2)] font-display italic text-[14px] grid place-items-center flex-shrink-0">
                                                {initials(review.buyer?.nickname || review.buyer?.business_name)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[13px] font-semibold text-[var(--ink)] truncate">
                                                    {review.buyer?.nickname || review.buyer?.business_name || 'Anonim'}
                                                </div>
                                                <div className="text-[11px] text-[var(--ink-3)]">
                                                    {getRelativeDate(review.created_at)}
                                                </div>
                                            </div>
                                            <div className="inline-flex gap-0.5 text-[var(--star)]">
                                                {[1, 2, 3, 4, 5].map((i) => (
                                                    <Star
                                                        key={i}
                                                        className={cn(
                                                            'w-3 h-3',
                                                            i <= review.rating ? 'fill-current' : 'fill-transparent',
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="text-[var(--ink-2)] text-[13px] leading-[1.7] mt-2">
                                                {review.comment}
                                            </p>
                                        )}
                                        {review.seller_reply && (
                                            <div className="mt-3 p-3 bg-[var(--surface-2)] border-l-2 border-[var(--accent)]">
                                                <div className="text-[10px] font-semibold text-[var(--accent-2)] uppercase tracking-[.22em] mb-1">
                                                    Satıcı Yanıtı
                                                </div>
                                                <p className="text-[var(--ink-2)] text-[12.5px]">{review.seller_reply}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {reviews.length > 3 && (
                                    <div className="text-center mt-3">
                                        <button className="text-[var(--accent-2)] text-[12px] font-semibold uppercase tracking-[.18em] hover:text-[var(--ink)] border-b border-[var(--accent-2)] hover:border-[var(--ink)] pb-0.5">
                                            Tüm yorumları gör ({totalReviews})
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Related */}
            {relatedProducts.length > 0 && (
                <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
                    <div className="sec-head">
                        <div className="l">
                            <span className="eyebrow inline-flex items-center gap-3">
                                <span className="gold-rule" /> Benzer Ürünler
                            </span>
                            <h2>Bunlar da ilginizi çekebilir.</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        {relatedProducts.map((rp) => (
                            <ProductCard key={rp.id} product={rp} />
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}
