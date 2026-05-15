"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MarketHeader } from "@/components/market/MarketHeader";
import { MarketFooter } from "@/components/market/MarketFooter";
import { WhatsAppBubble } from "@/components/market/WhatsAppBubble";

import { useAuth } from "@/contexts/AuthContext";

export default function MarketLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [isLoading, isAuthenticated, router, pathname]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--bg)] relative">
                {/* Skeleton header to prevent CLS */}
                <header className="sticky top-0 z-50">
                    <div className="bg-[var(--noir)] hidden md:block h-[39px]" />
                    <div className="bg-[var(--bg)] border-b border-[var(--line)] h-[86px]" />
                    <div className="bg-[var(--bg)] border-b border-[var(--line)] hidden lg:block h-[48px]" />
                </header>
                <main className="relative max-w-[1320px] mx-auto px-8 py-12">
                    <div className="w-full h-[400px] bg-[var(--surface-2)] animate-pulse" />
                </main>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] relative">
            <MarketHeader />
            <main className="relative">{children}</main>
            <MarketFooter />
            <WhatsAppBubble />
        </div>
    );
}
