<?php

namespace App\Services;

use App\Events\OrderCreated;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Setting;
use App\Models\SubOrder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        protected CartService $cartService,
        protected FeeCalculationService $feeCalculator,
    ) {}

    /**
     * Create an order from cart
     */
    public function createFromCart(
        Cart $cart,
        array $shippingAddress,
        ?string $notes = null,
        ?string $shippingProvider = null,
        ?float $shippingCost = null,
        string $paymentMethod = 'credit_card'
    ): Order {
        // Validate cart first
        $issues = $this->cartService->validateCart($cart);
        $criticalIssues = array_filter($issues, fn ($i) => in_array($i['type'], ['unavailable', 'stock']));

        if (! empty($criticalIssues)) {
            throw new \Exception('Sepetinizde düzeltilmesi gereken sorunlar var.');
        }

        // Sync prices to current values
        $this->cartService->syncPrices($cart);
        $cart->refresh();
        $cart->load(['items.product.category', 'items.offer', 'items.seller']);

        if ($cart->isEmpty()) {
            throw new \Exception('Sepetiniz boş.');
        }

        // Minimum sipariş tutarı kontrolü
        $minOrderAmount = (float) Setting::getValue('commission.min_order_amount', 500);
        $cartTotal = $cart->items->sum(fn ($i) => $i->price_at_addition * $i->quantity);
        if ($cartTotal < $minOrderAmount) {
            throw new \Exception('Minimum sipariş tutarı ₺'.number_format($minOrderAmount, 0, ',', '.')."'dir.");
        }

        // Calculate shipping cost from each seller's offer.shipping_cost (max per seller)
        if ($shippingCost === null) {
            $shippingCost = $cart->items
                ->groupBy('seller_id')
                ->sum(fn ($sellerItems) => $sellerItems->max(fn ($i) => (float) ($i->offer->shipping_cost ?? 0)));
        }

        return DB::transaction(function () use ($cart, $shippingAddress, $notes, $shippingProvider, $shippingCost, $paymentMethod) {
            $orderNumber = $this->generateOrderNumber();
            $subtotal = 0;

            // Build raw item data (fees applied after order creation via FeeCalculationService)
            $orderItemsData = [];
            foreach ($cart->items as $item) {
                $unitPrice = (float) $item->price_at_addition;
                $quantity = $item->quantity;
                $totalPrice = $unitPrice * $quantity;

                $subtotal += $totalPrice;

                $orderItemsData[] = [
                    'product_id' => $item->product_id,
                    'offer_id' => $item->offer_id,
                    'seller_id' => $item->seller_id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                ];

                if (! $item->offer->decreaseStock($quantity)) {
                    throw new \Exception("Stok yetersiz: {$item->product->name}");
                }
            }

            // Shipping cost is set by each seller and added to the buyer's total.
            $totalAmount = $subtotal + (float) $shippingCost;

            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $cart->user_id,
                'subtotal' => $subtotal,
                'total_commission' => 0,
                'total_amount' => $totalAmount,
                'shipping_cost' => $shippingCost,
                'shipping_provider' => $shippingProvider,
                'payment_method' => $paymentMethod,
                'status' => 'pending',
                'payment_status' => 'pending',
                'shipping_address' => $shippingAddress,
                'notes' => $notes,
            ]);

            $itemsBySeller = collect($orderItemsData)->groupBy('seller_id');
            $subOrdersBySellerId = [];

            foreach ($itemsBySeller as $sellerId => $sellerItems) {
                $subOrder = SubOrder::create([
                    'order_id' => $order->id,
                    'seller_id' => $sellerId,
                    'status' => 'pending',
                    'subtotal' => $sellerItems->sum('total_price'),
                    'total_commission' => 0,
                    'total_payout' => 0,
                ]);
                $subOrdersBySellerId[$sellerId] = $subOrder;

                foreach ($sellerItems as $itemData) {
                    $order->items()->create([
                        ...$itemData,
                        'sub_order_id' => $subOrder->id,
                    ]);
                }
            }

            // Apply commission/withholding/shipping share to every item via FeeCalculationService
            $order->load('items.product.category');
            $totals = $this->feeCalculator->applyFeesToOrder($order);

            $order->update(['total_commission' => $totals['total_commission']]);

            // Roll up fee totals per sub-order
            $order->load('items');
            foreach ($subOrdersBySellerId as $sellerId => $subOrder) {
                $items = $order->items->where('seller_id', $sellerId);
                $subOrder->update([
                    'total_commission' => round((float) $items->sum('commission_amount'), 2),
                    'total_payout' => round((float) $items->sum('seller_payout_amount'), 2),
                ]);
            }

            $cart->markAsConverted();

            $order->load('items.product', 'items.seller', 'subOrders', 'user');

            // Don't notify on order creation - notify after payment confirmed
            // app(NotificationService::class)->notifyOrderCreated($order);

            // Siparis olusturuldu event'i tetikle (e-posta vb. listener'lar dinler)
            event(new OrderCreated($order));

            return $order;
        });
    }

    /**
     * Generate unique order number
     */
    public function generateOrderNumber(): string
    {
        $prefix = 'IBJ';
        $date = now()->format('ymd');
        $random = strtoupper(Str::random(4));
        $sequence = str_pad(Order::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);

        return "{$prefix}{$date}{$sequence}{$random}";
    }

    /**
     * Cancel an order
     */
    public function cancelOrder(Order $order): void
    {
        if (! $order->canBeCancelled()) {
            throw new \Exception('Bu sipariş iptal edilemez.');
        }

        DB::transaction(function () use ($order) {
            // Restore stock for each item
            foreach ($order->items as $item) {
                if ($item->offer) {
                    $item->offer->increment('stock', $item->quantity);
                    if ($item->offer->status === 'sold_out') {
                        $item->offer->update(['status' => 'active']);
                    }
                }
            }

            $order->cancel();
        });
    }

    /**
     * Get order by ID with relations
     */
    public function getOrder(int $orderId): ?Order
    {
        return Order::with(['items.product', 'items.seller', 'subOrders.seller:id,business_name,nickname,city', 'user'])
            ->find($orderId);
    }

    /**
     * Get user's orders
     */
    public function getUserOrders(int $userId, int $perPage = 10)
    {
        return Order::forUser($userId)
            ->with(['items.product', 'items.seller:id,business_name,nickname,city,role', 'subOrders.seller:id,business_name,nickname,city'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
}
