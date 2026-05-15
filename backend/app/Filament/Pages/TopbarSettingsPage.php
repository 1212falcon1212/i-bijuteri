<?php

declare(strict_types=1);

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class TopbarSettingsPage extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-megaphone';

    protected static string $view = 'filament.pages.topbar-settings';

    protected static ?string $navigationLabel = 'Topbar Ayarları';

    protected static ?string $title = 'Topbar (Üst Bilgi Çubuğu) Ayarları';

    protected static ?string $navigationGroup = 'Ayarlar';

    protected static ?int $navigationSort = 5;

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill([
            'enabled' => (bool) Setting::getValue('topbar.enabled', true),
            'shipping_text' => Setting::getValue('topbar.shipping_text', 'Türkiye geneli ücretsiz kargo'),
            'hours_text' => Setting::getValue('topbar.hours_text', 'Hafta içi 09:00 – 18:00'),
            'phone' => Setting::getValue('topbar.phone', '0 542 848 26 46'),
            'seller_link_text' => Setting::getValue('topbar.seller_link_text', 'Nasıl Satıcı Olurum?'),
            'seller_link_url' => Setting::getValue('topbar.seller_link_url', '/sayfalar/yardim'),
            'contact_link_text' => Setting::getValue('topbar.contact_link_text', 'İletişim'),
            'contact_link_url' => Setting::getValue('topbar.contact_link_url', '/iletisim'),
            'announcement_enabled' => (bool) Setting::getValue('topbar.announcement_enabled', false),
            'announcement_text' => Setting::getValue('topbar.announcement_text', ''),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Topbar Görünüm')
                    ->description('Sitenin en üstündeki ince bilgi çubuğunu yönetin. Devre dışı bırakırsanız hiç gösterilmez.')
                    ->schema([
                        Forms\Components\Toggle::make('enabled')
                            ->label('Topbar gösterilsin mi?')
                            ->default(true)
                            ->helperText('Kapatılırsa header üstündeki ince bilgi çubuğu hiç render edilmez.'),
                    ]),

                Forms\Components\Section::make('Sol Taraf (Kargo & Saat)')
                    ->description('Topbar\'ın sol tarafında görünen bilgilendirme metinleri.')
                    ->schema([
                        Forms\Components\TextInput::make('shipping_text')
                            ->label('Kargo metni')
                            ->placeholder('Türkiye geneli ücretsiz kargo')
                            ->maxLength(120)
                            ->helperText('Kamyonet ikonu yanında gösterilir. Boş bırakılırsa gösterilmez.'),

                        Forms\Components\TextInput::make('hours_text')
                            ->label('Çalışma saatleri metni')
                            ->placeholder('Hafta içi 09:00 – 18:00')
                            ->maxLength(120)
                            ->helperText('Saat ikonu yanında gösterilir. Boş bırakılırsa gösterilmez.'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Sağ Taraf (Linkler & Telefon)')
                    ->description('Topbar\'ın sağ tarafında görünen linkler ve telefon numarası.')
                    ->schema([
                        Forms\Components\TextInput::make('seller_link_text')
                            ->label('Satıcı linki metni')
                            ->placeholder('Nasıl Satıcı Olurum?')
                            ->maxLength(80),

                        Forms\Components\TextInput::make('seller_link_url')
                            ->label('Satıcı linki URL')
                            ->placeholder('/sayfalar/yardim')
                            ->maxLength(255)
                            ->helperText('Dahili sayfa için "/sayfalar/yardim" gibi, dış link için "https://..." kullanın.'),

                        Forms\Components\TextInput::make('contact_link_text')
                            ->label('İletişim linki metni')
                            ->placeholder('İletişim')
                            ->maxLength(80),

                        Forms\Components\TextInput::make('contact_link_url')
                            ->label('İletişim linki URL')
                            ->placeholder('/iletisim')
                            ->maxLength(255),

                        Forms\Components\TextInput::make('phone')
                            ->label('Telefon numarası')
                            ->placeholder('0 542 848 26 46')
                            ->maxLength(40)
                            ->helperText('Topbar\'ın en sağında telefon ikonuyla gösterilir. "tel:" linki olarak çalışır.')
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Duyuru Çubuğu (Opsiyonel)')
                    ->description('Açıkken Topbar\'ın normal içeriği yerine ortalanmış tek satır duyuru metni gösterilir. Kampanya / önemli duyurular için kullanın.')
                    ->schema([
                        Forms\Components\Toggle::make('announcement_enabled')
                            ->label('Duyuru modu aktif')
                            ->default(false)
                            ->helperText('Açıldığında normal topbar içeriği gizlenir, sadece aşağıdaki duyuru metni gösterilir.'),

                        Forms\Components\Textarea::make('announcement_text')
                            ->label('Duyuru metni')
                            ->placeholder('Örn: 1000 TL ve üzeri siparişlerde kargo bedava!')
                            ->rows(2)
                            ->maxLength(255)
                            ->helperText('Kısa ve dikkat çekici tutun. 255 karakteri geçmesin.'),
                    ]),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();

        Setting::setValue('topbar.enabled', $data['enabled'] ?? true, 'topbar', 'boolean');
        Setting::setValue('topbar.shipping_text', $data['shipping_text'] ?? '', 'topbar', 'string');
        Setting::setValue('topbar.hours_text', $data['hours_text'] ?? '', 'topbar', 'string');
        Setting::setValue('topbar.phone', $data['phone'] ?? '', 'topbar', 'string');
        Setting::setValue('topbar.seller_link_text', $data['seller_link_text'] ?? '', 'topbar', 'string');
        Setting::setValue('topbar.seller_link_url', $data['seller_link_url'] ?? '/', 'topbar', 'string');
        Setting::setValue('topbar.contact_link_text', $data['contact_link_text'] ?? '', 'topbar', 'string');
        Setting::setValue('topbar.contact_link_url', $data['contact_link_url'] ?? '/', 'topbar', 'string');
        Setting::setValue('topbar.announcement_enabled', $data['announcement_enabled'] ?? false, 'topbar', 'boolean');
        Setting::setValue('topbar.announcement_text', $data['announcement_text'] ?? '', 'topbar', 'string');

        // CMS layout cache'i temizle ki frontend yeni ayarları görsün
        \Illuminate\Support\Facades\Cache::forget('cms.layout');

        Notification::make()
            ->title('Topbar ayarları kaydedildi')
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
