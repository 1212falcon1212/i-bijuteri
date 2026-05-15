<?php

namespace App\Models;

use App\Mail\PasswordResetMail;
use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasName;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements FilamentUser, HasName
{
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_SUPER_ADMIN = 'super-admin';

    public const ROLE_SELLER = 'seller';

    public const ROLE_BUYER = 'buyer';

    public const AVAILABLE_ROLES = [
        self::ROLE_SUPER_ADMIN,
        self::ROLE_SELLER,
        self::ROLE_BUYER,
    ];

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'email',
        'password',
        'business_name',
        'owner_name',
        'nickname',
        'phone',
        'address',
        'city',
        'district',
        'city_id',
        'district_id',
        'trade_name',
        'kep_address',
        'mersis_no',
        'tax_number',
        'tax_office',
        'role',
        'is_verified',
        'verified_at',
        'verification_status',
        'rejection_reason',
        'documents',
        'approved_at',
        'approved_by',
        'contract_signed_at',
        'contract_ip',
        'contract_user_agent',
        'deactivated_at',
        'deactivation_reason',
        'seller_score',
        'seller_total_orders',
        'seller_review_count',
        'commission_override_active',
        'commission_percentage_override',
        'flat_service_fee_override',
        'withholding_tax_rate_override',
        'default_shipping_cost',
        'paytr_utoken',
        'fcm_token',
        'fcm_token_updated_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'verified_at' => 'datetime',
            'approved_at' => 'datetime',
            'contract_signed_at' => 'datetime',
            'fcm_token_updated_at' => 'datetime',
            'password' => 'hashed',
            'is_verified' => 'boolean',
            'documents' => 'array',
            'seller_score' => 'float',
            'commission_override_active' => 'boolean',
            'commission_percentage_override' => 'decimal:2',
            'flat_service_fee_override' => 'decimal:2',
            'withholding_tax_rate_override' => 'decimal:2',
            'default_shipping_cost' => 'decimal:2',
        ];
    }

    public const VERIFICATION_STATUS_LABELS = [
        'pending' => 'Onay Bekliyor',
        'approved' => 'Onaylandı',
        'rejected' => 'Reddedildi',
    ];

    public function sendPasswordResetNotification($token): void
    {
        Mail::to($this->email)->send(new PasswordResetMail($this, $token));
    }

    public function getFilamentName(): string
    {
        return $this->business_name ?? $this->email;
    }

    public function cityRel(): BelongsTo
    {
        return $this->belongsTo(City::class, 'city_id');
    }

    public function districtRel(): BelongsTo
    {
        return $this->belongsTo(District::class, 'district_id');
    }

    /**
     * Public-facing display name (nickname if set, otherwise business name).
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->nickname ?: ($this->business_name ?? $this->email);
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    /**
     * Approved sellers and buyers are both treated as marketplace participants
     * who can list products. Pure buyers (role=buyer) cannot sell.
     */
    public function isSeller(): bool
    {
        return $this->role === self::ROLE_SELLER;
    }

    public function isBuyer(): bool
    {
        return $this->role === self::ROLE_BUYER || $this->role === self::ROLE_SELLER;
    }

    /**
     * Anyone except super-admin can buy from any approved seller (other than themselves).
     */
    public function canBuy(): bool
    {
        return ! $this->isSuperAdmin();
    }

    public function canBuyFrom(User $seller): bool
    {
        if ($this->id === $seller->id) {
            return false;
        }

        return $this->canBuy() && $seller->isSeller();
    }

    public function canSell(): bool
    {
        return $this->isSeller();
    }

    public function isApproved(): bool
    {
        return $this->verification_status === 'approved';
    }

    public function isPending(): bool
    {
        return $this->verification_status === 'pending';
    }

    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class, 'seller_id');
    }

    public function activeOffers(): HasMany
    {
        return $this->offers()->where('status', 'active');
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(SellerWallet::class, 'seller_id');
    }

    public function bankAccounts(): HasMany
    {
        return $this->hasMany(SellerBankAccount::class, 'seller_id');
    }

    public function defaultBankAccount(): HasOne
    {
        return $this->hasOne(SellerBankAccount::class, 'seller_id')->where('is_default', true);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(UserAddress::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function sellerOrderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'seller_id');
    }

    public function getVerificationStatusLabelAttribute(): string
    {
        return self::VERIFICATION_STATUS_LABELS[$this->verification_status] ?? $this->verification_status;
    }

    public function approve(int $approvedBy): void
    {
        $this->update([
            'verification_status' => 'approved',
            'is_verified' => true,
            'verified_at' => now(),
            'approved_at' => now(),
            'approved_by' => $approvedBy,
            'rejection_reason' => null,
        ]);
    }

    public function reject(string $reason, int $rejectedBy): void
    {
        $this->update([
            'verification_status' => 'rejected',
            'is_verified' => false,
            'rejection_reason' => $reason,
            'approved_by' => $rejectedBy,
        ]);
    }

    public function scopePending($query)
    {
        return $query->where('verification_status', 'pending');
    }

    public function scopeSellers($query)
    {
        return $query->where('role', self::ROLE_SELLER);
    }

    public function scopeBuyers($query)
    {
        return $query->where('role', self::ROLE_BUYER);
    }

    public function sellerDocuments(): HasMany
    {
        return $this->hasMany(SellerDocument::class);
    }

    public function documents(): HasMany
    {
        return $this->sellerDocuments();
    }

    public function hasRequiredDocuments(): bool
    {
        $requiredTypes = SellerDocument::REQUIRED_TYPES;
        $uploadedTypes = $this->sellerDocuments()->pluck('type')->toArray();

        return count(array_intersect($uploadedTypes, $requiredTypes)) === count($requiredTypes);
    }

    public function getDocumentsApprovedAttribute(): bool
    {
        $requiredTypes = SellerDocument::REQUIRED_TYPES;
        $approvedTypes = $this->sellerDocuments()
            ->where('status', 'approved')
            ->pluck('type')
            ->toArray();

        return count(array_intersect($approvedTypes, $requiredTypes)) === count($requiredTypes);
    }

    public function canAccessPlatform(): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->documents_approved;
    }

    public function integrations(): HasMany
    {
        return $this->hasMany(UserIntegration::class);
    }

    public function userNotifications(): HasMany
    {
        return $this->hasMany(UserNotification::class);
    }

    public function supportTickets(): HasMany
    {
        return $this->hasMany(SupportTicket::class);
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class, 'seller_id');
    }

    public function coupons(): HasMany
    {
        return $this->hasMany(Coupon::class, 'seller_id');
    }

    public function reviewsReceived(): HasMany
    {
        return $this->hasMany(Review::class, 'seller_id');
    }

    public function reviewsGiven(): HasMany
    {
        return $this->hasMany(Review::class, 'buyer_id');
    }

    public function getSellerRatingAttribute(): array
    {
        return Review::getSellerRatings($this->id);
    }

    public function getSellerScoreAttribute(): ?float
    {
        return $this->attributes['seller_score'] ?? null;
    }

    /**
     * Sellers must have a minimum rating of 7 to create campaigns.
     * New sellers (null score) are allowed by default.
     */
    public function canCreateCampaign(): bool
    {
        if ($this->seller_score === null) {
            return true;
        }

        return $this->seller_score >= 7;
    }
}
