<?php

declare(strict_types=1);

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Cache;

/**
 * Pazaryeri (/market) ana sayfa metin ve içeriklerini yönetir.
 * Her alan ayrı bir Setting key'i olarak saklanır.
 */
class MarketHomeSettings extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-rectangle-group';

    protected static string $view = 'filament.pages.market-home-settings';

    protected static ?string $navigationLabel = 'Pazaryeri Ana Sayfa';

    protected static ?string $title = 'Pazaryeri Ana Sayfa İçerikleri';

    protected static ?string $navigationGroup = 'CMS';

    protected static ?int $navigationSort = 5;

    public ?array $data = [];

    /**
     * Tüm market ana sayfa setting key'leri ve varsayılan değerleri
     *
     * @return array<string, mixed>
     */
    public static function defaults(): array
    {
        return [
            // Hero
            'market.hero_eyebrow' => 'İlkbahar Tedarik Sezonu · 2026',
            'market.hero_title_prefix' => 'Pırıltıyı',
            'market.hero_title_em' => 'toptan fiyatla',
            'market.hero_title_suffix' => 'vitrininize taşıyın.',
            'market.hero_description' => '340+ onaylı tedarikçi, 12.400+ aktif ürün. Şeffaf fiyatlandırma ve 48 saatte teslimat ile B2B bijuteri pazaryeri.',
            'market.hero_cta_primary_text' => 'Koleksiyonu Keşfet',
            'market.hero_cta_primary_url' => '/market/products',
            'market.hero_cta_secondary_text' => 'Tedarikçileri Gör',
            'market.hero_cta_secondary_url' => '/market/markalar',
            'market.hero_trust1' => 'Onaylı Tedarikçi',
            'market.hero_trust2' => 'Ücretsiz Kargo',
            'market.hero_trust3' => 'Şeffaf Fiyat',
            'market.hero_tag_label' => 'Bu hafta öne çıkan',
            'market.hero_tag_title' => 'Damla Pırlanta Kolye',
            'market.hero_tag_meta' => 'Aurum · 14 Ayar',

            // Trust Strip (4 items)
            'market.trust1_title' => '340+ Onaylı Tedarikçi',
            'market.trust1_subtitle' => 'Belgeli, doğrulanmış',
            'market.trust2_title' => '48 Saatte Teslim',
            'market.trust2_subtitle' => 'Türkiye geneli',
            'market.trust3_title' => 'Güvenli Ödeme',
            'market.trust3_subtitle' => 'SSL · 3D Secure',
            'market.trust4_title' => 'Şeffaf Fiyatlama',
            'market.trust4_subtitle' => 'Açık tedarikçi profili',

            // Category Showcase
            'market.cats_eyebrow' => 'Pazaryeri',
            'market.cats_title' => 'Koleksiyonu keşfedin.',
            'market.cats_description' => 'Her kategoride farklı tedarikçilerin fiyatlarını karşılaştırın, en uygun olanı vitrininize alın.',
            'market.cats_link_text' => 'Tüm kategorileri gör',

            // Editorial Banner (haftanın koleksiyonu)
            'market.banner_eyebrow' => 'Haftanın Koleksiyonu',
            'market.banner_title_prefix' => 'Beyaz Pırlanta —',
            'market.banner_title_em' => 'haftanın',
            'market.banner_title_suffix' => 'öne çıkanı.',
            'market.banner_description' => 'Bursa atölyelerinden 24 model. Onaylı 3 tedarikçiden anında temin, haftaya özel toptan fiyat avantajı.',
            'market.banner_stat1_value' => '24',
            'market.banner_stat1_label' => 'Model',
            'market.banner_stat2_value' => '3',
            'market.banner_stat2_label' => 'Tedarikçi',
            'market.banner_stat3_value' => '₺489+',
            'market.banner_stat3_label' => 'Başlangıç',
            'market.banner_cta_text' => 'Koleksiyonu Gör',
            'market.banner_cta_url' => '/market/onerilen',

            // Featured Products
            'market.products_eyebrow' => 'Çok Tercih Edilenler',
            'market.products_title' => 'Bu sezonun favorileri.',
            'market.products_tab_all_label' => 'Tümü',

            // Sellers Spotlight
            'market.sellers_eyebrow' => 'Onaylı Tedarikçiler',
            'market.sellers_title' => 'Vitrininize doğrudan tedarik.',
            'market.sellers_description' => 'Belgeli, doğrulanmış atölyelerden doğrudan alın. Şeffaf değerlendirme, hızlı kargo, güvenli ödeme.',
            'market.sellers_cta_text' => 'Mağazaya git',

            // CTA Split (yeni sezon)
            'market.cta_split_eyebrow' => 'Yeni Sezon',
            'market.cta_split_title' => 'Saatler · 2026 koleksiyonu.',
            'market.cta_split_description' => 'Klasik formlar, modern detaylar. 148 model 9 tedarikçiden, toptan fiyatlarla vitrinize.',
            'market.cta_split_stat1_value' => '148',
            'market.cta_split_stat1_label' => 'Model',
            'market.cta_split_stat2_value' => '9',
            'market.cta_split_stat2_label' => 'Tedarikçi',
            'market.cta_split_stat3_value' => '₺320+',
            'market.cta_split_stat3_label' => 'Başlangıç',
            'market.cta_split_cta_text' => 'Koleksiyonu İncele',
            'market.cta_split_cta_url' => '/market/category/saat',
            'market.cta_split_image' => null,
        ];
    }

    public function mount(): void
    {
        $defaults = self::defaults();
        $fill = [];

        foreach ($defaults as $key => $default) {
            $fieldName = str_replace('market.', '', $key);
            $fill[$fieldName] = Setting::getValue($key, $default);
        }

        // Sellers JSON listesi
        $fill['sellers'] = Setting::getValue('market.sellers', self::defaultSellers());

        $this->form->fill($fill);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function defaultSellers(): array
    {
        return [
            ['name' => 'AurumToptan', 'city' => 'İstanbul', 'years' => 7, 'products' => 142, 'rating' => 4.9, 'slug' => 'aurum'],
            ['name' => 'Bursa Atölye', 'city' => 'Bursa', 'years' => 12, 'products' => 287, 'rating' => 4.8, 'slug' => 'bursa-atolye'],
            ['name' => 'Zarif Mücevher', 'city' => 'İzmir', 'years' => 5, 'products' => 98, 'rating' => 4.7, 'slug' => 'zarif'],
            ['name' => 'Pırıltı Bijuteri', 'city' => 'Ankara', 'years' => 9, 'products' => 213, 'rating' => 4.9, 'slug' => 'pirilti'],
        ];
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Tabs::make('MarketHome')
                    ->tabs([
                        Forms\Components\Tabs\Tab::make('Hero')
                            ->icon('heroicon-o-star')
                            ->schema([
                                Forms\Components\TextInput::make('hero_eyebrow')
                                    ->label('Üst Etiket')
                                    ->maxLength(150),
                                Forms\Components\Grid::make(3)
                                    ->schema([
                                        Forms\Components\TextInput::make('hero_title_prefix')
                                            ->label('Başlık - Ön')
                                            ->maxLength(100),
                                        Forms\Components\TextInput::make('hero_title_em')
                                            ->label('Başlık - Vurgulu (italic)')
                                            ->maxLength(100),
                                        Forms\Components\TextInput::make('hero_title_suffix')
                                            ->label('Başlık - Son')
                                            ->maxLength(100),
                                    ]),
                                Forms\Components\Textarea::make('hero_description')
                                    ->label('Açıklama')
                                    ->rows(3)
                                    ->maxLength(500),
                                Forms\Components\Grid::make(2)
                                    ->schema([
                                        Forms\Components\TextInput::make('hero_cta_primary_text')
                                            ->label('Birincil Buton Metni')
                                            ->maxLength(100),
                                        Forms\Components\TextInput::make('hero_cta_primary_url')
                                            ->label('Birincil Buton URL')
                                            ->maxLength(255),
                                        Forms\Components\TextInput::make('hero_cta_secondary_text')
                                            ->label('İkincil Buton Metni')
                                            ->maxLength(100),
                                        Forms\Components\TextInput::make('hero_cta_secondary_url')
                                            ->label('İkincil Buton URL')
                                            ->maxLength(255),
                                    ]),
                                Forms\Components\Section::make('Güven Çizgisi (Trustline)')
                                    ->schema([
                                        Forms\Components\Grid::make(3)
                                            ->schema([
                                                Forms\Components\TextInput::make('hero_trust1')->label('Madde 1')->maxLength(80),
                                                Forms\Components\TextInput::make('hero_trust2')->label('Madde 2')->maxLength(80),
                                                Forms\Components\TextInput::make('hero_trust3')->label('Madde 3')->maxLength(80),
                                            ]),
                                    ])
                                    ->collapsible(),
                                Forms\Components\Section::make('Foto Etiketi (sağ üst)')
                                    ->schema([
                                        Forms\Components\TextInput::make('hero_tag_label')->label('Üst Etiket')->maxLength(80),
                                        Forms\Components\TextInput::make('hero_tag_title')->label('Başlık')->maxLength(120),
                                        Forms\Components\TextInput::make('hero_tag_meta')->label('Alt Bilgi')->maxLength(120),
                                    ])
                                    ->collapsible(),
                                Forms\Components\Placeholder::make('hero_image_hint')
                                    ->label('Hero Görseli')
                                    ->content('Hero görseli "Banner Yönetimi" sayfasından "Ana Sayfa Hero" konumuna yüklenir.'),
                            ]),

                        Forms\Components\Tabs\Tab::make('Güven Şeridi')
                            ->icon('heroicon-o-shield-check')
                            ->schema([
                                Forms\Components\Grid::make(2)
                                    ->schema([
                                        Forms\Components\Section::make('Madde 1')->schema([
                                            Forms\Components\TextInput::make('trust1_title')->label('Başlık')->maxLength(120),
                                            Forms\Components\TextInput::make('trust1_subtitle')->label('Alt Açıklama')->maxLength(150),
                                        ]),
                                        Forms\Components\Section::make('Madde 2')->schema([
                                            Forms\Components\TextInput::make('trust2_title')->label('Başlık')->maxLength(120),
                                            Forms\Components\TextInput::make('trust2_subtitle')->label('Alt Açıklama')->maxLength(150),
                                        ]),
                                        Forms\Components\Section::make('Madde 3')->schema([
                                            Forms\Components\TextInput::make('trust3_title')->label('Başlık')->maxLength(120),
                                            Forms\Components\TextInput::make('trust3_subtitle')->label('Alt Açıklama')->maxLength(150),
                                        ]),
                                        Forms\Components\Section::make('Madde 4')->schema([
                                            Forms\Components\TextInput::make('trust4_title')->label('Başlık')->maxLength(120),
                                            Forms\Components\TextInput::make('trust4_subtitle')->label('Alt Açıklama')->maxLength(150),
                                        ]),
                                    ]),
                            ]),

                        Forms\Components\Tabs\Tab::make('Kategoriler')
                            ->icon('heroicon-o-squares-2x2')
                            ->schema([
                                Forms\Components\TextInput::make('cats_eyebrow')->label('Üst Etiket')->maxLength(120),
                                Forms\Components\TextInput::make('cats_title')->label('Başlık')->maxLength(150),
                                Forms\Components\Textarea::make('cats_description')->label('Açıklama')->rows(3)->maxLength(500),
                                Forms\Components\TextInput::make('cats_link_text')->label('Link Metni')->maxLength(100),
                            ]),

                        Forms\Components\Tabs\Tab::make('Editöryal Banner')
                            ->icon('heroicon-o-photo')
                            ->schema([
                                Forms\Components\TextInput::make('banner_eyebrow')->label('Üst Etiket')->maxLength(150),
                                Forms\Components\Grid::make(3)
                                    ->schema([
                                        Forms\Components\TextInput::make('banner_title_prefix')->label('Başlık - Ön')->maxLength(100),
                                        Forms\Components\TextInput::make('banner_title_em')->label('Başlık - Vurgulu')->maxLength(100),
                                        Forms\Components\TextInput::make('banner_title_suffix')->label('Başlık - Son')->maxLength(100),
                                    ]),
                                Forms\Components\Textarea::make('banner_description')->label('Açıklama')->rows(3)->maxLength(500),
                                Forms\Components\Section::make('İstatistikler')->schema([
                                    Forms\Components\Grid::make(3)->schema([
                                        Forms\Components\TextInput::make('banner_stat1_value')->label('1 - Değer')->maxLength(50),
                                        Forms\Components\TextInput::make('banner_stat1_label')->label('1 - Etiket')->maxLength(50),
                                        Forms\Components\TextInput::make('banner_stat2_value')->label('2 - Değer')->maxLength(50),
                                        Forms\Components\TextInput::make('banner_stat2_label')->label('2 - Etiket')->maxLength(50),
                                        Forms\Components\TextInput::make('banner_stat3_value')->label('3 - Değer')->maxLength(50),
                                        Forms\Components\TextInput::make('banner_stat3_label')->label('3 - Etiket')->maxLength(50),
                                    ]),
                                ])->collapsible(),
                                Forms\Components\Grid::make(2)->schema([
                                    Forms\Components\TextInput::make('banner_cta_text')->label('CTA Metni')->maxLength(100),
                                    Forms\Components\TextInput::make('banner_cta_url')->label('CTA URL')->maxLength(255),
                                ]),
                                Forms\Components\Placeholder::make('banner_image_hint')
                                    ->label('Banner Görseli')
                                    ->content('Banner arka plan görseli "Banner Yönetimi" sayfasından "Ana Sayfa Orta" konumuna yüklenir.'),
                            ]),

                        Forms\Components\Tabs\Tab::make('Öne Çıkan Ürünler')
                            ->icon('heroicon-o-sparkles')
                            ->schema([
                                Forms\Components\TextInput::make('products_eyebrow')->label('Üst Etiket')->maxLength(120),
                                Forms\Components\TextInput::make('products_title')->label('Başlık')->maxLength(150),
                                Forms\Components\TextInput::make('products_tab_all_label')
                                    ->label('"Tümü" Sekmesi Adı')
                                    ->helperText('Diğer sekmeler kategorilerden otomatik gelir.')
                                    ->maxLength(50),
                            ]),

                        Forms\Components\Tabs\Tab::make('Tedarikçiler')
                            ->icon('heroicon-o-building-storefront')
                            ->schema([
                                Forms\Components\TextInput::make('sellers_eyebrow')->label('Üst Etiket')->maxLength(120),
                                Forms\Components\TextInput::make('sellers_title')->label('Başlık')->maxLength(150),
                                Forms\Components\Textarea::make('sellers_description')->label('Açıklama')->rows(3)->maxLength(500),
                                Forms\Components\TextInput::make('sellers_cta_text')->label('Karta Tıkla CTA Metni')->maxLength(80),

                                Forms\Components\Repeater::make('sellers')
                                    ->label('Tedarikçi Kartları')
                                    ->schema([
                                        Forms\Components\Grid::make(2)->schema([
                                            Forms\Components\TextInput::make('name')->label('Mağaza Adı')->required()->maxLength(120),
                                            Forms\Components\TextInput::make('slug')->label('Slug')->required()->maxLength(120)
                                                ->helperText('URL parçası: /market/marka/<slug>'),
                                            Forms\Components\TextInput::make('city')->label('Şehir')->maxLength(80),
                                            Forms\Components\TextInput::make('years')->label('Üyelik (yıl)')->numeric(),
                                            Forms\Components\TextInput::make('products')->label('Aktif Ürün')->numeric(),
                                            Forms\Components\TextInput::make('rating')->label('Puan (0-5)')->numeric()->step(0.1),
                                        ]),
                                    ])
                                    ->defaultItems(0)
                                    ->reorderable()
                                    ->collapsible()
                                    ->itemLabel(fn (array $state): ?string => $state['name'] ?? null),
                            ]),

                        Forms\Components\Tabs\Tab::make('Alt CTA (Yeni Sezon)')
                            ->icon('heroicon-o-rectangle-stack')
                            ->schema([
                                Forms\Components\TextInput::make('cta_split_eyebrow')->label('Üst Etiket')->maxLength(120),
                                Forms\Components\TextInput::make('cta_split_title')->label('Başlık')->maxLength(150),
                                Forms\Components\Textarea::make('cta_split_description')->label('Açıklama')->rows(3)->maxLength(500),
                                Forms\Components\Section::make('İstatistikler')->schema([
                                    Forms\Components\Grid::make(3)->schema([
                                        Forms\Components\TextInput::make('cta_split_stat1_value')->label('1 - Değer')->maxLength(50),
                                        Forms\Components\TextInput::make('cta_split_stat1_label')->label('1 - Etiket')->maxLength(50),
                                        Forms\Components\TextInput::make('cta_split_stat2_value')->label('2 - Değer')->maxLength(50),
                                        Forms\Components\TextInput::make('cta_split_stat2_label')->label('2 - Etiket')->maxLength(50),
                                        Forms\Components\TextInput::make('cta_split_stat3_value')->label('3 - Değer')->maxLength(50),
                                        Forms\Components\TextInput::make('cta_split_stat3_label')->label('3 - Etiket')->maxLength(50),
                                    ]),
                                ])->collapsible(),
                                Forms\Components\Grid::make(2)->schema([
                                    Forms\Components\TextInput::make('cta_split_cta_text')->label('CTA Metni')->maxLength(100),
                                    Forms\Components\TextInput::make('cta_split_cta_url')->label('CTA URL')->maxLength(255),
                                ]),
                                Forms\Components\FileUpload::make('cta_split_image')
                                    ->label('Görsel')
                                    ->image()
                                    ->directory('market-home')
                                    ->maxSize(2048)
                                    ->helperText('Önerilen boyut: 1400x900px'),
                            ]),
                    ])
                    ->persistTabInQueryString(),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();
        $defaults = self::defaults();

        foreach ($defaults as $settingKey => $default) {
            $fieldName = str_replace('market.', '', $settingKey);
            $value = $data[$fieldName] ?? $default;

            Setting::setValue($settingKey, $value, 'market', 'string');
        }

        $sellers = $data['sellers'] ?? self::defaultSellers();
        Setting::setValue('market.sellers', $sellers, 'market', 'json');

        Cache::forget('cms.homepage.market_home');

        Notification::make()
            ->title('Pazaryeri ana sayfa içerikleri kaydedildi')
            ->success()
            ->send();
    }

    /**
     * @return array<int, Forms\Components\Actions\Action>
     */
    protected function getFormActions(): array
    {
        return [
            Forms\Components\Actions\Action::make('save')
                ->label('Kaydet')
                ->submit('save'),
        ];
    }
}
