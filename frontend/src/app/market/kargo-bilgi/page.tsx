'use client';

import { useEffect, useState } from 'react';
import { shippingApi, ShippingConfig } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Gift, Box, Info, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function KargoBilgiPage() {
    const [config, setConfig] = useState<ShippingConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const response = await shippingApi.getConfig();
                if (response.data) {
                    setConfig(response.data);
                }
            } catch (error) {
                console.error('Failed to load shipping config:', error);
            } finally {
                setLoading(false);
            }
        };
        loadConfig();
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(price);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4B896]" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Back Button */}
            <div className="mb-6">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/market" className="flex items-center gap-2 text-charcoal-mid dark:text-charcoal-light">
                        <ArrowLeft className="h-4 w-4" />
                        Markete Dön
                    </Link>
                </Button>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-charcoal dark:text-white flex items-center gap-3">
                    <Truck className="h-7 w-7 text-[#B89968]" />
                    Kargo Bilgileri
                </h1>
                <p className="text-charcoal-light dark:text-charcoal-light mt-2">
                    Kargo ücretleri ve teslimat koşulları hakkında bilgi
                </p>
            </div>

            <div className="space-y-6">
                {/* Free Shipping Banner */}
                <Card className="border-[#D4B896] dark:border-[#8C6F3F] bg-gradient-to-r from-[#F1E6D0] to-[#F1E6D0] dark:from-[#8C6F3F]/20 dark:to-[#8C6F3F]/20">
                    <CardContent className="flex items-center gap-4 py-6">
                        <div className="w-14 h-14 bg-[#F1E6D0] dark:bg-[#8C6F3F] rounded-full flex items-center justify-center flex-shrink-0">
                            <Gift className="h-7 w-7 text-[#B89968] dark:text-[#D4B896]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#B89968] dark:text-[#D4B896]">
                                {config?.free_threshold ? formatPrice(config.free_threshold) : '2.500,00 TL'} Üzeri Ücretsiz Kargo!
                            </h2>
                            <p className="text-sm text-[#B89968] dark:text-[#D4B896] mt-1">
                                Satıcı bazında {config?.free_threshold ? formatPrice(config.free_threshold) : '2.500,00 TL'} ve üzeri siparişlerde kargo ücreti alınmaz.
                                Ücretsiz kargo hesabı her satıcı için ayrı yapılır.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* How Shipping Works */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Info className="h-5 w-5 text-[var(--accent-2)]" />
                            Kargo Nasıl Hesaplanır?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="p-4 rounded-lg bg-surface-bg dark:bg-charcoal border border-card-border dark:border-slate-700">
                                <h3 className="font-semibold text-charcoal dark:text-white mb-2 flex items-center gap-2">
                                    <Box className="h-4 w-4 text-[var(--accent-2)]" />
                                    Desi Bazlı Fiyatlandırma
                                </h3>
                                <p className="text-sm text-charcoal-mid dark:text-charcoal-light">
                                    Kargo ücreti, ürünlerin toplam desi değerine göre hesaplanır.
                                    Her kargo firmasının farklı desi fiyat tarifeleri vardır.
                                </p>
                            </div>

                            <div className="p-4 rounded-lg bg-surface-bg dark:bg-charcoal border border-card-border dark:border-slate-700">
                                <h3 className="font-semibold text-charcoal dark:text-white mb-2 flex items-center gap-2">
                                    <Truck className="h-4 w-4 text-[#B89968]" />
                                    Satıcı Bazlı Kargo
                                </h3>
                                <p className="text-sm text-charcoal-mid dark:text-charcoal-light">
                                    Her satıcı için ayrı kargo hesaplanır. Farklı satıcılardan alınan ürünler
                                    ayrı kargo paketleri olarak gönderilir.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-[#F1E6D0] dark:bg-[#8C6F3F]/20 border border-[#D4B896] dark:border-[#8C6F3F]">
                            <h3 className="font-semibold text-[#B89968] dark:text-[#D4B896] mb-2 flex items-center gap-2">
                                <Gift className="h-4 w-4" />
                                Ücretsiz Kargo Koşulu
                            </h3>
                            <p className="text-sm text-[#B89968] dark:text-[#D4B896]">
                                Bir satıcıyla olan sipariş tutarınız {config?.free_threshold ? formatPrice(config.free_threshold) : '2.500,00 TL'} ve üzerinde ise,
                                o satıcının kargo ücreti sıfırlanır. Bu kural her satıcı için ayrı değerlendirilir.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Standard Shipping Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Truck className="h-5 w-5 text-charcoal-light" />
                            Standart Kargo Ücreti
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-surface-bg dark:bg-charcoal border border-card-border dark:border-slate-700">
                            <div>
                                <p className="font-medium text-charcoal dark:text-white">Sabit Kargo Ücreti</p>
                                <p className="text-sm text-charcoal-light dark:text-charcoal-light mt-0.5">
                                    Aktif kargo firması bulunmadığında uygulanır
                                </p>
                            </div>
                            <Badge variant="secondary" className="text-base font-bold px-4 py-1.5">
                                {config?.flat_rate ? formatPrice(config.flat_rate) : '29,90 TL'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Delivery Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Box className="h-5 w-5 text-[#B89968]" />
                            Teslimat Bilgileri
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-bg dark:bg-charcoal">
                                <div className="w-8 h-8 bg-[var(--accent-soft)] dark:bg-[var(--accent-soft)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-sm font-bold text-[var(--accent-2)] dark:text-[var(--accent-2)]">1</span>
                                </div>
                                <div>
                                    <p className="font-medium text-charcoal dark:text-white">Sipariş Onayı</p>
                                    <p className="text-sm text-charcoal-light dark:text-charcoal-light">Siparişleriniz satıcı tarafından 24 saat içinde onaylanır.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-bg dark:bg-charcoal">
                                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">2</span>
                                </div>
                                <div>
                                    <p className="font-medium text-charcoal dark:text-white">Hazırlama ve Kargoya Verme</p>
                                    <p className="text-sm text-charcoal-light dark:text-charcoal-light">Onaylanan siparişler 1-2 iş günü içinde kargoya verilir.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-bg dark:bg-charcoal">
                                <div className="w-8 h-8 bg-[#F1E6D0] dark:bg-[#8C6F3F]/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-sm font-bold text-[#B89968] dark:text-[#D4B896]">3</span>
                                </div>
                                <div>
                                    <p className="font-medium text-charcoal dark:text-white">Teslimat</p>
                                    <p className="text-sm text-charcoal-light dark:text-charcoal-light">Kargo süreci 1-3 iş günü içerisinde tamamlanır. Kargo takip numarası ile gönderi durumunuzu takip edebilirsiniz.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
