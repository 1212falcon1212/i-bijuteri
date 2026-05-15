<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Offer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class ImportProducts extends Command
{
    protected $signature = 'products:import-catalog {--file= : JSON file path} {--chunk=500 : Chunk size}';

    protected $description = 'Import products from ebijuteritoptan JSON catalog';

    /**
     * @var array<string, int>
     */
    private array $categoryCache = [];

    public function handle(): int
    {
        $file = $this->option('file');
        if (! $file || ! file_exists($file)) {
            $this->error("File not found: {$file}");

            return self::FAILURE;
        }

        $this->info('Loading JSON...');
        $data = json_decode(file_get_contents($file), true);
        if (! $data || ! isset($data['products'])) {
            $this->error('Invalid JSON structure');

            return self::FAILURE;
        }

        $products = $data['products'];
        $total = count($products);
        $this->info("Found {$total} products");

        $sellerIds = User::query()
            ->where('role', User::ROLE_SELLER)
            ->pluck('id')
            ->toArray();
        if (empty($sellerIds)) {
            $this->error('No sellers found. Run DemoSellersSeeder first.');

            return self::FAILURE;
        }
        $this->info('Using '.count($sellerIds).' sellers');

        $chunkSize = (int) $this->option('chunk');
        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $stats = [
            'products_created' => 0,
            'products_skipped' => 0,
            'offers_created' => 0,
            'categories_created' => 0,
        ];

        $startedAt = microtime(true);

        foreach (array_chunk($products, $chunkSize) as $chunk) {
            DB::transaction(function () use ($chunk, $sellerIds, &$stats, $bar): void {
                foreach ($chunk as $row) {
                    try {
                        if (empty($row['barcode'])) {
                            $stats['products_skipped']++;
                            $bar->advance();

                            continue;
                        }

                        $categoryId = $this->resolveCategory($row, $stats);
                        if (! $categoryId) {
                            $stats['products_skipped']++;
                            $bar->advance();

                            continue;
                        }

                        $product = Product::updateOrCreate(
                            ['barcode' => $row['barcode']],
                            [
                                'name' => $row['name'] ?? 'İsimsiz Ürün',
                                'brand' => null,
                                'manufacturer' => null,
                                'description' => $row['description'] ?? null,
                                'image' => $row['images'][0] ?? null,
                                'category_id' => $categoryId,
                                'psf' => isset($row['price']) ? (float) $row['price'] : null,
                                'is_active' => ($row['availability'] ?? 'InStock') === 'InStock',
                                'approval_status' => 'approved',
                                'source' => 'ebijuteritoptan',
                            ]
                        );
                        $stats['products_created']++;

                        if (! $product->psf || (float) $product->psf <= 0) {
                            $bar->advance();

                            continue;
                        }

                        Offer::where('product_id', $product->id)->delete();

                        $offerCount = random_int(1, min(3, count($sellerIds)));
                        $chosenSellerKeys = (array) array_rand($sellerIds, $offerCount);
                        $chosenSellers = array_map(fn ($key) => $sellerIds[$key], $chosenSellerKeys);

                        $shippingOptions = [0, 15, 25, 40];

                        foreach ($chosenSellers as $sellerId) {
                            $priceVariation = random_int(90, 130) / 100;
                            $offerPrice = round((float) $product->psf * $priceVariation, 2);

                            Offer::create([
                                'product_id' => $product->id,
                                'seller_id' => $sellerId,
                                'price' => $offerPrice,
                                'stock' => random_int(5, 100),
                                'shipping_cost' => $shippingOptions[array_rand($shippingOptions)],
                                'status' => 'active',
                                'reviewed_at' => now(),
                            ]);
                            $stats['offers_created']++;
                        }
                    } catch (Throwable $e) {
                        $this->newLine();
                        $this->warn('Error: '.$e->getMessage().' | SKU: '.($row['barcode'] ?? '?'));
                        $stats['products_skipped']++;
                    }
                    $bar->advance();
                }
            });
        }

        $bar->finish();
        $this->newLine(2);

        $elapsed = round(microtime(true) - $startedAt, 2);

        $this->info("Import complete in {$elapsed}s!");
        $this->table(['Metric', 'Count'], [
            ['Products Created/Updated', $stats['products_created']],
            ['Products Skipped', $stats['products_skipped']],
            ['Offers Created', $stats['offers_created']],
            ['Categories Created', $stats['categories_created']],
        ]);

        return self::SUCCESS;
    }

    /**
     * @param  array<string, mixed>  $row
     * @param  array<string, int>  $stats
     */
    private function resolveCategory(array $row, array &$stats): ?int
    {
        $path = [];
        if (! empty($row['categories']) && is_array($row['categories'])) {
            $path = $row['categories'];
        } elseif (! empty($row['breadcrumb'])) {
            $path = array_map('trim', explode('>', $row['breadcrumb']));
        }
        if (empty($path)) {
            return null;
        }

        $cumulativeSlug = '';
        $parentId = null;
        $categoryId = null;

        foreach ($path as $name) {
            $name = trim((string) $name);
            if ($name === '') {
                continue;
            }
            $slug = Str::slug($name);
            if (! $slug) {
                continue;
            }
            $cumulativeSlug = $cumulativeSlug ? "{$cumulativeSlug}/{$slug}" : $slug;
            $cacheKey = $cumulativeSlug;

            if (isset($this->categoryCache[$cacheKey])) {
                $parentId = $this->categoryCache[$cacheKey];
                $categoryId = $parentId;

                continue;
            }

            $category = Category::firstOrCreate(
                ['slug' => $slug, 'parent_id' => $parentId],
                [
                    'name' => $name,
                    'full_slug' => $cumulativeSlug,
                    'commission_rate' => 10,
                    'vat_rate' => 20,
                    'withholding_tax_rate' => 1,
                    'is_active' => true,
                ]
            );

            if ($category->wasRecentlyCreated) {
                $stats['categories_created']++;
            }

            $this->categoryCache[$cacheKey] = $category->id;
            $parentId = $category->id;
            $categoryId = $category->id;
        }

        return $categoryId;
    }
}
