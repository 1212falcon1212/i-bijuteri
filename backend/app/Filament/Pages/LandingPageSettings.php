<?php

declare(strict_types=1);

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

/**
 * Landing sayfa iceriklerini yonetir.
 * Her alan ayri bir setting key'i olarak saklanir.
 */
class LandingPageSettings extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-globe-alt';

    protected static string $view = 'filament.pages.landing-page-settings';

    protected static ?string $navigationLabel = 'Landing Sayfa';

    protected static ?string $title = 'Landing Sayfa Ayarları';

    protected static ?string $navigationGroup = 'Ayarlar';

    protected static ?int $navigationSort = 101;

    public ?array $data = [];

    /**
     * Tum landing setting key'leri ve varsayilan degerleri
     */
    public static function defaults(): array
    {
        return [
            // Hero
            'landing.hero_title' => "Türkiye'nin B2B Bijuteri Pazaryeri",
            'landing.hero_subtitle' => 'Toptan bijuteri ticaretini yeniden tanımladık. Üretici, ithalatçı ve perakendeciler tek bir yerde.',
            'landing.hero_image' => null,
            'landing.hero_cta_text' => 'Ücretsiz Kayıt Ol',

            // Neden i-Bijuteri
            'landing.why_title' => "Neden i-Bijuteri?",

            'landing.why_card1_title' => 'Doğrulanmış Satıcılar',
            'landing.why_card1_desc' => 'Vergi levhası ve imza sirküleri ile doğrulanmış satıcılar. Güvenli B2B alışveriş.',
            'landing.why_card1_image' => null,

            'landing.why_card2_title' => 'Şeffaf Komisyon',
            'landing.why_card2_desc' => 'Her satışta sabit %10 komisyon ve ₺50 hizmet bedeli. Sürpriz yok.',
            'landing.why_card2_image' => null,

            'landing.why_card3_title' => 'Esnek Kargo',
            'landing.why_card3_desc' => 'Her satıcı kendi kargo ücretini belirler. Anlaşmalı kargo şirketleri ile entegre.',
            'landing.why_card3_image' => null,

            // Nasıl Çalışır
            'landing.how_it_works_title' => '3 Adımda Bijuteri Ticareti',

            'landing.feature1_title' => 'VKN ile Hızlı Kayıt',
            'landing.feature1_desc' => 'Vergi levhası ve imza sirkülerinizi yükleyin, birkaç dakika içinde onay alın.',
            'landing.feature1_image' => null,

            'landing.feature2_title' => 'Ürünlerinizi Listeleyin',
            'landing.feature2_desc' => 'Kolye, küpe, yüzük, bileklik — tüm bijuteri ürünlerinizi kolayca listeleyin.',
            'landing.feature2_image' => null,

            'landing.feature3_title' => 'Güvenle Alın / Satın',
            'landing.feature3_desc' => 'KDV ve stopaj otomatik hesaplanır. Kargonuzu siz belirlersiniz.',
            'landing.feature3_image' => null,

            // Yorumlar (placeholder — admin gerçeklerini ekler)
            'landing.testimonial1_name' => 'A.Y.',
            'landing.testimonial1_title' => 'Kuyumcu, İstanbul',
            'landing.testimonial1_quote' => 'Stoklarımı kolayca nakde çevirdim. Profesyonel arayüz ve şeffaf komisyon yapısı çok iyi.',
            'landing.testimonial1_photo' => null,

            'landing.testimonial2_name' => 'F.D.',
            'landing.testimonial2_title' => 'Atölye Sahibi, İzmir',
            'landing.testimonial2_quote' => 'VKN doğrulaması güven veriyor. Toptan satışlarımı buraya taşıdım, memnunum.',
            'landing.testimonial2_photo' => null,

            'landing.testimonial3_name' => 'M.K.',
            'landing.testimonial3_title' => 'Perakendeci, Ankara',
            'landing.testimonial3_quote' => 'Geniş ürün yelpazesi ve makul fiyatlar. Tedarik sürecim çok hızlandı.',
            'landing.testimonial3_photo' => null,

            // CTA
            'landing.cta_title' => 'Hemen Ücretsiz Başla!',
            'landing.cta_subtitle' => 'VKN ile dakikalar içinde kayıt olun, ürünlerinizi listelemeye başlayın.',

            // Istatistikler
            'landing.stat1_label' => 'Satıcı',
            'landing.stat1_value' => '500+',
            'landing.stat2_label' => 'Aktif İlan',
            'landing.stat2_value' => '10.000+',
            'landing.stat3_label' => 'Komisyon',
            'landing.stat3_value' => '%10',
            'landing.stat4_label' => 'Hizmet Bedeli',
            'landing.stat4_value' => '₺50',
        ];
    }

    public function mount(): void
    {
        $defaults = self::defaults();
        $fill = [];

        foreach ($defaults as $key => $default) {
            // Form field name: 'landing.hero_title' -> 'hero_title'
            $fieldName = str_replace('landing.', '', $key);
            $fill[$fieldName] = Setting::getValue($key, $default);
        }

        $this->form->fill($fill);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Tabs::make('Landing')
                    ->tabs([
                        // Tab 1: Hero
                        Forms\Components\Tabs\Tab::make('Hero')
                            ->icon('heroicon-o-star')
                            ->schema([
                                Forms\Components\TextInput::make('hero_title')
                                    ->label('Başlık')
                                    ->required()
                                    ->maxLength(255),
                                Forms\Components\TextInput::make('hero_subtitle')
                                    ->label('Alt Başlık')
                                    ->required()
                                    ->maxLength(500),
                                Forms\Components\FileUpload::make('hero_image')
                                    ->label('Hero Arka Plan Görseli')
                                    ->image()
                                    ->directory('landing')
                                    ->maxSize(2048)
                                    ->helperText('Önerilen boyut: 1920x800px'),
                                Forms\Components\TextInput::make('hero_cta_text')
                                    ->label('CTA Buton Metni')
                                    ->maxLength(100),
                            ]),

                        // Tab 2: Neden i-Bijuteri?
                        Forms\Components\Tabs\Tab::make('Neden i-Bijuteri?')
                            ->icon('heroicon-o-heart')
                            ->schema([
                                Forms\Components\TextInput::make('why_title')
                                    ->label('Bölüm Başlığı')
                                    ->required()
                                    ->maxLength(255),

                                Forms\Components\Section::make('Kart 1')
                                    ->schema([
                                        Forms\Components\TextInput::make('why_card1_title')
                                            ->label('Başlık')
                                            ->required()
                                            ->maxLength(255),
                                        Forms\Components\Textarea::make('why_card1_desc')
                                            ->label('Açıklama')
                                            ->rows(3)
                                            ->required()
                                            ->maxLength(500),
                                        Forms\Components\FileUpload::make('why_card1_image')
                                            ->label('Görsel')
                                            ->image()
                                            ->directory('landing')
                                            ->maxSize(1024),
                                    ])
                                    ->collapsible(),

                                Forms\Components\Section::make('Kart 2')
                                    ->schema([
                                        Forms\Components\TextInput::make('why_card2_title')
                                            ->label('Başlık')
                                            ->required()
                                            ->maxLength(255),
                                        Forms\Components\Textarea::make('why_card2_desc')
                                            ->label('Açıklama')
                                            ->rows(3)
                                            ->required()
                                            ->maxLength(500),
                                        Forms\Components\FileUpload::make('why_card2_image')
                                            ->label('Görsel')
                                            ->image()
                                            ->directory('landing')
                                            ->maxSize(1024),
                                    ])
                                    ->collapsible(),

                                Forms\Components\Section::make('Kart 3')
                                    ->schema([
                                        Forms\Components\TextInput::make('why_card3_title')
                                            ->label('Başlık')
                                            ->required()
                                            ->maxLength(255),
                                        Forms\Components\Textarea::make('why_card3_desc')
                                            ->label('Açıklama')
                                            ->rows(3)
                                            ->required()
                                            ->maxLength(500),
                                        Forms\Components\FileUpload::make('why_card3_image')
                                            ->label('Görsel')
                                            ->image()
                                            ->directory('landing')
                                            ->maxSize(1024),
                                    ])
                                    ->collapsible(),
                            ]),

                        // Tab 3: Platform Tanitim
                        Forms\Components\Tabs\Tab::make('Platform Tanıtım')
                            ->icon('heroicon-o-device-phone-mobile')
                            ->schema([
                                Forms\Components\TextInput::make('how_it_works_title')
                                    ->label('Bölüm Başlığı')
                                    ->required()
                                    ->maxLength(255)
                                    ->helperText('Örnek: 3 Adımda Ticarete Başlayın'),

                                Forms\Components\Section::make('Feature 1')
                                    ->description('Sağda görsel gösterilir')
                                    ->schema([
                                        Forms\Components\TextInput::make('feature1_title')
                                            ->label('Başlık')
                                            ->required()
                                            ->maxLength(255),
                                        Forms\Components\Textarea::make('feature1_desc')
                                            ->label('Açıklama')
                                            ->rows(3)
                                            ->required()
                                            ->maxLength(500),
                                        Forms\Components\FileUpload::make('feature1_image')
                                            ->label('Görsel')
                                            ->image()
                                            ->directory('landing')
                                            ->maxSize(1024),
                                    ])
                                    ->collapsible(),

                                Forms\Components\Section::make('Feature 2')
                                    ->description('Solda görsel gösterilir')
                                    ->schema([
                                        Forms\Components\TextInput::make('feature2_title')
                                            ->label('Başlık')
                                            ->required()
                                            ->maxLength(255),
                                        Forms\Components\Textarea::make('feature2_desc')
                                            ->label('Açıklama')
                                            ->rows(3)
                                            ->required()
                                            ->maxLength(500),
                                        Forms\Components\FileUpload::make('feature2_image')
                                            ->label('Görsel')
                                            ->image()
                                            ->directory('landing')
                                            ->maxSize(1024),
                                    ])
                                    ->collapsible(),

                                Forms\Components\Section::make('Feature 3')
                                    ->description('Sağda görsel gösterilir')
                                    ->schema([
                                        Forms\Components\TextInput::make('feature3_title')
                                            ->label('Başlık')
                                            ->required()
                                            ->maxLength(255),
                                        Forms\Components\Textarea::make('feature3_desc')
                                            ->label('Açıklama')
                                            ->rows(3)
                                            ->required()
                                            ->maxLength(500),
                                        Forms\Components\FileUpload::make('feature3_image')
                                            ->label('Görsel')
                                            ->image()
                                            ->directory('landing')
                                            ->maxSize(1024),
                                    ])
                                    ->collapsible(),
                            ]),

                        // Tab 4: Musteri Yorumlari
                        Forms\Components\Tabs\Tab::make('Müşteri Yorumları')
                            ->icon('heroicon-o-chat-bubble-left-right')
                            ->schema([
                                Forms\Components\Section::make('Yorum 1')
                                    ->schema([
                                        Forms\Components\TextInput::make('testimonial1_name')
                                            ->label('İsim')
                                            ->required()
                                            ->maxLength(100),
                                        Forms\Components\TextInput::make('testimonial1_title')
                                            ->label('Unvan')
                                            ->helperText('Örnek: Kuyumcu, İstanbul')
                                            ->required()
                                            ->maxLength(100),
                                        Forms\Components\Textarea::make('testimonial1_quote')
                                            ->label('Yorum')
                                            ->rows(3)
                                            ->required()
                                            ->maxLength(500),
                                        Forms\Components\FileUpload::make('testimonial1_photo')
                                            ->label('Fotoğraf')
                                            ->image()
                                            ->avatar()
                                            ->directory('landing')
                                            ->maxSize(512),
                                    ])
                                    ->collapsible(),

                                Forms\Components\Section::make('Yorum 2')
                                    ->schema([
                                        Forms\Components\TextInput::make('testimonial2_name')
                                            ->label('İsim')
                                            ->required()
                                            ->maxLength(100),
                                        Forms\Components\TextInput::make('testimonial2_title')
                                            ->label('Unvan')
                                            ->helperText('Örnek: Perakendeci, Ankara')
                                            ->required()
                                            ->maxLength(100),
                                        Forms\Components\Textarea::make('testimonial2_quote')
                                            ->label('Yorum')
                                            ->rows(3)
                                            ->required()
                                            ->maxLength(500),
                                        Forms\Components\FileUpload::make('testimonial2_photo')
                                            ->label('Fotoğraf')
                                            ->image()
                                            ->avatar()
                                            ->directory('landing')
                                            ->maxSize(512),
                                    ])
                                    ->collapsible(),

                                Forms\Components\Section::make('Yorum 3')
                                    ->schema([
                                        Forms\Components\TextInput::make('testimonial3_name')
                                            ->label('İsim')
                                            ->required()
                                            ->maxLength(100),
                                        Forms\Components\TextInput::make('testimonial3_title')
                                            ->label('Unvan')
                                            ->helperText('Örnek: Atölye Sahibi, İzmir')
                                            ->required()
                                            ->maxLength(100),
                                        Forms\Components\Textarea::make('testimonial3_quote')
                                            ->label('Yorum')
                                            ->rows(3)
                                            ->required()
                                            ->maxLength(500),
                                        Forms\Components\FileUpload::make('testimonial3_photo')
                                            ->label('Fotoğraf')
                                            ->image()
                                            ->avatar()
                                            ->directory('landing')
                                            ->maxSize(512),
                                    ])
                                    ->collapsible(),
                            ]),

                        // Tab 5: CTA & Istatistikler
                        Forms\Components\Tabs\Tab::make('CTA & İstatistikler')
                            ->icon('heroicon-o-megaphone')
                            ->schema([
                                Forms\Components\Section::make('CTA Bölümü')
                                    ->schema([
                                        Forms\Components\TextInput::make('cta_title')
                                            ->label('Başlık')
                                            ->required()
                                            ->maxLength(255),
                                        Forms\Components\TextInput::make('cta_subtitle')
                                            ->label('Alt Başlık')
                                            ->required()
                                            ->maxLength(255),
                                    ]),

                                Forms\Components\Section::make('İstatistikler')
                                    ->schema([
                                        Forms\Components\Grid::make(2)
                                            ->schema([
                                                Forms\Components\TextInput::make('stat1_label')
                                                    ->label('İstatistik 1 - Etiket')
                                                    ->required()
                                                    ->maxLength(50),
                                                Forms\Components\TextInput::make('stat1_value')
                                                    ->label('İstatistik 1 - Değer')
                                                    ->required()
                                                    ->maxLength(50),
                                                Forms\Components\TextInput::make('stat2_label')
                                                    ->label('İstatistik 2 - Etiket')
                                                    ->required()
                                                    ->maxLength(50),
                                                Forms\Components\TextInput::make('stat2_value')
                                                    ->label('İstatistik 2 - Değer')
                                                    ->required()
                                                    ->maxLength(50),
                                                Forms\Components\TextInput::make('stat3_label')
                                                    ->label('İstatistik 3 - Etiket')
                                                    ->required()
                                                    ->maxLength(50),
                                                Forms\Components\TextInput::make('stat3_value')
                                                    ->label('İstatistik 3 - Değer')
                                                    ->required()
                                                    ->maxLength(50),
                                                Forms\Components\TextInput::make('stat4_label')
                                                    ->label('İstatistik 4 - Etiket')
                                                    ->required()
                                                    ->maxLength(50),
                                                Forms\Components\TextInput::make('stat4_value')
                                                    ->label('İstatistik 4 - Değer')
                                                    ->required()
                                                    ->maxLength(50),
                                            ]),
                                    ]),
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
            $fieldName = str_replace('landing.', '', $settingKey);
            $value = $data[$fieldName] ?? $default;

            Setting::setValue($settingKey, $value, 'landing', 'string');
        }

        Notification::make()
            ->title('Landing sayfa ayarları kaydedildi')
            ->success()
            ->send();
    }

    protected function getFormActions(): array
    {
        return [
            Forms\Components\Actions\Action::make('save')
                ->label('Kaydet')
                ->submit('save'),
        ];
    }
}
