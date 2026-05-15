<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🚀 i-Bijuteri seed başlıyor...');

        $this->call([
            SettingSeeder::class,
            AdminUserSeeder::class,
            TurkeyLocationsSeeder::class,
        ]);

        // NOTE: DemoSellersSeeder is intentionally NOT called here.
        // Run manually: php artisan db:seed --class=DemoSellersSeeder

        $this->command->newLine();
        $this->command->info('✅ Seed tamamlandı.');
        $this->command->info('   Admin: admin@i-bijuteri.com / Admin123!');
    }
}
