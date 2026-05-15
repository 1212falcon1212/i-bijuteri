<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class CommissionSettingsPage extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-calculator';

    protected static string $view = 'filament.pages.commission-settings';

    protected static ?string $navigationLabel = 'Komisyon & Hizmet Bedeli';

    protected static ?string $title = 'Komisyon ve Hizmet Bedeli Ayarları';

    protected static ?string $navigationGroup = 'Finans';

    protected static ?int $navigationSort = 2;

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill([
            'commission_enabled' => Setting::getValue('commission.enabled', true),
            'fee_mode' => Setting::getValue('commission.fee_mode', 'hybrid'),
            'commission_percentage' => Setting::getValue('commission.commission_percentage', 10),
            'flat_service_fee' => Setting::getValue('commission.flat_service_fee', 50),
            'withholding_tax_rate' => Setting::getValue('commission.withholding_tax_rate', 1.00),
            'min_order_amount' => Setting::getValue('commission.min_order_amount', 500),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Komisyon ve Hizmet Bedeli')
                    ->description('Satıcılardan kesilen komisyon yüzdesi ve sabit hizmet bedelini buradan yönetin. Varsayılan: %10 komisyon + ₺50 hizmet bedeli birlikte uygulanır.')
                    ->schema([
                        Forms\Components\Toggle::make('commission_enabled')
                            ->label('Komisyon ve hizmet bedeli aktif')
                            ->default(true)
                            ->helperText('Devre dışı bırakılırsa hiç kesinti yapılmaz.'),

                        Forms\Components\Select::make('fee_mode')
                            ->label('Ücretlendirme modu')
                            ->options([
                                'hybrid' => 'Hibrit — % komisyon + sabit ücret birlikte (önerilen)',
                                'percentage' => 'Sadece % komisyon',
                                'flat' => 'Sadece sabit hizmet bedeli',
                                'category' => 'Kategori bazlı % komisyon',
                            ])
                            ->default('hybrid')
                            ->live()
                            ->helperText('Hibrit modda her satışta hem yüzde hem de sabit ücret birlikte uygulanır.'),

                        Forms\Components\TextInput::make('commission_percentage')
                            ->label('Komisyon oranı')
                            ->numeric()
                            ->suffix('%')
                            ->step(0.1)
                            ->minValue(0)
                            ->maxValue(50)
                            ->default(10)
                            ->helperText('Her sipariş kalemi için satış tutarı üzerinden alınan komisyon yüzdesi.')
                            ->visible(fn (Forms\Get $get): bool => in_array($get('fee_mode'), ['hybrid', 'percentage'], true)),

                        Forms\Components\TextInput::make('flat_service_fee')
                            ->label('Sabit hizmet bedeli')
                            ->numeric()
                            ->suffix('₺')
                            ->step(1)
                            ->minValue(0)
                            ->maxValue(500)
                            ->default(50)
                            ->helperText('Her satıcıdan sipariş başına bir kez alınan sabit hizmet bedeli.')
                            ->visible(fn (Forms\Get $get): bool => in_array($get('fee_mode'), ['hybrid', 'flat'], true)),

                        Forms\Components\Placeholder::make('category_info')
                            ->label('Kategori bazlı komisyon')
                            ->content('Her kategori kendi komisyon oranını kullanır. Oranları Kategori yönetimi sayfasından düzenleyebilirsiniz.')
                            ->visible(fn (Forms\Get $get): bool => $get('fee_mode') === 'category'),

                        Forms\Components\TextInput::make('withholding_tax_rate')
                            ->label('Stopaj oranı')
                            ->numeric()
                            ->suffix('%')
                            ->step(0.01)
                            ->minValue(0)
                            ->maxValue(10)
                            ->default(1.00)
                            ->helperText('KDV hariç tutar üzerinden uygulanan stopaj kesintisi.'),

                        Forms\Components\TextInput::make('min_order_amount')
                            ->label('Minimum sipariş tutarı')
                            ->numeric()
                            ->suffix('₺')
                            ->step(50)
                            ->minValue(0)
                            ->maxValue(50000)
                            ->default(500)
                            ->helperText('Bu tutarın altında sipariş oluşturulamaz.'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Satıcıya Özel Komisyon')
                    ->description('Yukarıdaki genel ayarların yerine sadece belirli satıcılara özel komisyon, hizmet bedeli ve stopaj uygulayabilirsiniz. Override\'ı bireysel olarak Kullanıcılar > Satıcı düzenleme sayfasından açın.')
                    ->schema([
                        Forms\Components\Placeholder::make('override_list')
                            ->label('Aktif Override\'lar')
                            ->content(function () {
                                $sellers = \App\Models\User::query()
                                    ->where('role', \App\Models\User::ROLE_SELLER)
                                    ->where('commission_override_active', true)
                                    ->orderBy('business_name')
                                    ->get([
                                        'id', 'business_name', 'commission_percentage_override',
                                        'flat_service_fee_override', 'withholding_tax_rate_override',
                                        'default_shipping_cost',
                                    ]);

                                if ($sellers->isEmpty()) {
                                    return new \Illuminate\Support\HtmlString(
                                        '<p class="text-gray-500 dark:text-gray-400">Henüz hiç satıcıya özel komisyon override\'ı yok. Kullanıcılar listesinden bir satıcı seçip override\'ı aktifleştirin.</p>'
                                    );
                                }

                                $html = '<div class="space-y-2">';
                                foreach ($sellers as $s) {
                                    $url = \App\Filament\Resources\UserResource::getUrl('edit', ['record' => $s->id]);
                                    $name = e($s->business_name ?: "Satıcı #{$s->id}");
                                    $pct = $s->commission_percentage_override !== null
                                        ? '%' . number_format((float) $s->commission_percentage_override, 2, ',', '.')
                                        : '–';
                                    $flat = $s->flat_service_fee_override !== null
                                        ? '₺' . number_format((float) $s->flat_service_fee_override, 2, ',', '.')
                                        : '–';
                                    $stp = $s->withholding_tax_rate_override !== null
                                        ? '%' . number_format((float) $s->withholding_tax_rate_override, 2, ',', '.')
                                        : '–';
                                    $ship = $s->default_shipping_cost !== null
                                        ? '₺' . number_format((float) $s->default_shipping_cost, 2, ',', '.')
                                        : 'Ücretsiz';

                                    $html .= "<div class='flex items-center justify-between gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>";
                                    $html .= "<div><div class='font-medium text-gray-900 dark:text-white'>{$name}</div>";
                                    $html .= "<div class='text-xs text-gray-500 mt-1'>Komisyon: <b>{$pct}</b> · Hizmet: <b>{$flat}</b> · Stopaj: <b>{$stp}</b> · Varsayılan Kargo: <b>{$ship}</b></div></div>";
                                    $html .= "<a href='{$url}' class='text-sm font-medium text-primary-600 hover:text-primary-700'>Düzenle →</a>";
                                    $html .= '</div>';
                                }
                                $html .= '</div>';

                                return new \Illuminate\Support\HtmlString($html);
                            }),
                    ])
                    ->collapsible(),

                Forms\Components\Section::make('Hesaplama Örneği — ₺2.500 satış')
                    ->description('Yukarıdaki ayarlara göre canlı önizleme.')
                    ->schema([
                        Forms\Components\Placeholder::make('example')
                            ->label('')
                            ->content(function (Forms\Get $get) {
                                $feeMode = $get('fee_mode') ?? 'hybrid';
                                $percentage = (float) ($get('commission_percentage') ?? 10);
                                $flat = (float) ($get('flat_service_fee') ?? 50);
                                $withholdingRate = (float) ($get('withholding_tax_rate') ?? 1);

                                $sale = 2500.0;
                                $commission = 0.0;
                                $serviceFee = 0.0;

                                switch ($feeMode) {
                                    case 'hybrid':
                                        $commission = $sale * ($percentage / 100);
                                        $serviceFee = $flat;
                                        break;
                                    case 'percentage':
                                        $commission = $sale * ($percentage / 100);
                                        break;
                                    case 'flat':
                                        $serviceFee = $flat;
                                        break;
                                    case 'category':
                                        $commission = $sale * 0.10;
                                        break;
                                }

                                $vatExcl = $sale / 1.20;
                                $withholding = $vatExcl * ($withholdingRate / 100);
                                $deductions = $commission + $serviceFee + $withholding;
                                $net = $sale - $deductions;

                                $lines = "Satış Tutarı:                     ₺" . number_format($sale, 2, ',', '.') . "\n";

                                if ($commission > 0) {
                                    $rate = $feeMode === 'category' ? '10 (kategori örn.)' : (string) $percentage;
                                    $lines .= "Komisyon (%{$rate}):              -₺" . number_format($commission, 2, ',', '.') . "\n";
                                }

                                if ($serviceFee > 0) {
                                    $lines .= "Sabit Hizmet Bedeli:              -₺" . number_format($serviceFee, 2, ',', '.') . "\n";
                                }

                                $lines .= "KDV hariç tutar:                  ₺" . number_format($vatExcl, 2, ',', '.') . "\n"
                                    . "  └─ Stopaj (%{$withholdingRate}):              -₺" . number_format($withholding, 2, ',', '.') . "\n"
                                    . "Toplam Kesinti:                   -₺" . number_format($deductions, 2, ',', '.') . "\n"
                                    . "Net Satıcı Hakediş:               ₺" . number_format($net, 2, ',', '.');

                                return $lines;
                            }),
                    ]),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();

        Setting::setValue('commission.enabled', $data['commission_enabled'] ?? true);
        Setting::setValue('commission.fee_mode', $data['fee_mode'] ?? 'hybrid');
        Setting::setValue('commission.commission_percentage', $data['commission_percentage'] ?? 10);
        Setting::setValue('commission.flat_service_fee', $data['flat_service_fee'] ?? 50);
        Setting::setValue('commission.withholding_tax_rate', $data['withholding_tax_rate'] ?? 1.00);
        Setting::setValue('commission.min_order_amount', $data['min_order_amount'] ?? 500);

        Setting::clearCache();

        Notification::make()
            ->title('Komisyon ve hizmet bedeli ayarları kaydedildi')
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
