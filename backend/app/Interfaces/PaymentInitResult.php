<?php

namespace App\Interfaces;

class PaymentInitResult
{
    public function __construct(
        public bool $success,
        public ?string $paymentUrl = null,
        public ?string $checkoutHtml = null,
        public ?string $transactionId = null,
        public ?string $error = null,
        public bool $requiresCardInput = false,
    ) {}

    public static function success(
        ?string $paymentUrl = null,
        ?string $checkoutHtml = null,
        ?string $transactionId = null,
        bool $requiresCardInput = false,
    ): self {
        return new self(
            success: true,
            paymentUrl: $paymentUrl,
            checkoutHtml: $checkoutHtml,
            transactionId: $transactionId,
            requiresCardInput: $requiresCardInput,
        );
    }

    public static function failure(string $error): self
    {
        return new self(success: false, error: $error);
    }
}
