<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSellersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sellers = [
            [
                'email' => 'toptanbijuteri@i-bijuteri.com',
                'business_name' => 'ToptanBijuteri Ltd.',
                'city' => 'İstanbul',
                'district' => 'Beyoğlu',
            ],
            [
                'email' => 'kuyumzincir@i-bijuteri.com',
                'business_name' => 'KuyumZincir Atölye',
                'city' => 'İzmir',
                'district' => 'Konak',
            ],
            [
                'email' => 'parlakatolye@i-bijuteri.com',
                'business_name' => 'Parlak Atölye',
                'city' => 'Bursa',
                'district' => 'Osmangazi',
            ],
            [
                'email' => 'gumusevi@i-bijuteri.com',
                'business_name' => 'Gümüş Evi',
                'city' => 'Ankara',
                'district' => 'Çankaya',
            ],
            [
                'email' => 'nurkantaki@i-bijuteri.com',
                'business_name' => 'Nurkan Takı',
                'city' => 'Antalya',
                'district' => 'Muratpaşa',
            ],
        ];

        foreach ($sellers as $seller) {
            User::updateOrCreate(
                ['email' => $seller['email']],
                [
                    'password' => Hash::make('Demo123!'),
                    'business_name' => $seller['business_name'],
                    'owner_name' => 'Demo Satıcı',
                    'city' => $seller['city'],
                    'district' => $seller['district'],
                    'tax_number' => (string) random_int(1000000000, 9999999999),
                    'role' => User::ROLE_SELLER,
                    'is_verified' => true,
                    'verification_status' => 'approved',
                    'verified_at' => now(),
                    'approved_at' => now(),
                    'email_verified_at' => now(),
                ]
            );
        }

        $this->command->info('Demo sellers seeded: '.count($sellers).' accounts');
        $this->command->info('Password for all: Demo123!');
    }
}
