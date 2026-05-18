<?php

namespace App\Interfaces;

class PaymentResult
{
    public function __construct(
        public bool $success,
        public string $status,
        public ?string $transactionId = null,
        public ?float $paidAmount = null,
        public ?string $error = null,
        public array $rawData = [],
    ) {}

    public static function completed(string $transactionId, float $paidAmount, array $rawData = []): self
    {
        return new self(success: true, status: 'completed', transactionId: $transactionId, paidAmount: $paidAmount, rawData: $rawData);
    }

    public static function pending(string $transactionId, array $rawData = []): self
    {
        return new self(success: true, status: 'pending', transactionId: $transactionId, rawData: $rawData);
    }

    public static function failed(string $error, array $rawData = []): self
    {
        return new self(success: false, status: 'failed', error: $error, rawData: $rawData);
    }
}
