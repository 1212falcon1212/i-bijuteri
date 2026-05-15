<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Mail\SellerApprovedMail;
use App\Mail\SellerRejectedMail;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationLabel = 'Kullanicilar';

    protected static ?string $modelLabel = 'Kullanici';

    protected static ?string $pluralModelLabel = 'Kullanicilar';

    protected static ?string $navigationGroup = 'Kullanıcılar';

    protected static ?int $navigationSort = 1;

    /**
     * Show only marketplace users (sellers and buyers); exclude super admins.
     */
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->whereIn('role', [User::ROLE_SELLER, User::ROLE_BUYER]);
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Hesap Bilgileri')
                    ->schema([
                        Forms\Components\TextInput::make('email')
                            ->email()
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(255),
                        Forms\Components\TextInput::make('password')
                            ->password()
                            ->dehydrateStateUsing(fn ($state) => Hash::make($state))
                            ->dehydrated(fn ($state) => filled($state))
                            ->required(fn (string $context): bool => $context === 'create')
                            ->maxLength(255),
                    ])->columns(2),

                Forms\Components\Section::make('Isletme Bilgileri')
                    ->schema([
                        Forms\Components\TextInput::make('business_name')
                            ->label('Isletme Adi')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('nickname')
                            ->label('Rumuz')
                            ->helperText('Sitede gorunecek isim')
                            ->maxLength(100),
                        Forms\Components\TextInput::make('phone')
                            ->label('Telefon')
                            ->tel()
                            ->maxLength(20),
                        Forms\Components\TextInput::make('city')
                            ->label('Sehir')
                            ->maxLength(100),
                        Forms\Components\Textarea::make('address')
                            ->label('Adres')
                            ->rows(3)
                            ->maxLength(500),
                    ])->columns(2),

                Forms\Components\Section::make('Ticari Bilgiler')
                    ->schema([
                        Forms\Components\TextInput::make('trade_name')
                            ->label('Ticari Unvan')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('tax_number')
                            ->label('Vergi/TC Kimlik No')
                            ->maxLength(20),
                        Forms\Components\TextInput::make('tax_office')
                            ->label('Vergi Dairesi')
                            ->maxLength(100),
                        Forms\Components\TextInput::make('mersis_no')
                            ->label('MERSIS No')
                            ->maxLength(20),
                        Forms\Components\TextInput::make('kep_address')
                            ->label('KEP Adresi')
                            ->maxLength(255),
                    ])->columns(2),

                Forms\Components\Section::make('Yetki ve Durum')
                    ->schema([
                        Forms\Components\Select::make('role')
                            ->label('Rol')
                            ->options([
                                User::ROLE_SELLER => 'Satici',
                                User::ROLE_BUYER => 'Alici',
                            ])
                            ->required()
                            ->default(User::ROLE_BUYER),
                        Forms\Components\Select::make('verification_status')
                            ->label('Dogrulama Durumu')
                            ->options([
                                'pending' => 'Onay Bekliyor',
                                'approved' => 'Onaylandi',
                                'rejected' => 'Reddedildi',
                            ])
                            ->default('pending'),
                        Forms\Components\Toggle::make('is_verified')
                            ->label('Dogrulandi')
                            ->default(false),
                    ])->columns(3),

                Forms\Components\Section::make('Satıcıya Özel Komisyon & Kargo')
                    ->description('Sadece bu satıcıya özel komisyon, hizmet bedeli, stopaj oranı ve varsayılan kargo bedeli ayarlayın. Override kapalıysa platform genel ayarları geçerlidir.')
                    ->schema([
                        Forms\Components\Toggle::make('commission_override_active')
                            ->label('Bu satıcıya özel komisyon aktif')
                            ->default(false)
                            ->live()
                            ->columnSpanFull()
                            ->helperText('Kapalıyken aşağıdaki override değerleri yok sayılır; platform geneli ayarlar uygulanır.'),

                        Forms\Components\TextInput::make('commission_percentage_override')
                            ->label('Komisyon oranı (override)')
                            ->numeric()
                            ->suffix('%')
                            ->step(0.1)
                            ->minValue(0)
                            ->maxValue(50)
                            ->placeholder('Platform geneli')
                            ->disabled(fn (Forms\Get $get): bool => ! $get('commission_override_active')),

                        Forms\Components\TextInput::make('flat_service_fee_override')
                            ->label('Hizmet bedeli (override)')
                            ->numeric()
                            ->suffix('₺')
                            ->step(1)
                            ->minValue(0)
                            ->maxValue(2000)
                            ->placeholder('Platform geneli')
                            ->disabled(fn (Forms\Get $get): bool => ! $get('commission_override_active')),

                        Forms\Components\TextInput::make('withholding_tax_rate_override')
                            ->label('Stopaj oranı (override)')
                            ->numeric()
                            ->suffix('%')
                            ->step(0.01)
                            ->minValue(0)
                            ->maxValue(10)
                            ->placeholder('Platform geneli')
                            ->disabled(fn (Forms\Get $get): bool => ! $get('commission_override_active')),

                        Forms\Components\TextInput::make('default_shipping_cost')
                            ->label('Varsayılan kargo bedeli')
                            ->numeric()
                            ->suffix('₺')
                            ->step(0.5)
                            ->minValue(0)
                            ->maxValue(5000)
                            ->placeholder('Boş bırakılırsa kargo ücretsiz')
                            ->helperText('Bu satıcının yeni ürün ilanlarında varsayılan kargo bedeli olarak doldurulur.'),
                    ])
                    ->columns(2)
                    ->visible(fn (Forms\Get $get): bool => $get('role') === User::ROLE_SELLER)
                    ->collapsible(),

                Forms\Components\Section::make('Belgeler')
                    ->schema([
                        Forms\Components\Placeholder::make('seller_documents_list')
                            ->label('Yuklenen Belgeler')
                            ->content(function ($record) {
                                if (! $record) {
                                    return 'Kayit yok';
                                }

                                $docs = $record->sellerDocuments;
                                if ($docs->isEmpty()) {
                                    return new \Illuminate\Support\HtmlString('<p class="text-gray-500 dark:text-gray-400">Henuz belge yuklenmemis</p>');
                                }

                                $typeLabels = \App\Models\SellerDocument::TYPE_LABELS ?? [];

                                $statusBadges = [
                                    'pending' => '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Beklemede</span>',
                                    'approved' => '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Onaylandi</span>',
                                    'rejected' => '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Reddedildi</span>',
                                ];

                                $html = '<div class="space-y-3">';
                                foreach ($docs as $doc) {
                                    $typeLabel = $typeLabels[$doc->type] ?? $doc->type;
                                    $statusBadge = $statusBadges[$doc->status] ?? $doc->status;
                                    $url = \Illuminate\Support\Facades\Storage::url($doc->file_path);
                                    $html .= "<div class='p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>";
                                    $html .= "<div class='flex justify-between items-start'>";
                                    $html .= "<div class='space-y-1'>";
                                    $html .= "<div class='flex items-center gap-2'>";
                                    $html .= "<span class='font-medium text-gray-900 dark:text-white'>{$typeLabel}</span>";
                                    $html .= $statusBadge;
                                    $html .= '</div>';
                                    $html .= "<p class='text-sm text-gray-500 dark:text-gray-400'>{$doc->original_name}</p>";
                                    $html .= '</div>';
                                    $html .= "<a href='{$url}' target='_blank' class='inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-900/50 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors'>";
                                    $html .= "<svg class='w-4 h-4 mr-1.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'/><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'/></svg>";
                                    $html .= 'Goruntule</a>';
                                    $html .= '</div></div>';
                                }
                                $html .= '</div>';

                                return new \Illuminate\Support\HtmlString($html);
                            }),
                        Forms\Components\Textarea::make('rejection_reason')
                            ->label('Ret Sebebi')
                            ->rows(3)
                            ->visible(fn ($record) => $record?->verification_status === 'rejected'),
                    ])
                    ->collapsible(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('business_name')
                    ->label('Isletme Adi')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('nickname')
                    ->label('Rumuz')
                    ->searchable()
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('tax_number')
                    ->label('Vergi/TC No')
                    ->searchable()
                    ->copyable(),
                Tables\Columns\TextColumn::make('email')
                    ->searchable(),
                Tables\Columns\TextColumn::make('city')
                    ->label('Sehir')
                    ->searchable(),
                Tables\Columns\BadgeColumn::make('verification_status')
                    ->label('Durum')
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'approved',
                        'danger' => 'rejected',
                    ])
                    ->formatStateUsing(fn ($state) => User::VERIFICATION_STATUS_LABELS[$state] ?? $state),
                Tables\Columns\BadgeColumn::make('role')
                    ->label('Rol')
                    ->colors([
                        'success' => User::ROLE_SELLER,
                        'info' => User::ROLE_BUYER,
                    ])
                    ->formatStateUsing(fn ($state) => match ($state) {
                        User::ROLE_SELLER => 'Satici',
                        User::ROLE_BUYER => 'Alici',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Kayit Tarihi')
                    ->dateTime('d.m.Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('verification_status')
                    ->label('Dogrulama Durumu')
                    ->options([
                        'pending' => 'Onay Bekliyor',
                        'approved' => 'Onaylandi',
                        'rejected' => 'Reddedildi',
                    ]),
                Tables\Filters\SelectFilter::make('role')
                    ->label('Rol')
                    ->options([
                        User::ROLE_SELLER => 'Satici',
                        User::ROLE_BUYER => 'Alici',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('approve')
                    ->label('Onayla')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn ($record) => $record->verification_status === 'pending')
                    ->requiresConfirmation()
                    ->modalHeading('Kullanici Onayi')
                    ->modalDescription('Bu kullaniciyi onaylamak istediginize emin misiniz? Kullaniciya hos geldin e-postasi gonderilecektir.')
                    ->action(function ($record) {
                        $record->approve(auth()->id());

                        Mail::to($record->email)->queue(new SellerApprovedMail($record));

                        Notification::make()
                            ->title('Kullanici onaylandi')
                            ->success()
                            ->send();
                    }),

                Tables\Actions\Action::make('reject')
                    ->label('Reddet')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->visible(fn ($record) => $record->verification_status === 'pending')
                    ->form([
                        Forms\Components\Textarea::make('rejection_reason')
                            ->label('Ret Sebebi')
                            ->required()
                            ->rows(3)
                            ->placeholder('Lutfen ret sebebini belirtiniz...'),
                    ])
                    ->action(function ($record, array $data) {
                        $record->reject($data['rejection_reason'], auth()->id());

                        Mail::to($record->email)->queue(new SellerRejectedMail($record, $data['rejection_reason']));

                        Notification::make()
                            ->title('Basvuru reddedildi')
                            ->warning()
                            ->send();
                    }),

                Tables\Actions\Action::make('viewDocuments')
                    ->label('Belgeler')
                    ->icon('heroicon-o-document-text')
                    ->color('info')
                    ->visible(fn ($record) => $record->sellerDocuments()->count() > 0)
                    ->modalHeading('Yuklenen Belgeler')
                    ->modalContent(fn ($record) => view('filament.modals.seller-documents', ['documents' => $record->sellerDocuments]))
                    ->modalSubmitAction(false),

                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\BulkAction::make('bulkApprove')
                        ->label('Toplu Onayla')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->requiresConfirmation()
                        ->action(function ($records) {
                            foreach ($records as $record) {
                                if ($record->verification_status === 'pending') {
                                    $record->approve(auth()->id());
                                    Mail::to($record->email)->queue(new SellerApprovedMail($record));
                                }
                            }
                            Notification::make()
                                ->title('Secili kullanicilar onaylandi')
                                ->success()
                                ->send();
                        }),
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            UserResource\RelationManagers\DocumentsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'view' => Pages\ViewUser::route('/{record}'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
