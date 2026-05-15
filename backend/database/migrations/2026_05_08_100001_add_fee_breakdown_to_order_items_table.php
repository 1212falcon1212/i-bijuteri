<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds audit-friendly breakdown columns to order_items so that the hybrid
     * fee model (percentage commission + flat service fee) can be inspected
     * after the fact. The legacy commission_amount column continues to hold
     * the combined total for backwards compatibility.
     */
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'service_fee_amount')) {
                $table->decimal('service_fee_amount', 10, 2)->default(0)->after('commission_amount');
            }
            if (!Schema::hasColumn('order_items', 'commission_percentage_amount')) {
                $table->decimal('commission_percentage_amount', 10, 2)->default(0)->after('service_fee_amount');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['service_fee_amount', 'commission_percentage_amount']);
        });
    }
};
