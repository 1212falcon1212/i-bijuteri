<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * "Besin Takviyeleri > Anti-Aging" (id=126) altında 633 cilt bakım ürünü var
     * (yanlış kategorize edilmiş veri). Bu kategoriyi kozmetik KDV oranına (%10) çek
     * ki stopaj hesabı doğru çıksın. Ürün taşıma ayrı bir veri temizleme işi.
     */
    public function up(): void
    {
        DB::table('categories')
            ->where('id', 126)
            ->where('name', 'Anti-Aging')
            ->update(['vat_rate' => 10.00]);
    }

    public function down(): void
    {
        DB::table('categories')
            ->where('id', 126)
            ->where('name', 'Anti-Aging')
            ->update(['vat_rate' => 1.00]);
    }
};
