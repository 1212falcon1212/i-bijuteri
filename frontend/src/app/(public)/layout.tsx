'use client';

import { MarketHeader } from '@/components/market/MarketHeader';
import { MarketFooter } from '@/components/market/MarketFooter';
import { WhatsAppBubble } from '@/components/market/WhatsAppBubble';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[var(--bg)] relative">
            <MarketHeader />
            <main className="relative">{children}</main>
            <MarketFooter />
            <WhatsAppBubble />
        </div>
    );
}
