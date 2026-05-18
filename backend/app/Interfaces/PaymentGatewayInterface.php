<?php

namespace App\Interfaces;

use App\Models\Order;
use Illuminate\Http\Request;

interface PaymentGatewayInterface
{
    /**
     * Initialize a payment for the given order
     * Returns payment URL or HTML for checkout form
     */
    public function initialize(Order $order): PaymentInitResult;

    /**
     * Generate checkout HTML/iframe content
     */
    public function getCheckoutHtml(Order $order): string;

    /**
     * Handle payment callback from gateway
     */
    public function handleCallback(Request $request): PaymentResult;

    /**
     * Process refund for an order
     */
    public function refund(Order $order, float $amount): RefundResult;

    /**
     * Get gateway name
     */
    public function getName(): string;
}
