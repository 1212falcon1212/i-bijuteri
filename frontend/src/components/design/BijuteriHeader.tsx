"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, FormEvent } from "react";
import { Search, ScanLine, Bell, User, Heart, ShoppingBag } from "lucide-react";

interface BijuteriHeaderProps {
  /** Cart badge (when > 0 renders the gold pill) */
  cartCount?: number;
  /** Notifications badge */
  notificationCount?: number;
  /** Initial value for the search input */
  initialQuery?: string;
  /** When user submits, this fires (otherwise we route to /market/search?q=) */
  onSearch?: (value: string) => void;
  /** When the scan button is pressed (otherwise no-op) */
  onScan?: () => void;
  /** Slot to inject account dropdown (e.g. UserDropdown), replacing the default "Hesabım" icon. */
  accountSlot?: React.ReactNode;
  /** Slot to inject the notification dropdown, replacing the default bell icon. */
  notificationSlot?: React.ReactNode;
  /** Slot to inject the cart icon (e.g. MiniCart), replacing the default cart icon. */
  cartSlot?: React.ReactNode;
}

/**
 * 3-row header pattern, row 2:
 *  - Logo (gradient mark + wordmark "i-bijuteri" + tag)
 *  - Search (rounded pill with gold ring, scan button + go button)
 *  - Account icon strip (Bildirimler / Hesabım / Favorilerim / Sepetim)
 *
 * Slots allow callers (LandingHeader, MarketHeader) to drop in their existing
 * MiniCart / UserDropdown / NotificationDropdown components without rewriting.
 */
export default function BijuteriHeader({
  cartCount = 0,
  notificationCount = 0,
  initialQuery = "",
  onSearch,
  onScan,
  accountSlot,
  notificationSlot,
  cartSlot,
}: BijuteriHeaderProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    if (onSearch) {
      onSearch(trimmed);
    } else {
      router.push(`/market/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="bg-white border-b border-card-border">
      <div className="max-w-[1320px] mx-auto px-4 lg:px-8 py-4 lg:py-[22px] grid grid-cols-[auto_1fr_auto] gap-4 lg:gap-9 items-center">
        {/* ─── Logo ──────────────────────────────────────────── */}
        <Link href="/" className="flex items-center shrink-0" aria-label="i-bijuteri">
          <img
            src="/i-bijuteri-logo.webp"
            alt="i-bijuteri"
            className="block h-10 lg:h-12 w-auto object-contain"
            width={240}
            height={60}
          />
        </Link>

        {/* ─── Search ────────────────────────────────────────── */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="hidden lg:flex relative items-center bg-surface-bg border-[1.5px] border-primary rounded-full pl-5 pr-1 py-1"
          style={{
            boxShadow: "0 0 0 4px var(--color-primary-light)",
          }}
        >
          <input
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ürün, marka veya barkod ara… (min 3 karakter)"
            className="flex-1 bg-transparent border-0 outline-0 text-[14px] text-charcoal px-2 py-3 placeholder:text-charcoal-light"
          />
          <button
            type="button"
            aria-label="Barkod tara"
            onClick={onScan}
            className="w-9 h-9 rounded-full text-charcoal-mid grid place-items-center hover:text-charcoal transition-colors"
          >
            <ScanLine className="w-5 h-5" />
          </button>
          <button
            type="submit"
            aria-label="Ara"
            className="w-11 h-11 rounded-full bg-primary text-primary-foreground grid place-items-center hover:bg-primary-dark transition-colors"
          >
            <Search className="w-5 h-5" strokeWidth={2.4} />
          </button>
        </form>

        {/* ─── Account strip ─────────────────────────────────── */}
        <div className="flex items-center gap-3 lg:gap-7 shrink-0">
          {notificationSlot ?? (
            <button
              type="button"
              className="hidden md:flex flex-col items-center gap-1 text-charcoal-mid hover:text-charcoal text-[12px] cursor-pointer relative"
              aria-label="Bildirimler"
            >
              <span className="relative w-[22px] h-[22px] grid place-items-center">
                <Bell className="w-[22px] h-[22px]" strokeWidth={1.8} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-1 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold grid place-items-center">
                    {notificationCount}
                  </span>
                )}
              </span>
              <span>Bildirimler</span>
            </button>
          )}

          {accountSlot ?? (
            <Link
              href="/login"
              className="hidden md:flex flex-col items-center gap-1 text-charcoal-mid hover:text-charcoal text-[12px] cursor-pointer relative"
              aria-label="Hesabım"
            >
              <span className="relative w-[22px] h-[22px] grid place-items-center">
                <User className="w-[22px] h-[22px]" strokeWidth={1.8} />
              </span>
              <span>Hesabım</span>
            </Link>
          )}

          <Link
            href="/market/hesabim?tab=begendiklerim"
            className="hidden md:flex flex-col items-center gap-1 text-charcoal-mid hover:text-charcoal text-[12px] cursor-pointer relative"
            aria-label="Favorilerim"
          >
            <span className="relative w-[22px] h-[22px] grid place-items-center">
              <Heart className="w-[22px] h-[22px]" strokeWidth={1.8} />
            </span>
            <span>Favorilerim</span>
          </Link>

          {cartSlot ?? (
            <Link
              href="/market/sepet"
              className="flex flex-col items-center gap-1 text-charcoal-mid hover:text-charcoal text-[12px] cursor-pointer relative"
              aria-label="Sepetim"
            >
              <span className="relative w-[22px] h-[22px] grid place-items-center">
                <ShoppingBag className="w-[22px] h-[22px]" strokeWidth={1.8} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-1 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold grid place-items-center">
                    {cartCount}
                  </span>
                )}
              </span>
              <span className="hidden md:inline">Sepetim</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile search — collapses below header on small screens */}
      <form
        onSubmit={handleSubmit}
        className="lg:hidden mx-4 mb-3 relative flex items-center bg-surface-bg border-[1.5px] border-primary rounded-full pl-4 pr-1 py-1"
      >
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ürün, marka veya barkod ara…"
          className="flex-1 bg-transparent border-0 outline-0 text-[13px] text-charcoal px-2 py-2.5 placeholder:text-charcoal-light"
        />
        <button
          type="submit"
          aria-label="Ara"
          className="w-9 h-9 rounded-full bg-primary text-primary-foreground grid place-items-center"
        >
          <Search className="w-4 h-4" strokeWidth={2.4} />
        </button>
      </form>
    </div>
  );
}
