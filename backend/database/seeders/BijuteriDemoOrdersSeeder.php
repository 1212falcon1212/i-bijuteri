<?php

namespace Database\Seeders;

use App\Models\Offer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\SubOrder;
use App\Models\User;
use App\Services\FeeCalculationService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class BijuteriDemoOrdersSeeder extends Seeder
{
    public function run(): void
    {
        $buyer = User::firstOrCreate(
            ['email' => 'demo-alici@i-bijuteri.com'],
            [
                'password' => Hash::make('Demo123!'),
                'business_name' => 'Demo Kuyumcu Vitrini',
                'nickname' => 'Demo Alıcı',
                'phone' => '0532 000 00 00',
                'address' => 'Kapalıçarşı Demo Pasajı No: 1',
                'city' => 'İstanbul',
                'district' => 'Fatih',
                'tax_number' => '1234567890',
                'tax_office' => 'Beyazıt',
                'role' => User::ROLE_BUYER,
                'is_verified' => true,
                'verification_status' => 'approved',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info("✓ Alıcı: {$buyer->email}");

        // Aktif teklifleri al
        $offers = Offer::where('status', 'active')
            ->where('stock', '>', 5)
            ->with(['product.category', 'seller'])
            ->inRandomOrder()
            ->take(120)
            ->get();

        if ($offers->isEmpty()) {
            $this->command->warn('⚠️ Aktif teklif bulunamadı.');
            return;
        }

        $statusFlows = [
            ['order' => 'delivered', 'payment' => 'paid', 'sub' => 'delivered', 'days_ago' => 30],
            ['order' => 'delivered', 'payment' => 'paid', 'sub' => 'delivered', 'days_ago' => 22],
            ['order' => 'shipped', 'payment' => 'paid', 'sub' => 'shipped', 'days_ago' => 5],
            ['order' => 'shipped', 'payment' => 'paid', 'sub' => 'shipped', 'days_ago' => 3],
            ['order' => 'confirmed', 'payment' => 'paid', 'sub' => 'processing', 'days_ago' => 1],
            ['order' => 'confirmed', 'payment' => 'paid', 'sub' => 'processing', 'days_ago' => 0],
            ['order' => 'pending', 'payment' => 'pending', 'sub' => 'pending', 'days_ago' => 0],
            ['order' => 'cancelled', 'payment' => 'failed', 'sub' => 'cancelled', 'days_ago' => 7],
        ];

        $feeService = new FeeCalculationService();
        $orderCount = 0;
        $offerIndex = 0;

        foreach ($statusFlows as $flow) {
            // Her sipariş için 2-4 farklı satıcıdan 1-3 ürün
            $sellerCount = rand(2, 4);
            $sellerGroups = [];

            $remaining = $offers->slice($offerIndex);
            $offerIndex += $sellerCount * 2;

            foreach ($remaining as $offer) {
                if (count($sellerGroups) >= $sellerCount) {
                    break;
                }
                $sid = $offer->seller_id;
                if (! isset($sellerGroups[$sid])) {
                    $sellerGroups[$sid] = [];
                }
                if (count($sellerGroups[$sid]) < rand(1, 3)) {
                    $sellerGroups[$sid][] = $offer;
                }
            }

            if (empty($sellerGroups)) {
                continue;
            }

            $createdAt = Carbon::now()->subDays($flow['days_ago'])->subHours(rand(1, 23));
            $orderNumber = 'BJ-' . strtoupper(uniqid());

            DB::transaction(function () use ($flow, $buyer, $sellerGroups, $createdAt, $orderNumber, $feeService, &$orderCount) {
                $subtotal = 0;
                foreach ($sellerGroups as $items) {
                    foreach ($items as $offer) {
                        $qty = rand(1, 3);
                        $subtotal += (float) $offer->price * $qty;
                    }
                }

                $order = Order::create([
                    'order_number' => $orderNumber,
                    'user_id' => $buyer->id,
                    'subtotal' => $subtotal,
                    'total_commission' => 0,
                    'total_amount' => $subtotal,
                    'shipping_cost' => 0,
                    'shipping_address' => [
                        'address' => $buyer->address,
                        'city' => $buyer->city,
                        'district' => $buyer->district,
                        'phone' => $buyer->phone,
                    ],
                    'status' => $flow['order'],
                    'payment_status' => $flow['payment'],
                    'payment_method' => 'credit_card',
                    'shipped_at' => in_array($flow['sub'], ['shipped', 'delivered'], true)
                        ? $createdAt->copy()->addDays(rand(1, 2))
                        : null,
                    'delivered_at' => $flow['sub'] === 'delivered'
                        ? $createdAt->copy()->addDays(rand(3, 5))
                        : null,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                foreach ($sellerGroups as $sellerId => $items) {
                    $sellerSubtotal = 0;

                    $subOrder = SubOrder::create([
                        'order_id' => $order->id,
                        'seller_id' => $sellerId,
                        'status' => $flow['sub'],
                        'subtotal' => 0,
                        'total_commission' => 0,
                        'total_payout' => 0,
                        'shipped_at' => $order->shipped_at,
                        'delivered_at' => $order->delivered_at,
                        'created_at' => $createdAt,
                        'updated_at' => $createdAt,
                    ]);

                    foreach ($items as $offer) {
                        $qty = rand(1, 3);
                        $unit = (float) $offer->price;
                        $total = $unit * $qty;
                        $sellerSubtotal += $total;

                        OrderItem::create([
                            'order_id' => $order->id,
                            'sub_order_id' => $subOrder->id,
                            'product_id' => $offer->product_id,
                            'offer_id' => $offer->id,
                            'seller_id' => $sellerId,
                            'quantity' => $qty,
                            'unit_price' => $unit,
                            'total_price' => $total,
                            'commission_rate' => 0,
                            'commission_amount' => 0,
                            'withholding_tax' => 0,
                            'shipping_cost_share' => 0,
                            'net_seller_amount' => $total,
                            'seller_payout_amount' => $total,
                            'created_at' => $createdAt,
                            'updated_at' => $createdAt,
                        ]);
                    }

                    $subOrder->update(['subtotal' => $sellerSubtotal]);
                }

                // Tüm order items oluşturuldu, şimdi komisyon/stopaj hesapla
                $order->load('items.product.category', 'items.seller');
                $feeService->applyFeesToOrder($order);

                // Toplam komisyon güncelle
                $order->refresh();
                $totalCommission = $order->items->sum('commission_amount');
                $order->update(['total_commission' => $totalCommission]);

                $orderCount++;
            });
        }

        $this->command->info("✓ {$orderCount} demo sipariş oluşturuldu.");
        $this->command->newLine();
        $this->command->info("📦 Demo Alıcı Bilgileri:");
        $this->command->line("   Email:    demo-alici@i-bijuteri.com");
        $this->command->line("   Şifre:    Demo123!");
        $this->command->line("   Satıcılar: " . count(User::where('role', User::ROLE_SELLER)->pluck('email')));
    }
}
