<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Filament\Pages\LandingPageSettings;
use App\Filament\Pages\MarketHomeSettings;
use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\HomepageSection;
use App\Models\NavigationMenu;
use App\Models\Page;
use App\Models\Product;
use App\Models\Setting;
use App\Services\BrandService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

/**
 * CMS Controller - Ana sayfa ve layout verilerini yonetir
 */
class CmsController extends Controller
{
    /**
     * Cache suresi (dakika)
     */
    private const CACHE_TTL = 30;

    private const CACHE_KEYS = [
        'cms.layout',
        'cms.homepage.seo_text',
        'cms.homepage.sections',
        'cms.homepage.categories',
        'cms.homepage.category_sections',
        'cms.homepage.best_sellers.12',
        'cms.homepage.recommended.12',
        'cms.homepage.featured_categories',
        'cms.homepage.footer_pages',
        'cms.featured_sections',
        'cms.homepage.market_home',
    ];

    private const CACHE_PREFIXES = [
        'cms.banners.',
        'cms.page.',
        'cms.pages.category.',
    ];

    /**
     * Tum CMS cache'lerini temizler (deploy sonrasi kullanilir)
     */
    public static function clearAllCaches(): int
    {
        $cleared = 0;

        foreach (self::CACHE_KEYS as $key) {
            Cache::forget($key);
            $cleared++;
        }

        // Banner location caches
        foreach (['hero', 'promo', 'middle', 'brand', 'grid', 'bottom', 'showcase'] as $loc) {
            Cache::forget("cms.banners.{$loc}");
            $cleared++;
        }

        return $cleared;
    }

    public function __construct(
        private readonly BrandService $brandService
    ) {}

    /**
     * Layout verilerini getirir (menuler, site ayarlari)
     * MarketplaceHeader ve Footer componentleri icin
     */
    public function layout(): JsonResponse
    {
        $data = Cache::remember('cms.layout', self::CACHE_TTL * 60, function () {
            $headerMenu = NavigationMenu::getMenuTree('header');
            $footerMenu = NavigationMenu::getMenuTree('footer');
            $categoriesMenu = NavigationMenu::getMenuTree('categories_dropdown');
            $mobileMenu = NavigationMenu::getMenuTree('mobile_menu');

            return [
                'menus' => [
                    'header' => $headerMenu,
                    'footer' => $footerMenu,
                    'categories' => $categoriesMenu,
                    'mobile' => $mobileMenu,
                ],
                'settings' => [
                    'site_name' => config('app.name', 'i-Bijuteri'),
                    'logo_url' => asset('images/logo.webp'),
                    'show_top_bar' => Setting::getValue('show_top_bar', false),
                    'top_bar_phone' => Setting::getValue('top_bar_phone', '0850 XXX XX XX'),
                    'top_bar_hours' => Setting::getValue('top_bar_hours', 'Hafta içi 09:00 - 18:00'),
                    'top_bar_shipping' => Setting::getValue('top_bar_shipping', 'Türkiye geneli ücretsiz kargo'),
                    'navbar_color' => Setting::getValue('navbar_color', '#065f46'),
                    'whatsapp_phone' => Setting::getValue('whatsapp_phone', ''),
                    'whatsapp_message' => Setting::getValue('whatsapp_message', 'Merhaba, bilgi almak istiyorum.'),
                ],
                'topbar' => [
                    'enabled' => (bool) Setting::getValue('topbar.enabled', true),
                    'shipping_text' => Setting::getValue('topbar.shipping_text', 'Türkiye geneli ücretsiz kargo'),
                    'hours_text' => Setting::getValue('topbar.hours_text', 'Hafta içi 09:00 – 18:00'),
                    'phone' => Setting::getValue('topbar.phone', '0 542 848 26 46'),
                    'seller_link_text' => Setting::getValue('topbar.seller_link_text', 'Nasıl Satıcı Olurum?'),
                    'seller_link_url' => Setting::getValue('topbar.seller_link_url', '/yardim'),
                    'contact_link_text' => Setting::getValue('topbar.contact_link_text', 'İletişim'),
                    'contact_link_url' => Setting::getValue('topbar.contact_link_url', '/iletisim'),
                    'announcement_enabled' => (bool) Setting::getValue('topbar.announcement_enabled', false),
                    'announcement_text' => Setting::getValue('topbar.announcement_text', ''),
                ],
                'commerce' => [
                    'min_order_amount' => (float) Setting::getValue('commission.min_order_amount', 500),
                    'commission_enabled' => (bool) Setting::getValue('commission.enabled', true),
                ],
                'footer_settings' => [
                    'description' => Setting::getValue('footer.description', "Türkiye'nin en güvenilir B2B tedarik platformu. Güvenli ve hızlı ürün tedarikiniz için tek adres."),
                    'phone' => Setting::getValue('footer.phone', '0850 123 45 67'),
                    'phone_raw' => Setting::getValue('footer.phone_raw', '08501234567'),
                    'email' => Setting::getValue('footer.email', 'info@i-bijuteri.com'),
                    'address' => Setting::getValue('footer.address', 'İstanbul, Türkiye'),
                    'hours_weekday' => Setting::getValue('footer.hours_weekday', '09:00 - 18:00'),
                    'hours_saturday' => Setting::getValue('footer.hours_saturday', '10:00 - 14:00'),
                    'hours_sunday' => Setting::getValue('footer.hours_sunday', 'Kapalı'),
                    'copyright' => Setting::getValue('footer.copyright', 'i-bijuteri.com. Tüm hakları saklıdır.'),
                    'pharmacist_note' => Setting::getValue('footer.pharmacist_note', 'Doğrulanmış B2B satıcılar için'),
                    'facebook_url' => Setting::getValue('footer.facebook_url', ''),
                    'twitter_url' => Setting::getValue('footer.twitter_url', ''),
                    'instagram_url' => Setting::getValue('footer.instagram_url', ''),
                    'linkedin_url' => Setting::getValue('footer.linkedin_url', ''),
                ],
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * Ana sayfa verilerini getirir (bannerlar, sectionlar, markalar)
     */
    public function homepage(): JsonResponse
    {
        // Hero bannerlar
        $heroBanners = $this->getBannersByLocation('home_hero');

        // Promo bannerlar (2'li - Hero altı)
        $promoBanners = $this->getBannersByLocation('home_promo');

        // Orta bannerlar
        $middleBanners = $this->getBannersByLocation('home_middle');

        // Marka bolumu bannerlari
        $brandBanners = $this->getBannersByLocation('home_brand');

        // Grid bannerlar (2x2)
        $gridBanners = $this->getBannersByLocation('home_grid');

        // Alt bannerlar
        $bottomBanners = $this->getBannersByLocation('home_bottom');

        // Vitrin bannerlari (3'lu grid)
        $showcaseBanners = $this->getBannersByLocation('home_showcase');

        // Homepage sectionlar (product carousels)
        $sections = $this->getHomepageSections();

        // Kategoriler
        $categories = $this->getCategories();

        // Ana sayfada one cikan kategoriler (admin'den show_on_homepage=true ile isaretlenmis)
        $featuredCategories = $this->getFeaturedCategories();

        // One cikan markalar
        $featuredBrands = $this->brandService->getFeaturedBrands(12);

        // En cok satanlar
        $bestSellers = $this->getBestSellers();

        // Onerilen urunler (featured)
        $recommended = $this->getRecommendedProducts();

        // Kategori bazli urun sectionlari
        $categorySections = Cache::remember('cms.homepage.category_sections', self::CACHE_TTL * 60, function () {
            return $this->getCategoryProducts();
        });

        // SEO tanitim yazisi
        $seoText = Cache::remember('cms.homepage.seo_text', self::CACHE_TTL * 60, fn () => [
            'title' => Setting::getValue('seo_text.title', \App\Filament\Pages\SeoTextSettingsPage::DEFAULT_TITLE),
            'content' => Setting::getValue('seo_text.content', \App\Filament\Pages\SeoTextSettingsPage::DEFAULT_CONTENT),
        ]);

        // Pazaryeri (/market) ana sayfa metinleri
        $marketHome = Cache::remember('cms.homepage.market_home', self::CACHE_TTL * 60, fn () => $this->getMarketHomeContent());

        // Footer link grouplari (kurumsal, legal, yardim)
        $footerPages = Cache::remember('cms.homepage.footer_pages', self::CACHE_TTL * 60, fn () => [
            'kurumsal' => Page::query()
                ->where('category', 'kurumsal')
                ->published()
                ->orderBy('sort_order')
                ->orderBy('title')
                ->get(['title', 'slug'])
                ->toArray(),
            'legal' => Page::query()
                ->where('category', 'legal')
                ->published()
                ->orderBy('sort_order')
                ->orderBy('title')
                ->get(['title', 'slug'])
                ->toArray(),
            'yardim' => Page::query()
                ->where('category', 'yardim')
                ->published()
                ->orderBy('sort_order')
                ->orderBy('title')
                ->get(['title', 'slug'])
                ->toArray(),
        ]);

        return response()->json([
            'banners' => [
                'hero' => $heroBanners,
                'promo' => $promoBanners,
                'middle' => $middleBanners,
                'brand' => $brandBanners,
                'grid' => $gridBanners,
                'bottom' => $bottomBanners,
                'showcase' => $showcaseBanners,
            ],
            'sections' => $sections,
            'categories' => $categories,
            'featured_categories' => $featuredCategories,
            'brands' => $this->brandService->formatForApi($featuredBrands),
            'best_sellers' => $bestSellers,
            'recommended' => $recommended,
            'category_sections' => $categorySections,
            'seo_text' => $seoText,
            'market_home' => $marketHome,
            'footer' => [
                'pages' => $footerPages,
            ],
        ]);
    }

    /**
     * Pazaryeri ana sayfa içerik bloklarını yapılandırılmış halde döndürür.
     *
     * @return array<string, mixed>
     */
    private function getMarketHomeContent(): array
    {
        $defaults = MarketHomeSettings::defaults();
        $values = [];

        foreach ($defaults as $key => $default) {
            $fieldKey = str_replace('market.', '', $key);
            $values[$fieldKey] = Setting::getValue($key, $default);
        }

        $sellers = Setting::getValue('market.sellers', MarketHomeSettings::defaultSellers());
        if (is_string($sellers)) {
            $decoded = json_decode($sellers, true);
            $sellers = is_array($decoded) ? $decoded : MarketHomeSettings::defaultSellers();
        }

        $ctaSplitImage = $values['cta_split_image'] ?? null;
        $ctaSplitImageUrl = null;
        if (! empty($ctaSplitImage)) {
            $ctaSplitImageUrl = str_starts_with((string) $ctaSplitImage, 'http')
                ? (string) $ctaSplitImage
                : '/storage/'.ltrim((string) $ctaSplitImage, '/');
        }

        return [
            'hero' => [
                'eyebrow' => $values['hero_eyebrow'],
                'title_prefix' => $values['hero_title_prefix'],
                'title_em' => $values['hero_title_em'],
                'title_suffix' => $values['hero_title_suffix'],
                'description' => $values['hero_description'],
                'cta_primary' => [
                    'text' => $values['hero_cta_primary_text'],
                    'url' => $values['hero_cta_primary_url'],
                ],
                'cta_secondary' => [
                    'text' => $values['hero_cta_secondary_text'],
                    'url' => $values['hero_cta_secondary_url'],
                ],
                'trustline' => [
                    $values['hero_trust1'],
                    $values['hero_trust2'],
                    $values['hero_trust3'],
                ],
                'tag' => [
                    'label' => $values['hero_tag_label'],
                    'title' => $values['hero_tag_title'],
                    'meta' => $values['hero_tag_meta'],
                ],
            ],
            'trust_strip' => [
                ['title' => $values['trust1_title'], 'subtitle' => $values['trust1_subtitle']],
                ['title' => $values['trust2_title'], 'subtitle' => $values['trust2_subtitle']],
                ['title' => $values['trust3_title'], 'subtitle' => $values['trust3_subtitle']],
                ['title' => $values['trust4_title'], 'subtitle' => $values['trust4_subtitle']],
            ],
            'categories_section' => [
                'eyebrow' => $values['cats_eyebrow'],
                'title' => $values['cats_title'],
                'description' => $values['cats_description'],
                'link_text' => $values['cats_link_text'],
            ],
            'editorial_banner' => [
                'eyebrow' => $values['banner_eyebrow'],
                'title_prefix' => $values['banner_title_prefix'],
                'title_em' => $values['banner_title_em'],
                'title_suffix' => $values['banner_title_suffix'],
                'description' => $values['banner_description'],
                'stats' => [
                    ['value' => $values['banner_stat1_value'], 'label' => $values['banner_stat1_label']],
                    ['value' => $values['banner_stat2_value'], 'label' => $values['banner_stat2_label']],
                    ['value' => $values['banner_stat3_value'], 'label' => $values['banner_stat3_label']],
                ],
                'cta' => [
                    'text' => $values['banner_cta_text'],
                    'url' => $values['banner_cta_url'],
                ],
            ],
            'featured_products' => [
                'eyebrow' => $values['products_eyebrow'],
                'title' => $values['products_title'],
                'tab_all_label' => $values['products_tab_all_label'],
            ],
            'sellers_section' => [
                'eyebrow' => $values['sellers_eyebrow'],
                'title' => $values['sellers_title'],
                'description' => $values['sellers_description'],
                'cta_text' => $values['sellers_cta_text'],
                'items' => $sellers,
            ],
            'cta_split' => [
                'eyebrow' => $values['cta_split_eyebrow'],
                'title' => $values['cta_split_title'],
                'description' => $values['cta_split_description'],
                'stats' => [
                    ['value' => $values['cta_split_stat1_value'], 'label' => $values['cta_split_stat1_label']],
                    ['value' => $values['cta_split_stat2_value'], 'label' => $values['cta_split_stat2_label']],
                    ['value' => $values['cta_split_stat3_value'], 'label' => $values['cta_split_stat3_label']],
                ],
                'cta' => [
                    'text' => $values['cta_split_cta_text'],
                    'url' => $values['cta_split_cta_url'],
                ],
                'image_url' => $ctaSplitImageUrl,
            ],
        ];
    }

    /**
     * Belirli lokasyondaki bannerlari getirir
     */
    public function banners(string $location): JsonResponse
    {
        $banners = $this->getBannersByLocation($location);

        return response()->json([
            'status' => 'success',
            'data' => $banners,
        ]);
    }

    /**
     * Belirli lokasyondaki banner listesini getirir
     */
    private function getBannersByLocation(string $location): array
    {
        return Cache::remember("cms.banners.{$location}", self::CACHE_TTL * 60, function () use ($location) {
            return Banner::active()
                ->location($location)
                ->ordered()
                ->get()
                ->map(fn ($banner) => [
                    'id' => $banner->id,
                    'title' => $banner->title,
                    'subtitle' => $banner->subtitle,
                    'badge_text' => $banner->badge_text,
                    'image_url' => $banner->image_url,
                    'link_url' => $banner->link_url,
                    'button_text' => $banner->button_text,
                    'tab_name' => $banner->tab_name,
                    'bg_color' => $banner->bg_color,
                ])
                ->toArray();
        });
    }

    /**
     * Homepage sectionlarini getirir
     */
    private function getHomepageSections(): array
    {
        return Cache::remember('cms.homepage.sections', self::CACHE_TTL * 60, function () {
            return HomepageSection::active()
                ->ordered()
                ->get()
                ->map(fn ($section) => [
                    'id' => $section->id,
                    'title' => $section->title,
                    'subtitle' => $section->subtitle,
                    'type' => $section->type,
                    'settings' => $section->settings,
                    'products' => $this->getSectionProducts($section),
                ])
                ->toArray();
        });
    }

    /**
     * Kategorileri getirir
     */
    private function getCategories(): array
    {
        return Cache::remember('cms.homepage.categories', self::CACHE_TTL * 60, function () {
            $categories = Category::where('is_active', true)
                ->whereNull('parent_id')
                ->with([
                    'children' => function ($q) {
                        $q->where('is_active', true)->orderBy('sort_order');
                    },
                ])
                ->orderBy('sort_order')
                ->take(10)
                ->get();

            // Fallback brands: random 10 active brands with logos
            $fallbackBrands = Brand::active()
                ->whereNotNull('logo_url')
                ->where('logo_url', '!=', '')
                ->inRandomOrder()
                ->take(10)
                ->get(['name', 'slug', 'logo_url'])
                ->map(fn ($b) => [
                    'name' => $b->name,
                    'slug' => $b->slug,
                    'logo' => $b->logo_full_url,
                ])
                ->toArray();

            return $categories->map(function ($cat) use ($fallbackBrands) {
                // Get top brands for this category from products
                $categoryIds = $cat->getDescendantIds();
                $topBrandNames = Product::whereIn('category_id', $categoryIds)
                    ->active()
                    ->whereNotNull('brand')
                    ->where('brand', '!=', '')
                    ->selectRaw('brand, COUNT(*) as cnt')
                    ->groupBy('brand')
                    ->orderByDesc('cnt')
                    ->take(10)
                    ->pluck('brand')
                    ->toArray();

                $topBrands = [];
                if (! empty($topBrandNames)) {
                    $topBrands = Brand::active()
                        ->whereIn('name', $topBrandNames)
                        ->whereNotNull('logo_url')
                        ->where('logo_url', '!=', '')
                        ->get(['name', 'slug', 'logo_url'])
                        ->map(fn ($b) => [
                            'name' => $b->name,
                            'slug' => $b->slug,
                            'logo' => $b->logo_full_url,
                        ])
                        ->toArray();
                }

                $iconUrl = null;
                if (! empty($cat->icon)) {
                    $iconUrl = str_starts_with((string) $cat->icon, 'http')
                        ? (string) $cat->icon
                        : '/storage/'.ltrim((string) $cat->icon, '/');
                }

                return [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'slug' => $cat->slug,
                    'icon' => $iconUrl,
                    'products_count' => $cat->products_count ?? 0,
                    'top_brands' => ! empty($topBrands) ? array_slice($topBrands, 0, 10) : $fallbackBrands,
                    'children' => $cat->children->map(fn ($child) => [
                        'id' => $child->id,
                        'name' => $child->name,
                        'slug' => $child->slug,
                        'products_count' => $child->products_count ?? 0,
                    ]),
                ];
            })->toArray();
        });
    }

    /**
     * Ana sayfada one cikan kategorileri getirir (show_on_homepage=true ile isaretli olanlar)
     *
     * @return array<int, array{id:int,name:string,slug:string,full_slug:?string,image:?string,product_count:int}>
     */
    private function getFeaturedCategories(): array
    {
        return Cache::remember('cms.homepage.featured_categories', self::CACHE_TTL * 60, function () {
            $hasSortOrder = \Illuminate\Support\Facades\Schema::hasColumn('categories', 'sort_order');
            $hasImage = \Illuminate\Support\Facades\Schema::hasColumn('categories', 'image');

            $query = Category::query()
                ->where('show_on_homepage', true)
                ->where('is_active', true)
                ->whereNull('parent_id')
                ->withCount('products')
                ->limit(8);

            if ($hasSortOrder) {
                $query->orderBy('sort_order');
            } else {
                $query->orderBy('id');
            }

            return $query->get()
                ->map(fn ($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'slug' => $c->slug,
                    'full_slug' => $c->full_slug ?? null,
                    'image' => $hasImage ? ($c->image ?? null) : null,
                    'product_count' => $c->products_count ?? 0,
                ])
                ->toArray();
        });
    }

    /**
     * En cok satan urunleri getirir
     * Teklifli urunler her zaman en ustte
     */
    private function getBestSellers(int $limit = 12): array
    {
        return Cache::remember("cms.homepage.best_sellers.{$limit}", self::CACHE_TTL * 60, function () use ($limit) {
            // Get products with active offers first, sorted by offer count
            $products = Product::with([
                'category',
                'offers' => function ($q) {
                    $q->where('status', 'active')->where('stock', '>', 0)->orderBy('price');
                },
            ])
                ->active()
                ->withCount(['activeOffers as offers_count'])
                ->withCount('orderItems')
                ->orderByDesc('offers_count')  // Teklifli olanlar en ustte
                ->orderByDesc('order_items_count')
                ->take($limit)
                ->get();

            return $products->map(fn ($product) => $this->formatProductForApi($product))->toArray();
        });
    }

    /**
     * Onerilen urunleri getirir
     * Teklifli urunler her zaman en ustte
     */
    private function getRecommendedProducts(int $limit = 12): array
    {
        return Cache::remember("cms.homepage.recommended.{$limit}", self::CACHE_TTL * 60, function () use ($limit) {
            return Product::with([
                'category',
                'offers' => function ($q) {
                    $q->where('status', 'active')->where('stock', '>', 0)->orderBy('price');
                },
            ])
                ->active()
                ->withCount(['activeOffers as offers_count'])
                ->orderByDesc('offers_count')
                ->take($limit * 3)
                ->get()
                ->shuffle()
                ->take($limit)
                ->map(fn ($product) => $this->formatProductForApi($product))
                ->toArray();
        });
    }

    /**
     * Kategori bazli urun sectionlarini getirir
     * Ana sayfa icin hedeflenen kategorilerdeki urunleri dondurur
     */
    private function getCategoryProducts(int $limit = 6): array
    {
        $categories = Category::where('is_active', true)
            ->where('show_on_homepage', true)
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();

        $sections = [];

        foreach ($categories as $category) {

            $categoryIds = $category->getDescendantIds();

            $products = Product::with([
                'category',
                'offers' => function ($q) {
                    $q->where('status', 'active')
                        ->where('stock', '>', 0)
                        ->orderBy('price');
                },
            ])
                ->active()
                ->whereIn('category_id', $categoryIds)
                ->withCount(['activeOffers as offers_count'])
                ->orderByDesc('offers_count')
                ->take($limit * 3)
                ->get()
                ->shuffle()
                ->take($limit);

            if ($products->isNotEmpty()) {
                $sections[] = [
                    'category_id' => $category->id,
                    'category_name' => $category->name,
                    'category_slug' => $category->slug,
                    'products' => $products->map(fn ($product) => $this->formatProductForApi($product))->values()->toArray(),
                ];
            }
        }

        return $sections;
    }

    /**
     * Section icin urunleri getirir
     * Teklifli urunler her zaman en ustte
     */
    private function getSectionProducts(HomepageSection $section): array
    {
        $limit = $section->getSetting('limit', 12);
        $categoryId = $section->getSetting('category_id');

        $query = Product::with([
            'category',
            'offers' => function ($q) {
                $q->where('status', 'active')->where('stock', '>', 0)->orderBy('price');
            },
        ])
            ->active()
            ->withCount(['activeOffers as offers_count']);

        $usePhpShuffle = false;

        switch ($section->type) {
            case 'best_sellers':
            case 'regional_bestsellers':
                $query->withCount('orderItems')
                    ->orderByDesc('offers_count')
                    ->orderByDesc('order_items_count');
                break;

            case 'new_arrivals':
                $query->orderByDesc('offers_count')
                    ->orderByDesc('created_at');
                break;

            case 'deals':
            case 'featured_products':
            case 'recommended':
                $query->orderByDesc('offers_count');
                $usePhpShuffle = true;
                break;

            case 'product_carousel':
            default:
                if ($categoryId) {
                    $query->where('category_id', $categoryId);
                }
                $query->orderByDesc('offers_count');
                $usePhpShuffle = true;
                break;
        }

        $pool = $usePhpShuffle ? $limit * 3 : $limit;

        $results = $query->take($pool)->get();

        if ($usePhpShuffle) {
            $results = $results->shuffle()->take($limit);
        }

        return $results
            ->map(fn ($product) => $this->formatProductForApi($product))
            ->toArray();
    }

    /**
     * Urun verisini API formati icin hazirlar
     */
    private function formatProductForApi(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'barcode' => $product->barcode,
            'brand' => $product->brand,
            'image' => $product->image,
            'image_url' => $product->image_url,
            'category' => $product->category?->name,
            'category_slug' => $product->category?->slug,
            'lowest_price' => $product->offers->first()?->price,
            'offers_count' => $product->offers->count(),
        ];
    }

    /**
     * Ana sayfa featured sections verilerini getirir
     * Sezonun Öne Çıkanları, Haftanın Ürünleri, Son Satılanlar, Günün Fırsatı
     */
    public function featuredSections(): JsonResponse
    {
        $cached = Cache::remember('cms.featured_sections', self::CACHE_TTL * 60, function () {
            return [
                'season_highlights' => $this->getSeasonHighlights(),
                'week_products' => $this->getWeekProducts(),
                'deal_of_day' => $this->getDealOfDay(),
            ];
        });

        // Son Satılanlar her istekte random gelsin
        $cached['recently_sold'] = $this->getRecentlySold();

        return response()->json($cached);
    }

    /**
     * Sezonun Öne Çıkanları - Aktif ilanı olan rastgele ürünler
     */
    private function getSeasonHighlights(int $limit = 5): array
    {
        return \App\Models\Offer::with(['product:id,name,barcode,brand,image', 'seller:id,business_name,nickname'])
            ->active()
            ->inStock()
            ->whereHas('product', fn ($q) => $q->where('is_active', true))
            ->latest('id')
            ->take($limit * 4)
            ->get()
            ->shuffle()
            ->take($limit)
            ->map(fn ($offer) => $this->formatOfferForFeatured($offer))
            ->toArray();
    }

    /**
     * Haftanın Ürünleri - Aktif ilanı olan rastgele ürünler
     */
    private function getWeekProducts(int $limit = 5): array
    {
        return \App\Models\Offer::with(['product:id,name,barcode,brand,image', 'seller:id,business_name,nickname'])
            ->active()
            ->inStock()
            ->whereHas('product', fn ($q) => $q->where('is_active', true))
            ->latest('id')
            ->take($limit * 4)
            ->get()
            ->shuffle()
            ->take($limit)
            ->map(fn ($offer) => $this->formatOfferForFeatured($offer))
            ->toArray();
    }

    /**
     * Son Satılanlar - Aktif ilanı olan rastgele ürünler
     */
    private function getRecentlySold(int $limit = 6): array
    {
        return \App\Models\Offer::with(['product:id,name,barcode,brand,image', 'seller:id,business_name,nickname'])
            ->active()
            ->inStock()
            ->whereHas('product', fn ($q) => $q->where('is_active', true))
            ->inRandomOrder()
            ->take($limit)
            ->get()
            ->map(fn ($offer) => [
                'id' => $offer->id,
                'product_id' => $offer->product_id,
                'name' => $offer->product?->name ?? 'Ürün',
                'price' => (float) $offer->price,
                'stock' => $offer->stock,
                'image' => $offer->product?->image,
                'image_url' => $offer->product?->image_url,
            ])
            ->toArray();
    }

    /**
     * Günün Fırsatı - En düşük fiyatlı aktif ilan
     */
    private function getDealOfDay(): ?array
    {
        $offer = \App\Models\Offer::with(['product:id,name,barcode,brand,image', 'seller:id,business_name,nickname'])
            ->active()
            ->inStock()
            ->whereHas('product', fn ($q) => $q->where('is_active', true))
            ->orderBy('price', 'asc')
            ->first();

        if (! $offer) {
            return null;
        }

        return $this->formatOfferForFeatured($offer);
    }

    /**
     * Statik sayfayi slug ile getirir
     */
    public function page(string $slug): JsonResponse
    {
        $page = Cache::remember("cms.page.{$slug}", self::CACHE_TTL * 60, function () use ($slug) {
            $page = Page::published()->where('slug', $slug)->first();

            if (! $page) {
                return null;
            }

            return [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'content' => $page->content,
                'excerpt' => $page->excerpt,
                'meta_title' => $page->meta_title,
                'meta_description' => $page->meta_description,
                'category' => $page->category,
                'template' => $page->template,
                'updated_at' => $page->updated_at,
            ];
        });

        if (! $page) {
            return response()->json(['status' => 'error', 'message' => 'Sayfa bulunamadi'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $page,
            'page' => $page,
        ]);
    }

    /**
     * Belirli bir kategorideki sayfalari listeler (kurumsal, legal, yardim)
     */
    public function pagesByCategory(string $category): JsonResponse
    {
        $pages = Cache::remember(
            "cms.pages.category.{$category}",
            self::CACHE_TTL * 60,
            fn () => Page::query()
                ->where('category', $category)
                ->published()
                ->orderBy('sort_order')
                ->orderBy('title')
                ->get(['id', 'title', 'slug', 'excerpt', 'category', 'updated_at'])
                ->toArray()
        );

        return response()->json([
            'status' => 'success',
            'data' => $pages,
            'pages' => $pages,
        ]);
    }

    /**
     * Landing sayfa iceriklerini getirir (public endpoint)
     */
    public function landingContent(): JsonResponse
    {
        $defaults = LandingPageSettings::defaults();

        $get = function (string $key) use ($defaults): mixed {
            return Setting::getValue($key, $defaults[$key] ?? null);
        };

        $imageUrl = function (string $key) use ($get): ?string {
            $value = $get($key);

            return $value ? asset('storage/'.$value) : null;
        };

        // Response mapped to frontend LandingContent interface
        return response()->json([
            'hero' => [
                'title' => $get('landing.hero_title'),
                'subtitle' => $get('landing.hero_subtitle'),
                'image' => $imageUrl('landing.hero_image'),
                'cta_primary_text' => $get('landing.hero_cta_text'),
            ],
            'advantages' => [
                'section_title' => $get('landing.why_title'),
                'features' => [
                    [
                        'title' => $get('landing.why_card1_title'),
                        'description' => $get('landing.why_card1_desc'),
                        'image' => $imageUrl('landing.why_card1_image'),
                    ],
                    [
                        'title' => $get('landing.why_card2_title'),
                        'description' => $get('landing.why_card2_desc'),
                        'image' => $imageUrl('landing.why_card2_image'),
                    ],
                    [
                        'title' => $get('landing.why_card3_title'),
                        'description' => $get('landing.why_card3_desc'),
                        'image' => $imageUrl('landing.why_card3_image'),
                    ],
                ],
            ],
            'how_it_works' => [
                'section_title' => $get('landing.how_it_works_title', '3 Adımda Ticarete Başlayın'),
                'steps' => [
                    [
                        'title' => $get('landing.feature1_title'),
                        'description' => $get('landing.feature1_desc'),
                        'image' => $imageUrl('landing.feature1_image'),
                    ],
                    [
                        'title' => $get('landing.feature2_title'),
                        'description' => $get('landing.feature2_desc'),
                        'image' => $imageUrl('landing.feature2_image'),
                    ],
                    [
                        'title' => $get('landing.feature3_title'),
                        'description' => $get('landing.feature3_desc'),
                        'image' => $imageUrl('landing.feature3_image'),
                    ],
                ],
            ],
            'testimonials' => [
                'items' => [
                    [
                        'author' => $get('landing.testimonial1_name'),
                        'role' => $get('landing.testimonial1_title'),
                        'quote' => $get('landing.testimonial1_quote'),
                        'photo' => $imageUrl('landing.testimonial1_photo'),
                    ],
                    [
                        'author' => $get('landing.testimonial2_name'),
                        'role' => $get('landing.testimonial2_title'),
                        'quote' => $get('landing.testimonial2_quote'),
                        'photo' => $imageUrl('landing.testimonial2_photo'),
                    ],
                    [
                        'author' => $get('landing.testimonial3_name'),
                        'role' => $get('landing.testimonial3_title'),
                        'quote' => $get('landing.testimonial3_quote'),
                        'photo' => $imageUrl('landing.testimonial3_photo'),
                    ],
                ],
            ],
            'cta' => [
                'title' => $get('landing.cta_title'),
                'subtitle' => $get('landing.cta_subtitle'),
            ],
            'stats' => [
                'items' => [
                    [
                        'label' => $get('landing.stat1_label'),
                        'value' => (int) preg_replace('/[^0-9]/', '', $get('landing.stat1_value') ?? '0'),
                        'suffix' => preg_replace('/[0-9.]/', '', $get('landing.stat1_value') ?? ''),
                    ],
                    [
                        'label' => $get('landing.stat2_label'),
                        'value' => (int) preg_replace('/[^0-9]/', '', $get('landing.stat2_value') ?? '0'),
                        'suffix' => preg_replace('/[0-9.]/', '', $get('landing.stat2_value') ?? ''),
                    ],
                    [
                        'label' => $get('landing.stat3_label'),
                        'value' => (int) preg_replace('/[^0-9]/', '', $get('landing.stat3_value') ?? '0'),
                        'suffix' => preg_replace('/[0-9.]/', '', $get('landing.stat3_value') ?? ''),
                    ],
                    [
                        'label' => $get('landing.stat4_label'),
                        'value' => (int) preg_replace('/[^0-9]/', '', $get('landing.stat4_value') ?? '0'),
                        'suffix' => preg_replace('/[0-9.]/', '', $get('landing.stat4_value') ?? ''),
                    ],
                ],
            ],
        ]);
    }

    /**
     * Offer verisini featured sections API formatı için hazırlar
     */
    private function formatOfferForFeatured(\App\Models\Offer $offer): array
    {
        return [
            'id' => $offer->id,
            'product_id' => $offer->product_id,
            'name' => $offer->product?->name ?? 'Ürün',
            'price' => (float) $offer->price,
            'seller' => $offer->seller?->nickname ?? $offer->seller?->business_name ?? 'Satıcı',
            'seller_id' => $offer->seller_id,
            'stock' => $offer->stock,
            'image' => $offer->product?->image,
            'image_url' => $offer->product?->image_url,
        ];
    }
}
