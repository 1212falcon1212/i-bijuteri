<?php

namespace App\Services;

use App\Models\OrderItem;
use App\Models\Setting;
use App\Models\User;

class FeeCalculationService
{
    protected string $feeMode;

    protected float $flatServiceFee;

    protected float $commissionPercentage;

    protected float $withholdingTaxRate;

    protected bool $serviceFeeEnabled;

    public function __construct()
    {
        $this->feeMode = (string) Setting::getValue('commission.fee_mode', 'hybrid');
        $this->flatServiceFee = (float) Setting::getValue('commission.flat_service_fee', 50);
        $this->commissionPercentage = (float) Setting::getValue('commission.commission_percentage', 10);
        $this->withholdingTaxRate = (float) Setting::getValue('commission.withholding_tax_rate', 1.00);
        $this->serviceFeeEnabled = (bool) Setting::getValue('commission.enabled', true);
    }

    /**
     * Calculate all deductions for a single order item.
     *
     * Modes:
     *  - hybrid (default): percentage commission + flat service fee both applied
     *  - percentage: only percentage commission
     *  - flat: only flat service fee (split across seller's items by caller)
     *  - category: per-category percentage commission
     *
     * @return array{
     *   total_price: float,
     *   commission_rate: float,
     *   commission_amount: float,
     *   service_fee_amount: float,
     *   commission_percentage_amount: float,
     *   flat_service_fee: float,
     *   marketplace_fee_rate: float,
     *   marketplace_fee: float,
     *   withholding_tax_rate: float,
     *   withholding_tax: float,
     *   shipping_cost_share: float,
     *   total_fees: float,
     *   net_seller_amount: float,
     * }
     */
    /**
     * Get effective rates for a given seller, honoring any per-seller overrides.
     *
     * @return array{
     *   commission_percentage: float,
     *   flat_service_fee: float,
     *   withholding_tax_rate: float,
     *   override_active: bool,
     * }
     */
    public function getRatesForSeller(?User $seller): array
    {
        $overrideActive = $seller !== null && (bool) $seller->commission_override_active;

        return [
            'commission_percentage' => $overrideActive && $seller->commission_percentage_override !== null
                ? (float) $seller->commission_percentage_override
                : $this->commissionPercentage,
            'flat_service_fee' => $overrideActive && $seller->flat_service_fee_override !== null
                ? (float) $seller->flat_service_fee_override
                : $this->flatServiceFee,
            'withholding_tax_rate' => $overrideActive && $seller->withholding_tax_rate_override !== null
                ? (float) $seller->withholding_tax_rate_override
                : $this->withholdingTaxRate,
            'override_active' => $overrideActive,
        ];
    }

    public function calculateFees(
        float $totalPrice,
        float $flatFeeShare = 0,
        float $shippingCostShare = 0,
        ?float $categoryCommissionRate = null,
        ?float $vatRate = null,
        ?User $seller = null
    ): array {
        $rates = $this->getRatesForSeller($seller);
        $commissionPercentage = $rates['commission_percentage'];
        $withholdingTaxRate = $rates['withholding_tax_rate'];
        $flatServiceFee = $rates['flat_service_fee'];

        $percentageAmount = 0.0;
        $flatAmount = 0.0;
        $commissionRate = 0.0;

        if ($this->serviceFeeEnabled) {
            switch ($this->feeMode) {
                case 'hybrid':
                    $percentageAmount = $totalPrice * ($commissionPercentage / 100);
                    $flatAmount = $flatFeeShare;
                    $commissionRate = $commissionPercentage;
                    break;

                case 'percentage':
                    $percentageAmount = $totalPrice * ($commissionPercentage / 100);
                    $commissionRate = $commissionPercentage;
                    break;

                case 'category':
                    $rate = $categoryCommissionRate ?? 0;
                    $percentageAmount = $totalPrice * ($rate / 100);
                    $commissionRate = $rate;
                    break;

                case 'flat':
                default:
                    $flatAmount = $flatFeeShare;
                    break;
            }
        }

        $serviceFeeAmount = $percentageAmount + $flatAmount;

        $vatRate = $vatRate ?? 20;
        $priceExclVat = $totalPrice / (1 + $vatRate / 100);
        $withholdingTax = $priceExclVat * ($withholdingTaxRate / 100);

        $totalFees = $serviceFeeAmount + $withholdingTax + $shippingCostShare;
        $netSellerAmount = $totalPrice - $totalFees;

        return [
            'total_price' => round($totalPrice, 2),
            'commission_rate' => round($commissionRate, 2),
            'commission_amount' => round($serviceFeeAmount, 2),
            'service_fee_amount' => round($flatAmount, 2),
            'commission_percentage_amount' => round($percentageAmount, 2),
            'flat_service_fee' => $flatServiceFee,
            'marketplace_fee_rate' => 0,
            'marketplace_fee' => 0,
            'withholding_tax_rate' => $withholdingTaxRate,
            'withholding_tax' => round($withholdingTax, 2),
            'shipping_cost_share' => round($shippingCostShare, 2),
            'total_fees' => round($totalFees, 2),
            'net_seller_amount' => round($netSellerAmount, 2),
        ];
    }

    public function applyFeesToOrderItem(OrderItem $orderItem, float $flatFeeShare = 0, float $shippingCostShare = 0): void
    {
        $categoryRate = null;
        if ($this->feeMode === 'category') {
            $categoryRate = (float) ($orderItem->product?->category?->commission_rate ?? 0);
        }

        $vatRate = (float) ($orderItem->product?->category?->vat_rate ?? 20);

        $seller = $orderItem->seller ?? ($orderItem->seller_id ? User::find($orderItem->seller_id) : null);

        $fees = $this->calculateFees(
            (float) $orderItem->total_price,
            $flatFeeShare,
            $shippingCostShare,
            $categoryRate,
            $vatRate,
            $seller
        );

        $orderItem->update([
            'commission_rate' => $fees['commission_rate'],
            'commission_amount' => $fees['commission_amount'],
            'service_fee_amount' => $fees['service_fee_amount'],
            'commission_percentage_amount' => $fees['commission_percentage_amount'],
            'marketplace_fee' => $fees['marketplace_fee'],
            'withholding_tax' => $fees['withholding_tax'],
            'shipping_cost_share' => $fees['shipping_cost_share'],
            'net_seller_amount' => $fees['net_seller_amount'],
            'seller_payout_amount' => $fees['net_seller_amount'],
        ]);
    }

    /**
     * Apply fees to every item on the order.
     *
     * For modes that include a flat service fee (hybrid, flat) the fee is
     * collected once per seller and split across that seller's items so a
     * buyer purchasing from N sellers pays N × ₺flat_service_fee in total.
     *
     * @return array{
     *   total_commission: float,
     *   total_service_fee: float,
     *   total_marketplace_fee: float,
     *   total_withholding_tax: float,
     *   total_shipping_share: float,
     *   total_net_seller: float,
     *   platform_revenue: float,
     * }
     */
    public function applyFeesToOrder($order): array
    {
        $totalServiceFee = 0;
        $totalWithholdingTax = 0;
        $totalShippingShare = 0;
        $totalNetSeller = 0;

        // Shipping is paid by the buyer and passed through to the seller —
        // it is not deducted from the seller's net product income.
        $shippingPerItem = 0.0;

        $modesWithFlatFee = ['hybrid', 'flat'];
        $usesFlatFee = $this->serviceFeeEnabled && in_array($this->feeMode, $modesWithFlatFee, true);

        $sellerItems = $order->items->groupBy('seller_id');
        foreach ($sellerItems as $sellerId => $items) {
            $seller = $sellerId ? User::find($sellerId) : null;
            $sellerRates = $this->getRatesForSeller($seller);

            $flatFeePerItem = $usesFlatFee
                ? $sellerRates['flat_service_fee'] / $items->count()
                : 0;

            foreach ($items as $item) {
                $this->applyFeesToOrderItem($item, $flatFeePerItem, $shippingPerItem);
                $item->refresh();

                $totalServiceFee += $item->commission_amount;
                $totalWithholdingTax += $item->withholding_tax;
                $totalShippingShare += $item->shipping_cost_share;
                $totalNetSeller += $item->net_seller_amount;
            }
        }

        return [
            'total_commission' => round($totalServiceFee, 2),
            'total_service_fee' => round($totalServiceFee, 2),
            'total_marketplace_fee' => 0,
            'total_withholding_tax' => round($totalWithholdingTax, 2),
            'total_shipping_share' => round($totalShippingShare, 2),
            'total_net_seller' => round($totalNetSeller, 2),
            'platform_revenue' => round($totalServiceFee, 2),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function formatFeeBreakdown(OrderItem $orderItem): array
    {
        $rows = [
            [
                'label' => 'Ürün Toplamı',
                'value' => (float) $orderItem->total_price,
                'formatted' => '₺' . number_format((float) $orderItem->total_price, 2, ',', '.'),
                'type' => 'subtotal',
            ],
        ];

        $percentagePart = (float) ($orderItem->commission_percentage_amount ?? 0);
        $flatPart = (float) ($orderItem->service_fee_amount ?? 0);

        if ($percentagePart > 0) {
            $rate = (float) $orderItem->commission_rate;
            $rows[] = [
                'label' => "Komisyon (%{$rate})",
                'value' => -$percentagePart,
                'formatted' => '-₺' . number_format($percentagePart, 2, ',', '.'),
                'type' => 'deduction',
            ];
        }

        if ($flatPart > 0) {
            $rows[] = [
                'label' => 'Hizmet Bedeli',
                'value' => -$flatPart,
                'formatted' => '-₺' . number_format($flatPart, 2, ',', '.'),
                'type' => 'deduction',
            ];
        }

        if ($percentagePart === 0.0 && $flatPart === 0.0) {
            $combined = (float) $orderItem->commission_amount;
            if ($combined > 0) {
                $rows[] = [
                    'label' => 'Komisyon / Hizmet Bedeli',
                    'value' => -$combined,
                    'formatted' => '-₺' . number_format($combined, 2, ',', '.'),
                    'type' => 'deduction',
                ];
            }
        }

        $rows[] = [
            'label' => 'Stopaj (%' . $this->withholdingTaxRate . ' KDV hariç)',
            'value' => -$orderItem->withholding_tax,
            'formatted' => '-₺' . number_format((float) $orderItem->withholding_tax, 2, ',', '.'),
            'type' => 'deduction',
        ];

        $rows[] = [
            'label' => 'Kargo Payı',
            'value' => -$orderItem->shipping_cost_share,
            'formatted' => '-₺' . number_format((float) $orderItem->shipping_cost_share, 2, ',', '.'),
            'type' => 'deduction',
            'visible' => $orderItem->shipping_cost_share > 0,
        ];

        $rows[] = [
            'label' => 'Net Hakediş',
            'value' => (float) $orderItem->net_seller_amount,
            'formatted' => '₺' . number_format((float) $orderItem->net_seller_amount, 2, ',', '.'),
            'type' => 'total',
        ];

        return $rows;
    }

    /**
     * @return array<string, mixed>
     */
    public function getSellerFeesSummary($order, int $sellerId): array
    {
        $items = $order->items->where('seller_id', $sellerId);

        $totalSales = $items->sum('total_price');
        $totalCommission = $items->sum('commission_amount');
        $totalWithholdingTax = $items->sum('withholding_tax');
        $totalShippingShare = $items->sum('shipping_cost_share');
        $totalNetAmount = $items->sum('net_seller_amount');

        return [
            'seller_id' => $sellerId,
            'total_sales' => round($totalSales, 2),
            'deductions' => [
                'service_fee' => round($totalCommission, 2),
                'withholding_tax' => round($totalWithholdingTax, 2),
                'shipping_share' => round($totalShippingShare, 2),
            ],
            'total_deductions' => round($totalCommission + $totalWithholdingTax + $totalShippingShare, 2),
            'net_amount' => round($totalNetAmount, 2),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function getRates(): array
    {
        return [
            'fee_mode' => $this->feeMode,
            'flat_service_fee' => $this->flatServiceFee,
            'commission_percentage' => $this->commissionPercentage,
            'withholding_tax_rate' => $this->withholdingTaxRate,
            'service_fee_enabled' => $this->serviceFeeEnabled,
            'commission_enabled' => $this->serviceFeeEnabled,
        ];
    }
}
