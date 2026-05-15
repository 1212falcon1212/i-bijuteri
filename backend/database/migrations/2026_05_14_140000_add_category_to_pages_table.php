<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            if (! Schema::hasColumn('pages', 'category')) {
                $table->string('category', 50)->default('kurumsal')->after('content');
            }
        });

        Schema::table('pages', function (Blueprint $table) {
            if (! Schema::hasColumn('pages', 'sort_order')) {
                $table->integer('sort_order')->default(0)->after('category');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            if (Schema::hasColumn('pages', 'category')) {
                $table->dropColumn('category');
            }
        });
    }
};
