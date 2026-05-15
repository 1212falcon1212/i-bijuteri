<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Türkiye e-ticaret KDV oranlarına göre kategori bazlı KDV ayarı.
     *
     * Vitamin / besin takviyesi / mama → %1
     * Diğer tüm kozmetik / kişisel bakım / diş / medikal → %10
     */
    public function up(): void
    {
        // Önce tüm kategorileri %10'a çek (kozmetik / diş / medikal default'u)
        DB::table('categories')->update(['vat_rate' => 10.00]);

        // Vitamin & besin takviyesi sınıfı %1
        $reducedRateNames = [
            'Vitaminler',
            'Besin Takviyeleri',
            'Anne Besin Takviyesi',
            'Bebek Mamaları',
            'Bebek ve Çocuk Çayları',
        ];

        $parentIds = DB::table('categories')
            ->whereIn('name', $reducedRateNames)
            ->pluck('id')
            ->all();

        // Hem belirtilen kategoriler hem alt kategorileri %1
        $allReducedIds = array_unique(array_merge(
            $parentIds,
            DB::table('categories')->whereIn('parent_id', $parentIds)->pluck('id')->all(),
        ));

        if (! empty($allReducedIds)) {
            DB::table('categories')
                ->whereIn('id', $allReducedIds)
                ->update(['vat_rate' => 1.00]);
        }
    }

    public function down(): void
    {
        DB::table('categories')->update(['vat_rate' => 20.00]);
    }
};
