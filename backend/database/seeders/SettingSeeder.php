<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            // Hybrid commission: %10 percentage + ₺50 flat service fee applied together
            ['key' => 'commission.enabled', 'value' => '1', 'group' => 'commission', 'type' => 'boolean'],
            ['key' => 'commission.fee_mode', 'value' => 'hybrid', 'group' => 'commission', 'type' => 'string'],
            ['key' => 'commission.commission_percentage', 'value' => '10', 'group' => 'commission', 'type' => 'integer'],
            ['key' => 'commission.flat_service_fee', 'value' => '50', 'group' => 'commission', 'type' => 'integer'],
            ['key' => 'commission.withholding_tax_rate', 'value' => '1', 'group' => 'commission', 'type' => 'integer'],
            ['key' => 'commission.marketplace_fee_enabled', 'value' => '0', 'group' => 'commission', 'type' => 'boolean'],
            ['key' => 'commission.marketplace_fee_rate', 'value' => '0', 'group' => 'commission', 'type' => 'integer'],
            ['key' => 'commission.min_order_amount', 'value' => '500', 'group' => 'commission', 'type' => 'integer'],

            // Payment / payout
            ['key' => 'payment.payout_hold_days', 'value' => '15', 'group' => 'payment', 'type' => 'integer'],

            // Site identity
            ['key' => 'site.name', 'value' => 'i-Bijuteri', 'group' => 'site', 'type' => 'string'],
            ['key' => 'site.tagline', 'value' => "Türkiye'nin B2B Bijuteri Pazaryeri", 'group' => 'site', 'type' => 'string'],
            ['key' => 'site.description', 'value' => 'Toptan bijuteri ticaretini yeniden tanımladık. Üretici, ithalatçı ve perakendeciler için B2B pazaryeri.', 'group' => 'site', 'type' => 'string'],
            ['key' => 'site.contact_email', 'value' => 'info@i-bijuteri.com', 'group' => 'site', 'type' => 'string'],
            ['key' => 'site.contact_phone', 'value' => '', 'group' => 'site', 'type' => 'string'],

            // Topbar (üst bilgi çubuğu)
            ['key' => 'topbar.enabled', 'value' => '1', 'group' => 'topbar', 'type' => 'boolean'],
            ['key' => 'topbar.shipping_text', 'value' => 'Türkiye geneli ücretsiz kargo', 'group' => 'topbar', 'type' => 'string'],
            ['key' => 'topbar.hours_text', 'value' => 'Hafta içi 09:00 – 18:00', 'group' => 'topbar', 'type' => 'string'],
            ['key' => 'topbar.phone', 'value' => '0 542 848 26 46', 'group' => 'topbar', 'type' => 'string'],
            ['key' => 'topbar.seller_link_text', 'value' => 'Nasıl Satıcı Olurum?', 'group' => 'topbar', 'type' => 'string'],
            ['key' => 'topbar.seller_link_url', 'value' => '/yardim', 'group' => 'topbar', 'type' => 'string'],
            ['key' => 'topbar.contact_link_text', 'value' => 'İletişim', 'group' => 'topbar', 'type' => 'string'],
            ['key' => 'topbar.contact_link_url', 'value' => '/iletisim', 'group' => 'topbar', 'type' => 'string'],
            ['key' => 'topbar.announcement_text', 'value' => '', 'group' => 'topbar', 'type' => 'string'],
            ['key' => 'topbar.announcement_enabled', 'value' => '0', 'group' => 'topbar', 'type' => 'boolean'],
        ];

        foreach ($defaults as $row) {
            Setting::updateOrCreate(
                ['key' => $row['key']],
                [
                    'value' => $row['value'],
                    'group' => $row['group'],
                    'type' => $row['type'],
                ]
            );
        }
    }
}
