<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Offer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@eczanepazari.com'],
            [
                'password' => Hash::make('admin123'),
                'gln_code' => '8680000000000',
                'business_name' => 'Admin Eczanesi',
                'phone' => '0532 000 0000',
                'address' => 'Admin Caddesi No:1',
                'city' => 'İstanbul',
                'is_verified' => true,
                'role' => 'super-admin',
            ]
        );

        $this->command->info('✅ Admin user created: admin@eczanepazari.com / admin123');

        // Create Test Pharmacist Users
        $seller1 = User::firstOrCreate(
            ['email' => 'eczane1@test.com'],
            [
                'password' => Hash::make('test123'),
                'gln_code' => '8680000000001',
                'business_name' => 'Merkez Eczanesi',
                'phone' => '0532 111 1111',
                'address' => 'Merkez Mahallesi No:10',
                'city' => 'İstanbul',
                'is_verified' => true,
                'role' => 'pharmacist',
            ]
        );

        $seller2 = User::firstOrCreate(
            ['email' => 'eczane2@test.com'],
            [
                'password' => Hash::make('test123'),
                'gln_code' => '8680000000002',
                'business_name' => 'Sağlık Eczanesi',
                'phone' => '0532 222 2222',
                'address' => 'Sağlık Caddesi No:20',
                'city' => 'Ankara',
                'is_verified' => true,
                'role' => 'pharmacist',
            ]
        );

        $this->command->info('✅ Test pharmacist users created');

        // Create Categories with Commission Rates
        $categories = [
            [
                'name' => 'Ağrı Kesiciler',
                'slug' => 'agri-kesiciler',
                'description' => 'Ağrı kesici ve ateş düşürücü ilaçlar',
                'commission_rate' => 5.00,
            ],
            [
                'name' => 'Antibiyotikler',
                'slug' => 'antibiyotikler',
                'description' => 'Antibiyotik ilaçlar',
                'commission_rate' => 8.00,
            ],
            [
                'name' => 'Vitaminler',
                'slug' => 'vitaminler',
                'description' => 'Vitamin ve takviye ürünleri',
                'commission_rate' => 10.00,
            ],
            [
                'name' => 'Cilt Bakım',
                'slug' => 'cilt-bakim',
                'description' => 'Dermokozmetik ve cilt bakım ürünleri',
                'commission_rate' => 12.00,
            ],
            [
                'name' => 'Bebek Ürünleri',
                'slug' => 'bebek-urunleri',
                'description' => 'Bebek mamaları ve bakım ürünleri',
                'commission_rate' => 7.50,
            ],
        ];

        foreach ($categories as $categoryData) {
            Category::firstOrCreate(
                ['slug' => $categoryData['slug']],
                $categoryData
            );
        }

        $this->command->info('✅ Test categories created with commission rates');

        // Get category IDs
        $agriKesiciCategory = Category::where('slug', 'agri-kesiciler')->first();
        $antibiyotikCategory = Category::where('slug', 'antibiyotikler')->first();
        $vitaminCategory = Category::where('slug', 'vitaminler')->first();
        $ciltBakimCategory = Category::where('slug', 'cilt-bakim')->first();
        $bebekCategory = Category::where('slug', 'bebek-urunleri')->first();

        // Create Test Products
        $products = [
            // Ağrı Kesiciler
            [
                'barcode' => '86800001001',
                'name' => 'PAROL 500 MG 20 TABLET',
                'brand' => 'PAROL',
                'manufacturer' => 'Atabay İlaç',
                'description' => 'Ağrı kesici ve ateş düşürücü',
                'category_id' => $agriKesiciCategory->id,
            ],
            [
                'barcode' => '86800001002',
                'name' => 'NUROFEN 400 MG 20 TABLET',
                'brand' => 'NUROFEN',
                'manufacturer' => 'Reckitt Benckiser',
                'description' => 'İbuprofen içeren ağrı kesici',
                'category_id' => $agriKesiciCategory->id,
            ],
            [
                'barcode' => '86800001003',
                'name' => 'ASPIRIN 500 MG 20 TABLET',
                'brand' => 'ASPIRIN',
                'manufacturer' => 'Bayer',
                'description' => 'Asetilsalisilik asit',
                'category_id' => $agriKesiciCategory->id,
            ],
            // Antibiyotikler
            [
                'barcode' => '86800002001',
                'name' => 'AUGMENTIN BID 1000 MG 10 TABLET',
                'brand' => 'AUGMENTIN',
                'manufacturer' => 'GSK',
                'description' => 'Geniş spektrumlu antibiyotik',
                'category_id' => $antibiyotikCategory->id,
            ],
            [
                'barcode' => '86800002002',
                'name' => 'CIPRO 500 MG 14 TABLET',
                'brand' => 'CIPRO',
                'manufacturer' => 'Bayer',
                'description' => 'Siprofloksasin antibiyotik',
                'category_id' => $antibiyotikCategory->id,
            ],
            // Vitaminler
            [
                'barcode' => '86800003001',
                'name' => 'CENTRUM ADVANCE 60 TABLET',
                'brand' => 'CENTRUM',
                'manufacturer' => 'Pfizer',
                'description' => 'Multivitamin ve mineral',
                'category_id' => $vitaminCategory->id,
            ],
            [
                'barcode' => '86800003002',
                'name' => 'SUPRADYN ENERGY 30 TABLET',
                'brand' => 'SUPRADYN',
                'manufacturer' => 'Bayer',
                'description' => 'Enerji vitamin kompleksi',
                'category_id' => $vitaminCategory->id,
            ],
            [
                'barcode' => '86800003003',
                'name' => 'D-VİTAMİN 1000 IU 90 KAPSÜL',
                'brand' => 'SOLGAR',
                'manufacturer' => 'Solgar',
                'description' => 'D vitamini takviyesi',
                'category_id' => $vitaminCategory->id,
            ],
            // Cilt Bakım
            [
                'barcode' => '86800004001',
                'name' => 'LA ROCHE POSAY EFFACLAR DUO 40 ML',
                'brand' => 'La Roche Posay',
                'manufacturer' => "L'Oreal",
                'description' => 'Akne bakım kremi',
                'category_id' => $ciltBakimCategory->id,
            ],
            [
                'barcode' => '86800004002',
                'name' => 'BIODERMA SENSIBIO H2O 250 ML',
                'brand' => 'BIODERMA',
                'manufacturer' => 'Bioderma',
                'description' => 'Misel temizleme suyu',
                'category_id' => $ciltBakimCategory->id,
            ],
            // Bebek Ürünleri
            [
                'barcode' => '86800005001',
                'name' => 'APTAMIL 1 NUMARA 400 GR',
                'brand' => 'APTAMIL',
                'manufacturer' => 'Nutricia',
                'description' => '0-6 ay bebek maması',
                'category_id' => $bebekCategory->id,
            ],
            [
                'barcode' => '86800005002',
                'name' => 'BEBEK PEDIALYTE 500 ML',
                'brand' => 'PEDIALYTE',
                'manufacturer' => 'Abbott',
                'description' => 'Oral rehidratasyon solüsyonu',
                'category_id' => $bebekCategory->id,
            ],
        ];

        foreach ($products as $productData) {
            Product::firstOrCreate(
                ['barcode' => $productData['barcode']],
                $productData
            );
        }

        $this->command->info('✅ Test products created');

        // Create Offers for Products
        $allProducts = Product::all();
        $expiryDate1 = now()->addMonths(6);
        $expiryDate2 = now()->addMonths(12);

        foreach ($allProducts as $index => $product) {
            // Offer from Seller 1
            Offer::firstOrCreate(
                ['product_id' => $product->id, 'seller_id' => $seller1->id],
                [
                    'price' => rand(50, 500) + (rand(0, 99) / 100),
                    'stock' => rand(10, 100),
                    'expiry_date' => $expiryDate1,
                    'batch_number' => 'BATCH-' . $seller1->id . '-' . $product->id,
                    'status' => 'active',
                ]
            );

            // Offer from Seller 2 (different price)
            Offer::firstOrCreate(
                ['product_id' => $product->id, 'seller_id' => $seller2->id],
                [
                    'price' => rand(45, 520) + (rand(0, 99) / 100),
                    'stock' => rand(5, 80),
                    'expiry_date' => $expiryDate2,
                    'batch_number' => 'BATCH-' . $seller2->id . '-' . $product->id,
                    'status' => 'active',
                ]
            );
        }

        $this->command->info('✅ Test offers created for all products');
        $this->command->info('');
        $this->command->info('📋 Summary:');
        $this->command->info('   - Admin: admin@eczanepazari.com / admin123');
        $this->command->info('   - Seller 1: eczane1@test.com / test123');
        $this->command->info('   - Seller 2: eczane2@test.com / test123');
        $this->command->info('   - Categories: ' . Category::count());
        $this->command->info('   - Products: ' . Product::count());
        $this->command->info('   - Offers: ' . Offer::count());
    }
}
