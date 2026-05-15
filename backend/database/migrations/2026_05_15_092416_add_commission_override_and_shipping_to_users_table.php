<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('commission_override_active')->default(false)->after('seller_review_count');
            $table->decimal('commission_percentage_override', 5, 2)->nullable()->after('commission_override_active');
            $table->decimal('flat_service_fee_override', 8, 2)->nullable()->after('commission_percentage_override');
            $table->decimal('withholding_tax_rate_override', 5, 2)->nullable()->after('flat_service_fee_override');
            $table->decimal('default_shipping_cost', 8, 2)->nullable()->after('withholding_tax_rate_override');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'commission_override_active',
                'commission_percentage_override',
                'flat_service_fee_override',
                'withholding_tax_rate_override',
                'default_shipping_cost',
            ]);
        });
    }
};
