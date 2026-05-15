<?php

namespace Tests\Unit\Services;

use App\Models\Setting;
use App\Models\User;
use App\Services\FeeCalculationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeeCalculationServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Setting::setValue('commission.enabled', true);
        Setting::setValue('commission.fee_mode', 'hybrid');
        Setting::setValue('commission.commission_percentage', 10);
        Setting::setValue('commission.flat_service_fee', 50);
        Setting::setValue('commission.withholding_tax_rate', 1.00);
        Setting::clearCache();
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function makeSeller(array $overrides = []): User
    {
        $base = [
            'email' => 'seller_' . uniqid() . '@test.com',
            'password' => bcrypt('secret'),
            'business_name' => 'Test Seller',
            'role' => User::ROLE_SELLER,
            'is_verified' => true,
            'verification_status' => 'approved',
        ];

        return User::create(array_merge($base, $overrides));
    }

    public function test_global_rates_applied_when_seller_has_no_override(): void
    {
        $seller = $this->makeSeller([
            'role' => User::ROLE_SELLER,
            'commission_override_active' => false,
        ]);

        $service = new FeeCalculationService();
        $rates = $service->getRatesForSeller($seller);

        $this->assertFalse($rates['override_active']);
        $this->assertEquals(10.0, $rates['commission_percentage']);
        $this->assertEquals(50.0, $rates['flat_service_fee']);
        $this->assertEquals(1.0, $rates['withholding_tax_rate']);
    }

    public function test_seller_override_replaces_global_rates_when_active(): void
    {
        $seller = $this->makeSeller([
            'role' => User::ROLE_SELLER,
            'commission_override_active' => true,
            'commission_percentage_override' => 7.5,
            'flat_service_fee_override' => 25,
            'withholding_tax_rate_override' => 0.5,
        ]);

        $service = new FeeCalculationService();
        $rates = $service->getRatesForSeller($seller);

        $this->assertTrue($rates['override_active']);
        $this->assertEquals(7.5, $rates['commission_percentage']);
        $this->assertEquals(25.0, $rates['flat_service_fee']);
        $this->assertEquals(0.5, $rates['withholding_tax_rate']);
    }

    public function test_partial_override_falls_back_to_global_for_unset_fields(): void
    {
        $seller = $this->makeSeller([
            'role' => User::ROLE_SELLER,
            'commission_override_active' => true,
            'commission_percentage_override' => 5,
            // flat_service_fee_override null → global 50 should be used
            // withholding_tax_rate_override null → global 1 should be used
        ]);

        $service = new FeeCalculationService();
        $rates = $service->getRatesForSeller($seller);

        $this->assertEquals(5.0, $rates['commission_percentage']);
        $this->assertEquals(50.0, $rates['flat_service_fee']);
        $this->assertEquals(1.0, $rates['withholding_tax_rate']);
    }

    public function test_calculate_fees_uses_seller_override_when_provided(): void
    {
        $seller = $this->makeSeller([
            'role' => User::ROLE_SELLER,
            'commission_override_active' => true,
            'commission_percentage_override' => 5,
        ]);

        $service = new FeeCalculationService();

        // ₺120 (KDV dahil) ürün, hybrid mod, %5 override komisyon, ₺50 hizmet, %1 stopaj
        $fees = $service->calculateFees(
            totalPrice: 120.0,
            flatFeeShare: 50.0,
            shippingCostShare: 0.0,
            categoryCommissionRate: null,
            vatRate: 20.0,
            seller: $seller,
        );

        // commission_percentage_amount = 120 * 5% = 6
        $this->assertEquals(6.0, $fees['commission_percentage_amount']);
        // service_fee_amount (flat) = 50
        $this->assertEquals(50.0, $fees['service_fee_amount']);
        // commission_amount = 6 + 50 = 56
        $this->assertEquals(56.0, $fees['commission_amount']);
        // KDV hariç = 120 / 1.20 = 100; stopaj = 100 * 1% = 1
        $this->assertEquals(1.0, $fees['withholding_tax']);
        // Net = 120 - 56 - 1 = 63
        $this->assertEquals(63.0, $fees['net_seller_amount']);
    }

    public function test_calculate_fees_uses_global_when_no_seller_provided(): void
    {
        $service = new FeeCalculationService();

        // ₺120 (KDV dahil), hybrid, %10 komisyon, ₺50 hizmet, %1 stopaj
        $fees = $service->calculateFees(
            totalPrice: 120.0,
            flatFeeShare: 50.0,
            shippingCostShare: 0.0,
            categoryCommissionRate: null,
            vatRate: 20.0,
        );

        // 120 * 10% = 12
        $this->assertEquals(12.0, $fees['commission_percentage_amount']);
        $this->assertEquals(50.0, $fees['service_fee_amount']);
        $this->assertEquals(62.0, $fees['commission_amount']);
        $this->assertEquals(1.0, $fees['withholding_tax']);
        // 120 - 62 - 1 = 57
        $this->assertEquals(57.0, $fees['net_seller_amount']);
    }

    public function test_override_inactive_uses_global_even_if_override_values_set(): void
    {
        $seller = $this->makeSeller([
            'role' => User::ROLE_SELLER,
            'commission_override_active' => false,
            'commission_percentage_override' => 5,
            'flat_service_fee_override' => 25,
        ]);

        $service = new FeeCalculationService();
        $rates = $service->getRatesForSeller($seller);

        $this->assertFalse($rates['override_active']);
        $this->assertEquals(10.0, $rates['commission_percentage']);
        $this->assertEquals(50.0, $rates['flat_service_fee']);
    }
}
