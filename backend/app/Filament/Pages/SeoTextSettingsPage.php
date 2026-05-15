<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Cache;

class SeoTextSettingsPage extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';
    protected static ?string $navigationGroup = 'CMS';
    protected static ?string $title = 'SEO Tanitim Yazisi';
    protected static ?string $navigationLabel = 'SEO Tanitim Yazisi';
    protected static ?int $navigationSort = 13;
    protected static string $view = 'filament.pages.seo-text-settings';

    public const DEFAULT_TITLE = 'Turkiyenin En Guvenilir B2B Bijuteri Pazaryeri';

    public const DEFAULT_CONTENT = '<p>i-bijuteri.com, Turkiye genelindeki bijuteri ureticileri, atolyeler, toptancilar ve perakendeciler icin ozel olarak tasarlanmis bir B2B bijuteri pazaryeridir. Platformumuz uzerinden binlerce cesit kolye, kupe, yuzuk, bileklik, saat ve aksesuar urunune toptan fiyatlarla ulasabilirsiniz.</p><h2>Neden i-bijuteri.com?</h2><p>Dogrulanmis satici firmalardan dogrudan alisveris yapabilir, fiyatlari kiyaslayabilir ve en uygun teklifi secebilirsiniz. KDV ve stopaj otomatik hesaplanir, esnek kargo secenekleriyle siparisleriniz hizla yola cikar. Tum islemleriniz sifrelenmis baglanti uzerinden gerceklestirilir ve odeme guvenligi saglanir.</p><h2>Genis Urun Yelpazesi</h2><p>Kolye, kupe, yuzuk, bileklik, halhal, saat, sac aksesuari ve daha fazla bijuteri kategorisini tek bir platformda bulabilirsiniz. Urun katalogumuzu duzenli olarak guncelliyor, yeni koleksiyonlari ve sezon trendlerini sisteme ekliyoruz.</p><h2>Kolay Siparis ve Hizli Teslimat</h2><p>Kullanici dostu arayuzumuz sayesinde saniyeler icinde siparis verebilir, kargo takibinizi yapabilir ve gecmis siparislerinizi inceleyebilirsiniz. Turkiye geneli hizli ve guvenli teslimat secenekleriyle urunleriniz kapiniza kadar gelir.</p>';

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill([
            'title' => Setting::getValue('seo_text.title', self::DEFAULT_TITLE),
            'content' => Setting::getValue('seo_text.content', self::DEFAULT_CONTENT),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Ana Sayfa SEO Tanitim Yazisi')
                    ->description('Market ana sayfasinin en altinda gorunecek SEO uyumlu tanitim metni')
                    ->schema([
                        TextInput::make('title')
                            ->label('Baslik')
                            ->placeholder('Ornegin: Turkiyenin En Guvenilir B2B Bijuteri Pazaryeri'),
                        RichEditor::make('content')
                            ->label('Icerik')
                            ->toolbarButtons([
                                'bold',
                                'italic',
                                'underline',
                                'strike',
                                'link',
                                'orderedList',
                                'bulletList',
                                'h2',
                                'h3',
                                'blockquote',
                                'redo',
                                'undo',
                            ])
                            ->placeholder('SEO tanitim yazisini buraya girin...'),
                    ]),
            ])
            ->statePath('data');
    }

    public function submit(): void
    {
        $data = $this->form->getState();

        Setting::setValue('seo_text.title', $data['title'] ?? '', 'seo_text', 'string');
        Setting::setValue('seo_text.content', $data['content'] ?? '', 'seo_text', 'text');

        Cache::forget('cms.homepage.seo_text');

        Notification::make()
            ->title('SEO tanitim yazisi kaydedildi.')
            ->success()
            ->send();
    }
}
