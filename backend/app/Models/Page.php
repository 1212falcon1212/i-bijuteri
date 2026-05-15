<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Page extends Model
{
    protected static function booted(): void
    {
        static::saved(function (Page $page) {
            Cache::forget("cms.page.{$page->slug}");
            Cache::forget("legal.page.{$page->slug}");
            if ($page->category) {
                Cache::forget("cms.pages.category.{$page->category}");
            }
            Cache::forget('cms.layout');
            Cache::forget('cms.homepage.footer_pages');
        });

        static::deleted(function (Page $page) {
            Cache::forget("cms.page.{$page->slug}");
            Cache::forget("legal.page.{$page->slug}");
            if ($page->category) {
                Cache::forget("cms.pages.category.{$page->category}");
            }
            Cache::forget('cms.layout');
            Cache::forget('cms.homepage.footer_pages');
        });
    }

    protected $fillable = [
        'title',
        'slug',
        'content',
        'excerpt',
        'meta_title',
        'meta_description',
        'status',
        'template',
        'category',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    /**
     * Sadece yayindaki sayfalari getirir
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    /**
     * Siralamaya gore getirir
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order');
    }
}
