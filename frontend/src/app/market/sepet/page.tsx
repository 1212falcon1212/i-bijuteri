'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore, CartBySeller, CartItem, ValidationIssue } from '@/stores/useCartStore';
import { productsApi, Product, shippingApi, cmsApi, type CmsLayoutResponse } from '@/lib/api';
import { ProductCard } from '@/components/market/ProductCard';
import {
    ShoppingCart,
    Trash2,
    ArrowRight,
    ArrowLeft,
    Box,
    AlertCircle,
    Loader2,
    Truck,
    ShieldCheck,
    CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function ProductImage({ src, alt }: { src: string | null | undefined; alt: string }) {
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <div className="thumb grid place-items-center">
                <Box className="h-6 w-6 text-[var(--ink-3)]" />
            </div>
        );
    }

    return (
        <div className="thumb">
            <img
                src={src}
                alt={alt}
                onError={() => setError(true)}
            />
        </div>
    );
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
}

function formatNumber(price: number) {
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);
}

function CartItemRow({
    item,
    isLoading,
    validationMessage,
    priceIssue,
    onQuantityChange,
    onRemove,
}: {
    item: CartItem;
    isLoading: boolean;
    validationMessage?: string;
    priceIssue?: ValidationIssue;
    onQuantityChange: (itemId: number, qty: number) => void;
    onRemove: (itemId: number) => void;
}) {
    const imageSrc = item.product.image_url ||
        (item.product.image ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${item.product.image}` : null);

    return (
        <div className={cn('cart-item', validationMessage && 'bg-[rgba(178,58,72,0.05)]')}>
            <Link href={`/market/product/${item.product_id}`} aria-label={item.product.name}>
                <ProductImage src={imageSrc} alt={item.product.name} />
            </Link>
            <div className="info">
                {item.product.brand && <div className="brand">{item.product.brand}</div>}
                <Link href={`/market/product/${item.product_id}`} className="name hover:text-[var(--accent-2)] transition-colors">
                    {item.product.name}
                </Link>
                <div className="specs">
                    {item.product.barcode && (
                        <>
                            <span>SKU: {item.product.barcode}</span>
                            <span className="dot" />
                        </>
                    )}
                    <span>Stok: {item.offer.stock}</span>
                </div>
                {validationMessage && (
                    <div className="text-[11.5px] text-[var(--danger)] mt-1 flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {validationMessage}
                    </div>
                )}
                <div className="actions">
                    <button type="button" onClick={() => onRemove(item.id)} disabled={isLoading} className="danger">
                        Kaldır
                    </button>
                </div>
            </div>
            <div className="qty-cart">
                <button type="button" onClick={() => onQuantityChange(item.id, item.quantity - 1)} disabled={isLoading} aria-label="Azalt">
                    −
                </button>
                <input value={item.quantity} readOnly />
                <button
                    type="button"
                    onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                    disabled={isLoading || item.quantity >= item.offer.stock}
                    aria-label="Arttır"
                >
                    +
                </button>
            </div>
            <div className="price">
                <div className="each">Toplam</div>
                {priceIssue && priceIssue.old_price && priceIssue.new_price ? (
                    <>
                        <div className="text-[11px] text-[var(--ink-3)] line-through">{formatPrice(priceIssue.old_price)}</div>
                        <div className="total" style={{ color: priceIssue.new_price > priceIssue.old_price ? 'var(--danger)' : 'var(--success)' }}>
                            <span className="cur">₺</span>
                            {formatNumber(priceIssue.new_price * item.quantity)}
                        </div>
                    </>
                ) : (
                    <div className="total">
                        <span className="cur">₺</span>
                        {formatNumber(item.price_at_addition * item.quantity)}
                    </div>
                )}
                <div className="unit">₺{formatNumber(item.price_at_addition)} / adet</div>
            </div>
        </div>
    );
}

interface ShippingInfo {
    cost: number;
    loading: boolean;
    freeShipping: boolean;
}

function SellerGroupBlock({
    group,
    isLoading,
    validationIssues,
    onQuantityChange,
    onRemove,
}: {
    group: CartBySeller;
    isLoading: boolean;
    validationIssues: ValidationIssue[];
    shippingInfo?: ShippingInfo;
    onQuantityChange: (itemId: number, qty: number) => void;
    onRemove: (itemId: number) => void;
}) {
    const sellerName = group.seller?.nickname || group.seller?.business_name || 'Tedarikçi';
    const initial = sellerName[0]?.toUpperCase() || '?';

    return (
        <div className="seller-group">
            <div className="sg-head">
                <div className="l">
                    <div className="av">{initial}</div>
                    <div>
                        <div className="name">
                            {group.seller?.id ? (
                                <Link href={`/market/satici/${group.seller.id}`} className="hover:text-[var(--accent-2)]">
                                    {sellerName}
                                </Link>
                            ) : (
                                sellerName
                            )}
                            <span className="type">B2B</span>
                        </div>
                        <div className="meta">
                            {group.seller?.city && (
                                <>
                                    {group.seller.city} · {' '}
                                </>
                            )}
                            {group.items.length} ürün
                        </div>
                    </div>
                </div>
                <div className="r">
                    Ara toplam: <b>₺{formatNumber(group.subtotal)}</b>
                </div>
            </div>

            {group.items.map((item) => {
                const issue = validationIssues.find((i) => i.item_id === item.id && i.type !== 'price_changed');
                const priceIssue = validationIssues.find((i) => i.item_id === item.id && i.type === 'price_changed');
                return (
                    <CartItemRow
                        key={item.id}
                        item={item}
                        isLoading={isLoading}
                        validationMessage={issue?.message}
                        priceIssue={priceIssue}
                        onQuantityChange={onQuantityChange}
                        onRemove={onRemove}
                    />
                );
            })}

            <div className="sg-foot">
                <div className="l">
                    <Truck strokeWidth={1.5} />
                    <b>Ücretsiz kargo</b> · 1–3 iş gününde
                </div>
                <div className="r">
                    Toplam: <b>₺{formatNumber(group.subtotal)}</b>
                </div>
            </div>
        </div>
    );
}

export default function SepetPage() {
    const {
        itemsBySeller,
        itemCount,
        isLoading,
        validationIssues,
        selectedSellers,
        selectedTotal,
        fetchCart,
        validateCart,
        updateQuantity,
        removeItem,
        clearCart,
        selectAllSellers,
    } = useCartStore();

    const [clearing, setClearing] = useState(false);
    const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
    const [sellerShipping, setSellerShipping] = useState<Record<number, ShippingInfo>>({});
    const [promoCode, setPromoCode] = useState('');
    const [minOrderAmount, setMinOrderAmount] = useState(500);

    useEffect(() => {
        fetchCart();
        validateCart();
    }, [fetchCart, validateCart]);

    // Load platform-wide minimum order amount from admin settings
    useEffect(() => {
        cmsApi.getLayout().then((res) => {
            if (!res.data) return;
            const raw = res.data as { data?: CmsLayoutResponse } | CmsLayoutResponse;
            const layout = (raw as { data?: CmsLayoutResponse }).data ?? (raw as CmsLayoutResponse);
            if (layout?.commerce?.min_order_amount !== undefined) {
                setMinOrderAmount(Number(layout.commerce.min_order_amount));
            }
        }).catch(() => { /* keep default */ });
    }, []);

    // Auto-select all sellers if none selected
    useEffect(() => {
        if (itemsBySeller.length > 0 && selectedSellers.length === 0) {
            selectAllSellers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemsBySeller.length]);

    useEffect(() => {
        if (itemsBySeller.length === 0) return;

        const fetchShipping = async () => {
            const newShipping: Record<number, ShippingInfo> = {};
            itemsBySeller.forEach((group) => {
                const sellerId = group.seller?.id;
                if (sellerId) {
                    newShipping[sellerId] = { cost: 0, loading: true, freeShipping: false };
                }
            });
            setSellerShipping(newShipping);

            await Promise.all(
                itemsBySeller.map(async (group) => {
                    const sellerId = group.seller?.id;
                    if (!sellerId) return;
                    const totalDesi = group.items.reduce((sum, item) => {
                        const desi = (item.product as unknown as { desi?: number }).desi || 0.5;
                        return sum + desi * item.quantity;
                    }, 0) || 1;
                    try {
                        const response = await shippingApi.getOptions(totalDesi, group.subtotal);
                        const options = response.data?.options || [];
                        if (options.length > 0) {
                            const cheapest = options.reduce((min, o) => (o.price < min.price ? o : min), options[0]);
                            newShipping[sellerId] = {
                                cost: cheapest.price,
                                loading: false,
                                freeShipping: cheapest.is_free || cheapest.price === 0,
                            };
                        } else {
                            newShipping[sellerId] = { cost: 0, loading: false, freeShipping: false };
                        }
                    } catch {
                        newShipping[sellerId] = { cost: 0, loading: false, freeShipping: false };
                    }
                }),
            );
            setSellerShipping({ ...newShipping });
        };

        fetchShipping();
    }, [itemsBySeller]);

    useEffect(() => {
        const loadSuggestions = async () => {
            try {
                const response = await productsApi.getAll({ per_page: 12 });
                const products = response.data?.products || [];
                const withOffers = products.filter((p: Product) => (p.offers_count ?? 0) > 0);
                setSuggestedProducts(withOffers.slice(0, 8));
            } catch {
                // silently fail
            }
        };
        loadSuggestions();
    }, []);

    const handleQuantityChange = async (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) {
            await removeItem(itemId);
        } else {
            await updateQuantity(itemId, newQuantity);
        }
        validateCart();
    };

    const handleRemove = async (itemId: number) => {
        await removeItem(itemId);
        validateCart();
    };

    const handleClearCart = async () => {
        setClearing(true);
        try {
            await clearCart();
        } finally {
            setClearing(false);
        }
    };

    const hasBlockingIssues = validationIssues.some((i) => i.type === 'unavailable' || i.type === 'stock');
    const priceChangedCount = validationIssues.filter((i) => i.type === 'price_changed').length;
    const computedSelectedTotal = selectedTotal();
    const isBelowMinOrder = computedSelectedTotal < minOrderAmount && itemCount > 0;
    const remainingForMinOrder = minOrderAmount - computedSelectedTotal;
    const totalSellerCount = itemsBySeller.length;
    const subtotal = computedSelectedTotal;
    const vatRate = 0.20;
    const vat = subtotal * vatRate / (1 + vatRate); // KDV dahil fiyattan KDV miktarı

    // Empty cart
    if (itemCount === 0 && !isLoading) {
        return (
            <>
                <div className="crumbs">
                    <Link href="/market" className="a">Pazaryeri</Link>
                    <span className="sep">›</span>
                    <span className="now">Sepetim</span>
                </div>
                <div className="max-w-[920px] mx-auto px-8 py-24 text-center">
                    <ShoppingCart className="w-14 h-14 mx-auto text-[var(--ink-3)] mb-6" strokeWidth={1.2} />
                    <h1 className="font-display italic text-[40px] text-[var(--ink)] mb-3">Sepetiniz boş.</h1>
                    <p className="text-[var(--ink-2)] mb-8 max-w-md mx-auto text-[14px] leading-[1.7]">
                        Koleksiyondan ürün seçin, en uygun tedarikçi fiyatlarını karşılaştırın ve toptan
                        avantajıyla vitrininize alın.
                    </p>
                    <Link href="/market" className="btn btn-dark">
                        <ArrowLeft className="w-4 h-4" /> Alışverişe Başla
                    </Link>
                </div>

                {suggestedProducts.length > 0 && (
                    <section className="max-w-[1320px] mx-auto px-8 pb-24">
                        <div className="sec-head">
                            <div className="l">
                                <span className="eyebrow inline-flex items-center gap-3">
                                    <span className="gold-rule" /> İlginizi Çekebilir
                                </span>
                                <h2>Önerilen ürünler.</h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {suggestedProducts.slice(0, 4).map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </section>
                )}
            </>
        );
    }

    return (
        <>
            <div className="crumbs">
                <Link href="/market" className="a">Pazaryeri</Link>
                <span className="sep">›</span>
                <span className="now">Sepetim</span>
            </div>

            <div className="page-head">
                <div className="l">
                    <div className="eyebrow">
                        <span className="gold-rule" /> Adım 1 / 4
                    </div>
                    <h1>Sepetim.</h1>
                    <div className="sub">
                        <b>{itemCount}</b> ürün · <b>{totalSellerCount}</b> tedarikçiden
                    </div>
                </div>
                <div className="r">
                    <button
                        type="button"
                        onClick={handleClearCart}
                        disabled={isLoading || clearing}
                        className="text-[11.5px] uppercase tracking-[.18em] text-[var(--danger)] hover:text-[var(--ink)] inline-flex items-center gap-2"
                    >
                        {clearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        Sepeti Temizle
                    </button>
                </div>
            </div>

            {/* Steps strip */}
            <div className="cart-steps">
                <div className="step active">
                    <div className="n">1</div>Sepet
                </div>
                <div className="sep" />
                <div className="step">
                    <div className="n">2</div>Teslimat
                </div>
                <div className="sep" />
                <div className="step">
                    <div className="n">3</div>Ödeme
                </div>
                <div className="sep" />
                <div className="step">
                    <div className="n">4</div>Onay
                </div>
            </div>

            {/* Validation alerts */}
            {validationIssues.filter((i) => i.type !== 'price_changed').length > 0 && (
                <div className="max-w-[1320px] mx-auto px-8 mt-6">
                    <div className="pd-range">
                        <AlertCircle />
                        <span>
                            Sepetinizde düzeltilmesi gereken{' '}
                            <b>{validationIssues.filter((i) => i.type !== 'price_changed').length}</b> sorun var.
                            Aşağıdaki uyarıları kontrol edin.
                        </span>
                    </div>
                </div>
            )}

            {priceChangedCount > 0 && (
                <div className="max-w-[1320px] mx-auto px-8 mt-4">
                    <div className="pd-range">
                        <AlertCircle />
                        <span>
                            <b>{priceChangedCount}</b> ürünün fiyatı değişti. Güncel fiyatlar aşağıda gösteriliyor.
                        </span>
                    </div>
                </div>
            )}

            <div className="cart-layout mt-8">
                <div>
                    {itemsBySeller.map((group, index) => (
                        <SellerGroupBlock
                            key={group.seller?.id || `group-${index}`}
                            group={group}
                            isLoading={isLoading}
                            validationIssues={validationIssues}
                            shippingInfo={group.seller?.id ? sellerShipping[group.seller.id] : undefined}
                            onQuantityChange={handleQuantityChange}
                            onRemove={handleRemove}
                        />
                    ))}

                    <Link
                        href="/market"
                        className="inline-flex items-center gap-2 text-[var(--ink-2)] hover:text-[var(--accent-2)] text-[12.5px] uppercase tracking-[.14em] font-semibold mt-4"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Alışverişe Devam Et
                    </Link>
                </div>

                {/* Sticky Summary */}
                <aside className="cart-summary">
                    <div className="cs-head">
                        <h2>Sipariş Özeti</h2>
                        <div className="sub">
                            {itemCount} ürün · {totalSellerCount} tedarikçi
                        </div>
                    </div>

                    <div className="cs-body">
                        <div className="cs-row">
                            <span>Ara Toplam ({itemCount} adet)</span>
                            <b>₺{formatNumber(subtotal)}</b>
                        </div>
                        <div className="cs-row free">
                            <span>Kargo</span>
                            <b>Ücretsiz</b>
                        </div>
                        <div className="cs-row">
                            <span>KDV %20 (dahil)</span>
                            <b>₺{formatNumber(vat)}</b>
                        </div>

                        <div className="cs-promo">
                            <input
                                placeholder="İndirim kuponu"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                            />
                            <button type="button">Uygula</button>
                        </div>

                        <div className="cs-total">
                            <div className="l">Genel Toplam</div>
                            <div className="v">
                                <span className="cur">₺</span>
                                {formatNumber(subtotal)}
                            </div>
                        </div>
                        <div className="cs-note">KDV dahil</div>
                    </div>

                    <div className="cs-foot">
                        {isBelowMinOrder && (
                            <div className="pd-range mb-4">
                                <AlertCircle />
                                <span>
                                    Minimum sipariş tutarı <b>₺{formatNumber(minOrderAmount)}</b>. Sepete{' '}
                                    <b>₺{formatNumber(remainingForMinOrder)}</b> daha eklemeniz gerekiyor.
                                </span>
                            </div>
                        )}

                        {hasBlockingIssues ? (
                            <button type="button" disabled className="cs-checkout opacity-50 cursor-not-allowed">
                                Önce sorunları giderin
                            </button>
                        ) : isBelowMinOrder ? (
                            <button type="button" disabled className="cs-checkout opacity-50 cursor-not-allowed">
                                Ödemeye Geç <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <Link href="/checkout" className="cs-checkout">
                                Ödemeye Geç <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}

                        <div className="cs-secure">
                            <span className="item">
                                <ShieldCheck strokeWidth={1.5} /> SSL Güvenli
                            </span>
                            <span className="item">
                                <CreditCard strokeWidth={1.5} /> 3D Secure
                            </span>
                        </div>

                    </div>
                </aside>
            </div>

            {/* Suggested products */}
            {suggestedProducts.length > 0 && (
                <section className="max-w-[1320px] mx-auto px-8 mt-20 pb-24">
                    <div className="sec-head">
                        <div className="l">
                            <span className="eyebrow inline-flex items-center gap-3">
                                <span className="gold-rule" /> Önerilenler
                            </span>
                            <h2>Bunları da inceleyin.</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {suggestedProducts.slice(0, 4).map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}
