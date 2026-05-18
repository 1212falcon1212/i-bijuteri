<?php

namespace App\Interfaces;

class RefundResult
{
    public function __construct(
        public bool $success,
        public ?string $refundId = null,
        public ?float $refundedAmount = null,
        public ?string $error = null,
    ) {}

    public static function success(string $refundId, float $refundedAmount): self
    {
        return new self(success: true, refundId: $refundId, refundedAmount: $refundedAmount);
    }

    public static function failure(string $error): self
    {
        return new self(success: false, error: $error);
    }
}
