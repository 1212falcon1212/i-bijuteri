"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import Topbar from "@/components/design/Topbar";

const NAV_ITEMS = [
  { label: "Nasıl Çalışır?", href: "#nasil-calisir" },
  { label: "Avantajlar", href: "#avantajlar" },
  { label: "Referanslar", href: "#referanslar" },
  { label: "SSS", href: "#sss" },
  { label: "İletişim", href: "/sayfa/iletisim" },
];

/**
 * Landing-page header.
 *  Public marketing variant — no marketplace catnav, no account icons.
 *  Layout: Topbar + (Logo + Nav links + Login/Register CTAs).
 *  Sticky on scroll past 40px, with mobile drawer.
 */
export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 bg-white transition-shadow duration-200",
          scrolled ? "shadow-card" : ""
        )}
      >
        {/* Row 1: Dark utility topbar */}
        <Topbar />

        {/* Row 2: Logo + Nav links + Login/Register CTAs */}
        <div className="border-b border-card-border">
          <div className="max-w-[1320px] mx-auto px-8 py-5 flex items-center justify-between gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0" aria-label="i-bijuteri">
              <img
                src="/i-bijuteri-logo.webp"
                alt="i-bijuteri"
                className="block h-10 lg:h-12 w-auto object-contain"
                width={240}
                height={60}
              />
            </Link>

            {/* Nav links — desktop */}
            <nav className="hidden lg:flex items-center gap-9">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-[14px] text-charcoal-mid font-medium hover:text-primary-dark transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* CTAs — desktop */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-full text-[14px] font-semibold text-charcoal hover:text-primary-dark transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 rounded-full bg-primary text-primary-foreground text-[14px] font-semibold hover:bg-primary-dark hover:-translate-y-px transition-all"
              >
                Ücretsiz Kayıt Ol
              </Link>
            </div>

            {/* Mobile burger */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Menüyü aç"
              className="lg:hidden p-2 rounded-lg bg-surface-bg border border-card-border text-charcoal"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={closeMobile}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-[300px] bg-white shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-card-border">
                <span className="font-display text-lg text-charcoal font-semibold">
                  Menü
                </span>
                <button
                  onClick={closeMobile}
                  className="p-2 rounded-lg hover:bg-surface-bg text-charcoal-light"
                  aria-label="Menüyü kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-5 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={closeMobile}
                    className="block px-4 py-3 rounded-xl text-charcoal-mid font-medium hover:bg-surface-bg hover:text-primary-dark transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="p-5 space-y-3 border-t border-card-border">
                <Link
                  href="/login"
                  onClick={closeMobile}
                  className="block w-full text-center px-5 py-3 rounded-xl border-2 border-card-border text-charcoal font-semibold hover:border-primary hover:text-primary-dark transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  onClick={closeMobile}
                  className="block w-full text-center px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-dark transition-colors"
                >
                  Ücretsiz Başla
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
