"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { blogApi, BlogPost, BlogCategory } from "@/lib/api";
import { BlogCard } from "@/components/market/BlogCard";
import { cn } from "@/lib/utils";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const activeCategory = searchParams.get("category") || "";
  const currentPage = Number(searchParams.get("page")) || 1;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await blogApi.getPosts({
        category: activeCategory || undefined,
        page: currentPage,
        per_page: 12,
      });
      if (response.data) {
        setPosts(response.data.posts);
        setCategories(response.data.categories);
        setPagination({
          current_page: response.data.pagination.current_page,
          last_page: response.data.pagination.last_page,
          total: response.data.pagination.total,
        });
      }
    } catch {
      setError("Blog yazıları yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    router.push(`/market/blog${params.toString() ? `?${params}` : ""}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (page > 1) params.set("page", String(page));
    router.push(`/market/blog${params.toString() ? `?${params}` : ""}`);
  };

  const featured = posts.find((p) => p.is_featured) || (posts.length > 0 ? posts[0] : null);
  const restPosts = posts.filter((p) => p.id !== featured?.id);

  return (
    <>
      <div className="blog-hero">
        <span className="eyebrow">i-bijuteri Jurnal</span>
        <h1>Atölyeden hikayeler.</h1>
        <p>
          Sezon trendleri, üretim atölyeleri, tedarik rehberleri ve sektör notları.
        </p>
      </div>

      <nav className="blog-tabs">
        <button
          onClick={() => handleCategoryChange("")}
          className={cn(!activeCategory && "active")}
        >
          Tümü
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.slug)}
            className={cn(activeCategory === cat.slug && "active")}
          >
            {cat.name}
          </button>
        ))}
      </nav>

      {isLoading ? (
        <div className="blog-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card">
              <div className="photo bg-[var(--surface-2)] animate-pulse" />
              <div className="body">
                <div className="h-3 w-16 bg-[var(--line)] mb-2 animate-pulse" />
                <div className="h-5 w-3/4 bg-[var(--line)] mb-3 animate-pulse" />
                <div className="h-4 w-full bg-[var(--line)] mb-2 animate-pulse" />
                <div className="h-3 w-1/2 bg-[var(--line)] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="max-w-[1320px] mx-auto px-8 py-16 text-center">
          <p className="text-[var(--danger)] mb-4">{error}</p>
          <button onClick={loadData} className="btn btn-ghost-dark">
            Tekrar Dene
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="max-w-[1320px] mx-auto px-8 py-16 text-center">
          <Search className="w-12 h-12 mx-auto text-[var(--ink-3)] mb-4" strokeWidth={1.2} />
          <h3 className="font-display italic text-[24px] text-[var(--ink)] mb-2">
            Yazı Bulunamadı
          </h3>
          <p className="text-[var(--ink-2)] mb-6">
            {activeCategory
              ? "Bu kategoride henüz yazı yok."
              : "Henüz blog yazısı eklenmemiş."}
          </p>
          {activeCategory && (
            <button onClick={() => handleCategoryChange("")} className="btn btn-dark">
              Tüm Yazılar
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Featured post */}
          {featured && (
            <div className="blog-featured">
              <Link href={`/market/blog/${featured.slug}`}>
                <div className="photo">
                  {featured.featured_image_url ? (
                    <Image
                      src={featured.featured_image_url}
                      alt={featured.title}
                      fill
                      sizes="(max-width: 900px) 100vw, 60vw"
                      className="object-cover"
                      unoptimized
                    />
                  ) : null}
                </div>
                <div className="body">
                  <div className="cat">
                    {featured.category?.name || 'Genel'}
                    {featured.is_featured && <span className="featured">Öne Çıkan</span>}
                  </div>
                  <h2>{featured.title}</h2>
                  {featured.excerpt && <p>{featured.excerpt}</p>}
                  <div className="meta">
                    {featured.author && <b>{featured.author.name}</b>}
                    {featured.published_at && (
                      <>
                        <span className="dot" />
                        <span>{formatDate(featured.published_at)}</span>
                      </>
                    )}
                    {featured.read_time_minutes && (
                      <>
                        <span className="dot" />
                        <span>{featured.read_time_minutes} dk okuma</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Post grid */}
          <div className="blog-grid">
            {restPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="pagi">
              <button
                type="button"
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(pagination.last_page, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePageChange(p)}
                  className={cn(pagination.current_page === p && 'active')}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page >= pagination.last_page}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
