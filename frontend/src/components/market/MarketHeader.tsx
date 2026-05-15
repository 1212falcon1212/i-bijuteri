"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    User,
    Menu,
    X,
    ShoppingBag,
    LogOut,
    ChevronRight,
    Heart,
    Clock,
    Box,
    History,
    Settings,
    MessageCircle,
    ScanLine,
    Loader2,
    Store,
} from "lucide-react";
import { toast } from "sonner";
import { BarcodeScanner } from "@/components/mobile/BarcodeScanner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { MiniCart } from "@/components/cart/MiniCart";
import { NotificationDropdown } from "@/components/market/NotificationDropdown";
import Topbar from "@/components/design/Topbar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CategoryItem, cmsApi, productsApi, Product } from "@/lib/api";
import Image from "next/image";
import { getRecentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } from "@/lib/search-history";

export function MarketHeader() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchPreview, setShowSearchPreview] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [isScanLookup, setIsScanLookup] = useState(false);
    const megaMenuRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLFormElement>(null);
    const mobileSearchRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                const homepageResponse = await cmsApi.getHomepage();
                if (homepageResponse.data?.categories) {
                    setCategories(homepageResponse.data.categories);
                }
            } catch (error) {
                console.error("Failed to load data", error);
            }
        };
        loadData();
    }, []);

    const handleSearchFocus = () => {
        setIsSearchFocused(true);
        setRecentSearches(getRecentSearches());
        if (searchQuery.length < 3 && getRecentSearches().length > 0) {
            setShowSearchPreview(true);
        }
        if (searchQuery.length >= 3 && searchResults.length > 0) {
            setShowSearchPreview(true);
        }
    };

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        if (searchQuery.length >= 3) {
            setIsSearching(true);
            searchTimeoutRef.current = setTimeout(async () => {
                try {
                    const response = await productsApi.search(searchQuery, 1);
                    const products = response.data?.products || [];
                    const sorted = [...products].sort((a, b) => (b.offers_count || 0) - (a.offers_count || 0));
                    setSearchResults(sorted.slice(0, 6));
                    setShowSearchPreview(true);
                } catch (error) {
                    console.error("Search preview failed:", error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            }, 300);
        } else {
            setSearchResults([]);
            setIsSearching(false);
            if (isSearchFocused) {
                const recent = getRecentSearches();
                setRecentSearches(recent);
                setShowSearchPreview(recent.length > 0);
            } else {
                setShowSearchPreview(false);
            }
        }
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [searchQuery, isSearchFocused]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const isOutsideDesktop = searchContainerRef.current && !searchContainerRef.current.contains(target);
            const isOutsideMobile = mobileSearchRef.current && !mobileSearchRef.current.contains(target);
            const isDropdownClick = (event.target as HTMLElement).closest('[data-search-dropdown]');
            if (isOutsideDesktop && isOutsideMobile && !isDropdownClick) {
                setShowSearchPreview(false);
                setIsSearchFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const updateDropdownPosition = () => {
        const desktopRef = searchInputRef.current;
        const mobileRef = mobileSearchRef.current;
        const isDesktop = window.innerWidth >= 1024;
        const activeRef = isDesktop ? desktopRef : mobileRef;
        if (activeRef) {
            const rect = activeRef.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + 8,
                left: rect.left,
                width: rect.width,
            });
        }
    };

    useEffect(() => {
        if (showSearchPreview) updateDropdownPosition();
    }, [showSearchPreview, searchResults, recentSearches]);

    useEffect(() => {
        if (showSearchPreview) {
            const handleUpdate = () => updateDropdownPosition();
            window.addEventListener('scroll', handleUpdate, true);
            window.addEventListener('resize', handleUpdate);
            return () => {
                window.removeEventListener('scroll', handleUpdate, true);
                window.removeEventListener('resize', handleUpdate);
            };
        }
    }, [showSearchPreview]);

    const handleCategoryEnter = (categoryId: number) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
        openTimeoutRef.current = setTimeout(() => {
            setActiveCategory(categoryId);
        }, 400);
    };

    const handleCategoryLeave = () => {
        if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setActiveCategory(null);
        }, 150);
    };

    const handleMegaMenuEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            addRecentSearch(searchQuery.trim());
            setShowSearchPreview(false);
            setIsSearchFocused(false);
            router.push(`/market/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleBarcodeScan = async (code: string) => {
        if (isScanLookup) return;
        const barcode = code.trim();
        if (!barcode) return;
        setIsScanLookup(true);
        setShowScanner(false);
        try {
            const response = await productsApi.search(barcode, 1);
            const products = response.data?.products || [];
            if (products.length === 1) {
                toast.success(`Ürün bulundu: ${products[0].name}`);
                router.push(`/market/product/${products[0].id}`);
            } else if (products.length > 1) {
                addRecentSearch(barcode);
                setSearchQuery(barcode);
                router.push(`/market/search?q=${encodeURIComponent(barcode)}`);
            } else {
                toast.error(`"${barcode}" barkoduyla eşleşen ürün bulunamadı.`);
            }
        } catch (error) {
            console.error("Barcode search failed:", error);
            toast.error("Barkod aranırken bir hata oluştu.");
        } finally {
            setIsScanLookup(false);
        }
    };

    const handleRecentSearchClick = (term: string) => {
        setSearchQuery(term);
        addRecentSearch(term);
        setShowSearchPreview(false);
        setIsSearchFocused(false);
        router.push(`/market/search?q=${encodeURIComponent(term)}`);
    };

    const handleRemoveRecentSearch = (term: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        removeRecentSearch(term);
        const updated = getRecentSearches();
        setRecentSearches(updated);
        if (updated.length === 0 && searchResults.length === 0) {
            setShowSearchPreview(false);
        }
    };

    const handleClearAllRecent = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        clearRecentSearches();
        setRecentSearches([]);
        if (searchResults.length === 0) setShowSearchPreview(false);
    };

    const activeCategoryData = categories.find(c => c.id === activeCategory);
    const navCategories = categories.slice(0, 8);

    return (
        <header className="sticky top-0 z-50 bg-[var(--bg)] safe-area-top">
            {/* Row 1 — Topbar (dark noir utility bar) */}
            <Topbar />

            {/* Row 2 — Main header (3-col grid: hamburger+search / logo / icons) */}
            <div className="header">
                <div className="inner">
                    {/* Left: hamburger + minimal search */}
                    <div className="left">
                        {mounted ? (
                            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <button className="iconbtn" aria-label="Menü">
                                        <Menu className="w-5 h-5" strokeWidth={1.6} />
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[320px] p-0 bg-[var(--bg)] border-r border-[var(--line)]">
                                    <SheetHeader className="p-6 border-b border-[var(--line)]">
                                        <SheetTitle className="flex items-baseline gap-2 text-[var(--ink)]">
                                            <span className="font-display italic text-2xl font-medium">i-bijuteri</span>
                                            <span className="text-[9px] uppercase tracking-[.32em] text-[var(--ink-3)]">Menü</span>
                                        </SheetTitle>
                                    </SheetHeader>
                                    <div className="overflow-y-auto h-[calc(100vh-90px)]">
                                        <div className="p-5 border-b border-[var(--line)]">
                                            <form onSubmit={handleSearch}>
                                                <div className="search-min w-full">
                                                    <Search className="w-4 h-4 text-[var(--ink-2)]" />
                                                    <input
                                                        type="search"
                                                        placeholder="Ürün, marka veya satıcı ara…"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                    />
                                                </div>
                                            </form>
                                        </div>

                                        <div className="py-3">
                                            <div className="px-5 py-3 text-[10px] font-semibold text-[var(--ink-3)] uppercase tracking-[.26em]">
                                                Koleksiyon
                                            </div>
                                            {categories.map((category) => (
                                                <div key={category.id}>
                                                    <SheetClose asChild>
                                                        <Link
                                                            href={`/market/category/${category.full_slug || category.slug}`}
                                                            className="flex items-center justify-between px-5 py-3 text-[13.5px] text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
                                                        >
                                                            <span className="font-display italic font-medium">{category.name}</span>
                                                            {category.children && category.children.length > 0 && (
                                                                <ChevronRight className="w-3.5 h-3.5 text-[var(--ink-3)]" />
                                                            )}
                                                        </Link>
                                                    </SheetClose>
                                                    {category.children && category.children.length > 0 && (
                                                        <div className="pl-9 pb-2">
                                                            {category.children.slice(0, 6).map((child) => (
                                                                <SheetClose key={child.id} asChild>
                                                                    <Link
                                                                        href={`/market/category/${child.full_slug || child.slug}`}
                                                                        className="block py-1.5 px-3 text-[12.5px] text-[var(--ink-2)] hover:text-[var(--accent-2)] transition-colors"
                                                                    >
                                                                        {child.name}
                                                                    </Link>
                                                                </SheetClose>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-[var(--line)] py-3">
                                            <div className="px-5 py-3 text-[10px] font-semibold text-[var(--ink-3)] uppercase tracking-[.26em]">
                                                Hesap
                                            </div>
                                            <SheetClose asChild>
                                                <Link href="/market/hesabim" className="flex items-center gap-3 px-5 py-3 text-[13px] text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors">
                                                    <User className="w-4 h-4 text-[var(--ink-2)]" /> Hesabım
                                                </Link>
                                            </SheetClose>
                                            <SheetClose asChild>
                                                <Link href="/market/hesabim?tab=siparislerim" className="flex items-center gap-3 px-5 py-3 text-[13px] text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors">
                                                    <ShoppingBag className="w-4 h-4 text-[var(--ink-2)]" /> Siparişlerim
                                                </Link>
                                            </SheetClose>
                                            <SheetClose asChild>
                                                <Link href="/market/hesabim?tab=begendiklerim" className="flex items-center gap-3 px-5 py-3 text-[13px] text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors">
                                                    <Heart className="w-4 h-4 text-[var(--ink-2)]" /> Favorilerim
                                                </Link>
                                            </SheetClose>
                                        </div>

                                        {user ? (
                                            <div className="border-t border-[var(--line)] p-5">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] grid place-items-center text-[var(--accent-2)] font-display italic">
                                                        {user.business_name?.[0] || user.email?.[0] || "U"}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[13px] font-medium text-[var(--ink)] truncate">{user.business_name || 'Hesap'}</p>
                                                        <p className="text-[11px] text-[var(--ink-3)] truncate">{user.email}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghostDark"
                                                    className="w-full text-[var(--danger)] border-[var(--danger)] hover:text-[var(--danger)] hover:border-[var(--danger)]"
                                                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                                                >
                                                    <LogOut className="w-4 h-4 mr-2" /> Çıkış Yap
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="border-t border-[var(--line)] p-5">
                                                <SheetClose asChild>
                                                    <Button variant="dark" className="w-full h-12" onClick={() => router.push("/login")}>
                                                        Giriş Yap
                                                    </Button>
                                                </SheetClose>
                                            </div>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        ) : (
                            <button className="iconbtn" aria-label="Menü">
                                <Menu className="w-5 h-5" strokeWidth={1.6} />
                            </button>
                        )}

                        {/* Desktop minimal search (underline style) */}
                        <div ref={searchContainerRef} className="hidden lg:block relative flex-1 max-w-[380px]">
                            <form onSubmit={handleSearch} ref={searchInputRef}>
                                <div className="search-min w-full">
                                    <Search className="w-4 h-4 text-[var(--ink-2)]" />
                                    <input
                                        type="search"
                                        placeholder="Ürün, marka veya satıcı ara…"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={handleSearchFocus}
                                    />
                                    <button
                                        type="button"
                                        aria-label="Barkod tara"
                                        onClick={() => setShowScanner(true)}
                                        className="text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
                                    >
                                        {isScanLookup ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Center: Logo */}
                    <Link href="/market" className="logo group" aria-label="i-bijuteri">
                        <img
                            src="/i-bijuteri-logo.webp"
                            alt="i-bijuteri"
                            className="block h-14 md:h-16 w-auto object-contain"
                            width={320}
                            height={80}
                        />
                    </Link>

                    {/* Right: icons */}
                    <div className="right">
                        <NotificationDropdown />

                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="iconbtn" aria-label="Hesabım">
                                        <User className="w-[19px] h-[19px]" strokeWidth={1.6} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-72 p-2 bg-[var(--bg)] border-[var(--line)] text-[var(--ink)] shadow-card">
                                    <DropdownMenuLabel className="px-3 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-full bg-[var(--accent-soft)] grid place-items-center text-[var(--accent-2)] font-display italic text-lg">
                                                {user.business_name?.[0] || user.email?.[0] || "U"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-semibold text-[var(--ink)] truncate">{user.business_name || 'Hesap'}</p>
                                                <p className="text-[11px] text-[var(--ink-3)] truncate">{user.email}</p>
                                                {user.tax_number && (
                                                    <p className="text-[10.5px] text-[var(--ink-3)] mt-0.5 font-mono">VKN: {user.tax_number}</p>
                                                )}
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-[var(--line)]" />
                                    <DropdownMenuItem onClick={() => router.push('/market/hesabim?tab=ayarlarim')} className="focus:bg-[var(--surface-2)] py-2.5 cursor-pointer">
                                        <Settings className="mr-3 h-4 w-4 text-[var(--ink-3)]" /> Ayarlar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/market/hesabim?tab=satis-panelim')} className="focus:bg-[var(--surface-2)] py-2.5 cursor-pointer">
                                        <Store className="mr-3 h-4 w-4 text-[var(--ink-3)]" /> Satış Panelim
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/market/hesabim?tab=ilanlarim')} className="focus:bg-[var(--surface-2)] py-2.5 cursor-pointer">
                                        <Box className="mr-3 h-4 w-4 text-[var(--ink-3)]" /> İlanlarım
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/market/hesabim?tab=siparislerim')} className="focus:bg-[var(--surface-2)] py-2.5 cursor-pointer">
                                        <ShoppingBag className="mr-3 h-4 w-4 text-[var(--ink-3)]" /> Siparişlerim
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/market/hesabim?tab=begendiklerim')} className="focus:bg-[var(--surface-2)] py-2.5 cursor-pointer">
                                        <Heart className="mr-3 h-4 w-4 text-[var(--ink-3)]" /> Beğendiklerim
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/market/hesabim?tab=hesap-hareketlerim')} className="focus:bg-[var(--surface-2)] py-2.5 cursor-pointer">
                                        <History className="mr-3 h-4 w-4 text-[var(--ink-3)]" /> Hesap Hareketlerim
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/market/hesabim?tab=destek')} className="focus:bg-[var(--surface-2)] py-2.5 cursor-pointer">
                                        <MessageCircle className="mr-3 h-4 w-4 text-[var(--ink-3)]" /> Destek
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-[var(--line)]" />
                                    <DropdownMenuItem onClick={logout} className="text-[var(--danger)] focus:text-[var(--danger)] focus:bg-[var(--surface-2)] py-2.5 cursor-pointer">
                                        <LogOut className="mr-3 h-4 w-4" /> Güvenli Çıkış
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <button onClick={() => router.push("/login")} className="iconbtn" aria-label="Giriş yap">
                                <User className="w-[19px] h-[19px]" strokeWidth={1.6} />
                            </button>
                        )}

                        <Link href="/market/hesabim?tab=begendiklerim" className="iconbtn" aria-label="Favoriler">
                            <Heart className="w-[19px] h-[19px]" strokeWidth={1.6} />
                        </Link>

                        <MiniCart />
                    </div>
                </div>
            </div>

            {/* Row 3 — Cat nav (desktop only) */}
            <nav className="catnav hidden lg:block">
                <div className="inner">
                    <Link href="/market" className="active">
                        Tüm Koleksiyon
                    </Link>
                    {navCategories.length === 0 ? (
                        Array(7).fill(0).map((_, i) => (
                            <span key={i} className="py-4 px-1">
                                <span className="block h-3.5 w-20 bg-[var(--line)] animate-pulse" />
                            </span>
                        ))
                    ) : (
                        navCategories.map((category) => (
                            <div
                                key={category.id}
                                className="relative"
                                onMouseEnter={() => handleCategoryEnter(category.id)}
                                onMouseLeave={handleCategoryLeave}
                            >
                                <Link
                                    href={`/market/category/${category.full_slug || category.slug}`}
                                    className={cn(activeCategory === category.id && "active")}
                                >
                                    {category.name}
                                </Link>
                            </div>
                        ))
                    )}
                </div>

                {/* Mega menu */}
                {activeCategory && activeCategoryData && activeCategoryData.children && activeCategoryData.children.length > 0 && (
                    <div
                        key={activeCategory}
                        ref={megaMenuRef}
                        className="absolute left-0 right-0 top-full bg-[var(--bg)] border-t border-[var(--line)] border-b border-[var(--line)] z-50 animate-in fade-in slide-in-from-top-1 duration-200"
                        onMouseEnter={handleMegaMenuEnter}
                        onMouseLeave={handleCategoryLeave}
                    >
                        <div className="max-w-[1320px] mx-auto px-8 py-8">
                            <div className="flex gap-12">
                                <div className="flex-1">
                                    <p className="text-[10px] font-semibold tracking-[.26em] uppercase text-[var(--ink-3)] mb-4">
                                        {activeCategoryData.name}
                                    </p>
                                    <div className="grid grid-cols-3 gap-x-6 gap-y-1">
                                        {activeCategoryData.children.map((child) => (
                                            <Link
                                                key={child.id}
                                                href={`/market/category/${child.full_slug || child.slug}`}
                                                className="py-2 text-[13px] text-[var(--ink-2)] hover:text-[var(--accent-2)] transition-colors font-display italic"
                                            >
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {activeCategoryData.top_brands && activeCategoryData.top_brands.length > 0 && (
                                    <div className="w-72 flex-shrink-0 border-l border-[var(--line)] pl-12">
                                        <p className="text-[10px] font-semibold tracking-[.26em] uppercase text-[var(--ink-3)] mb-4">Markalar</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {activeCategoryData.top_brands.slice(0, 10).map((brand) => (
                                                <Link
                                                    key={brand.slug}
                                                    href={`/market/marka/${brand.slug}`}
                                                    className="flex items-center gap-2 py-1.5 group"
                                                >
                                                    {brand.logo ? (
                                                        <img
                                                            src={brand.logo}
                                                            alt={brand.name}
                                                            className="w-6 h-6 object-contain"
                                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <div className="w-6 h-6 bg-[var(--accent-soft)] flex items-center justify-center text-[10px] font-bold text-[var(--accent-2)]">
                                                            {brand.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span className="text-[12px] text-[var(--ink-2)] group-hover:text-[var(--accent-2)] transition-colors truncate">
                                                        {brand.name}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Desktop search preview dropdown */}
            {showSearchPreview && (
                <div
                    data-search-dropdown
                    className="hidden lg:block fixed bg-[var(--bg)] border border-[var(--line)] shadow-card z-[9999] overflow-hidden"
                    style={{
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: Math.max(dropdownPosition.width, 420),
                        maxHeight: 'calc(100vh - 200px)',
                        overflowY: 'auto',
                    }}
                >
                    {searchQuery.length < 3 && recentSearches.length > 0 && (
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-semibold text-[var(--ink-3)] uppercase tracking-[.22em] inline-flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> Son Aramalar
                                </span>
                                <button onClick={handleClearAllRecent} className="text-[10px] text-[var(--ink-3)] hover:text-[var(--danger)] transition-colors">
                                    Temizle
                                </button>
                            </div>
                            <div className="space-y-0.5">
                                {recentSearches.slice(0, 5).map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => handleRecentSearchClick(term)}
                                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--surface-2)] transition-colors group text-left"
                                    >
                                        <Search className="w-3.5 h-3.5 text-[var(--ink-3)]" />
                                        <span className="text-[13px] text-[var(--ink-2)] flex-1 truncate group-hover:text-[var(--ink)]">{term}</span>
                                        <span onClick={(e) => handleRemoveRecentSearch(term, e)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="w-3 h-3 text-[var(--ink-3)]" />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {isSearching && searchQuery.length >= 3 && (
                        <div className="flex items-center justify-center gap-2 py-8 text-[var(--ink-2)] text-[13px]">
                            <Loader2 className="w-4 h-4 animate-spin" /> Aranıyor…
                        </div>
                    )}

                    {searchResults.length > 0 && searchQuery.length >= 3 && (
                        <>
                            <div className="px-4 pt-4 pb-2">
                                <span className="text-[10px] font-semibold text-[var(--ink-3)] uppercase tracking-[.22em]">Ürünler</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 px-3 pb-3">
                                {searchResults.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/market/product/${product.id}`}
                                        onClick={() => {
                                            addRecentSearch(searchQuery);
                                            setShowSearchPreview(false);
                                            setIsSearchFocused(false);
                                            setSearchQuery("");
                                        }}
                                        className="flex flex-col items-center p-2 hover:bg-[var(--surface-2)] transition-all group border border-transparent hover:border-[var(--line)]"
                                    >
                                        <div className="relative w-full aspect-square bg-[var(--surface-2)] mb-2 overflow-hidden">
                                            {(product.image_url || product.image) ? (
                                                <Image
                                                    src={(product.image_url || product.image)!}
                                                    alt={product.name}
                                                    fill
                                                    sizes="120px"
                                                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Box className="w-7 h-7 text-[var(--ink-3)]" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[11px] font-medium text-[var(--ink)] line-clamp-2 text-center font-display italic">{product.name}</p>
                                        {product.lowest_price ? (
                                            <p className="text-[12px] font-display text-[var(--ink)] mt-1">
                                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.lowest_price)}
                                            </p>
                                        ) : null}
                                    </Link>
                                ))}
                            </div>
                            <div className="p-3 bg-[var(--surface-2)] border-t border-[var(--line)]">
                                <button
                                    onClick={() => {
                                        addRecentSearch(searchQuery);
                                        router.push(`/market/search?q=${encodeURIComponent(searchQuery)}`);
                                        setShowSearchPreview(false);
                                        setIsSearchFocused(false);
                                    }}
                                    className="w-full text-[11px] font-semibold uppercase tracking-[.18em] text-[var(--ink)] hover:text-[var(--accent-2)] py-2 inline-flex items-center justify-center gap-2"
                                >
                                    Tüm Arama Sonuçlarını Gör <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Mobile search bar */}
            <div ref={mobileSearchRef} className="lg:hidden bg-[var(--bg)] border-b border-[var(--line)] px-4 py-3">
                <form onSubmit={handleSearch}>
                    <div className="search-min w-full">
                        <Search className="w-4 h-4 text-[var(--ink-2)]" />
                        <input
                            type="search"
                            placeholder="Ürün, marka ara…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={handleSearchFocus}
                        />
                        <button
                            type="button"
                            aria-label="Barkod tara"
                            onClick={() => setShowScanner(true)}
                            className="text-[var(--ink-3)] hover:text-[var(--ink)]"
                        >
                            {isScanLookup ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
                        </button>
                    </div>
                </form>
            </div>

            {/* Mobile search preview dropdown */}
            {showSearchPreview && (
                <div
                    data-search-dropdown
                    className="lg:hidden fixed bg-[var(--bg)] border border-[var(--line)] shadow-card z-[9999] overflow-hidden"
                    style={{
                        top: dropdownPosition.top,
                        left: 12,
                        right: 12,
                        maxHeight: 'calc(100vh - 200px)',
                        overflowY: 'auto',
                    }}
                >
                    {searchQuery.length < 3 && recentSearches.length > 0 && (
                        <div className="p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-semibold text-[var(--ink-3)] uppercase tracking-[.22em] inline-flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" /> Son Aramalar
                                </span>
                                <button onClick={handleClearAllRecent} className="text-[10px] text-[var(--ink-3)] hover:text-[var(--danger)]">Temizle</button>
                            </div>
                            <div className="space-y-0.5">
                                {recentSearches.slice(0, 5).map((term) => (
                                    <button key={term} onClick={() => handleRecentSearchClick(term)} className="w-full flex items-center gap-2 px-2 py-2 hover:bg-[var(--surface-2)] text-left">
                                        <Search className="w-3.5 h-3.5 text-[var(--ink-3)]" />
                                        <span className="text-[13px] text-[var(--ink-2)] flex-1 truncate">{term}</span>
                                        <span onClick={(e) => handleRemoveRecentSearch(term, e)}>
                                            <X className="w-3 h-3 text-[var(--ink-3)]" />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {isSearching && searchQuery.length >= 3 && (
                        <div className="flex items-center justify-center gap-2 py-6 text-[var(--ink-2)] text-[13px]">
                            <Loader2 className="w-4 h-4 animate-spin" /> Aranıyor…
                        </div>
                    )}

                    {searchResults.length > 0 && searchQuery.length >= 3 && (
                        <>
                            <div className="p-2 border-b border-[var(--line)] bg-[var(--surface-2)]">
                                <span className="text-[10px] text-[var(--ink-3)] font-semibold uppercase tracking-[.22em]">Ürün Önerileri</span>
                            </div>
                            <div className="divide-y divide-[var(--line)]">
                                {searchResults.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/market/product/${product.id}`}
                                        onClick={() => {
                                            addRecentSearch(searchQuery);
                                            setShowSearchPreview(false);
                                            setIsSearchFocused(false);
                                            setSearchQuery("");
                                        }}
                                        className="flex items-center gap-3 p-3 hover:bg-[var(--surface-2)] transition-colors"
                                    >
                                        <div className="relative w-12 h-12 bg-[var(--surface-2)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {(product.image_url || product.image) ? (
                                                <Image src={(product.image_url || product.image)!} alt={product.name} fill sizes="48px" className="object-cover" />
                                            ) : (
                                                <Box className="w-5 h-5 text-[var(--ink-3)]" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-display italic text-[var(--ink)] line-clamp-1">{product.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {product.brand && <span className="text-[9px] text-[var(--ink-3)] uppercase tracking-[.18em]">{product.brand}</span>}
                                            </div>
                                        </div>
                                        {product.lowest_price ? (
                                            <p className="text-[13px] font-display text-[var(--ink)] flex-shrink-0">
                                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.lowest_price)}
                                            </p>
                                        ) : null}
                                    </Link>
                                ))}
                            </div>
                            <div className="p-3 bg-[var(--surface-2)] border-t border-[var(--line)]">
                                <button
                                    onClick={() => {
                                        addRecentSearch(searchQuery);
                                        router.push(`/market/search?q=${encodeURIComponent(searchQuery)}`);
                                        setShowSearchPreview(false);
                                        setIsSearchFocused(false);
                                    }}
                                    className="w-full text-[11px] font-semibold uppercase tracking-[.18em] text-[var(--ink)] hover:text-[var(--accent-2)] py-2 inline-flex items-center justify-center gap-2"
                                >
                                    Tüm Arama Sonuçlarını Gör <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {showScanner && (
                <BarcodeScanner
                    onScan={handleBarcodeScan}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </header>
    );
}
