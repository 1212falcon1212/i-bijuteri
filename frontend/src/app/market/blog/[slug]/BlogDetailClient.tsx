"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import DOMPurify from "dompurify";
import { ArrowLeft } from "lucide-react";
import { blogApi, BlogPost } from "@/lib/api";
import { BlogCard } from "@/components/market/BlogCard";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function initials(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

export function BlogDetailClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const loadPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await blogApi.getPost(slug);
        if (response.data) {
          setPost(response.data.post);
          setRelatedPosts(response.data.related_posts);
        } else {
          setError("Yazı bulunamadı.");
        }
      } catch {
        setError("Yazı yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };
    loadPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-[880px] mx-auto px-8 py-12 space-y-6">
        <div className="h-4 w-48 bg-[var(--surface-2)] animate-pulse mx-auto" />
        <div className="h-12 w-3/4 bg-[var(--surface-2)] animate-pulse mx-auto" />
        <div className="aspect-[21/9] w-full bg-[var(--surface-2)] animate-pulse" />
        <div className="space-y-3 max-w-[760px] mx-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 w-full bg-[var(--surface-2)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-[760px] mx-auto px-8 py-24 text-center">
        <p className="text-[var(--danger)] mb-6 text-[15px]">{error || "Yazı bulunamadı."}</p>
        <button onClick={() => router.push("/market/blog")} className="btn btn-dark">
          <ArrowLeft className="w-4 h-4" /> Blog&apos;a Dön
        </button>
      </div>
    );
  }

  const sanitizedContent =
    typeof window !== "undefined" ? DOMPurify.sanitize(post.content || "") : post.content || "";

  return (
    <>
      {/* Breadcrumb */}
      <div className="crumbs">
        <Link href="/market" className="a">
          Pazaryeri
        </Link>
        <span className="sep">›</span>
        <Link href="/market/blog" className="a">
          Jurnal
        </Link>
        {post.category && (
          <>
            <span className="sep">›</span>
            <Link href={`/market/blog?category=${post.category.slug}`} className="a">
              {post.category.name}
            </Link>
          </>
        )}
        <span className="sep">›</span>
        <span className="now truncate max-w-[280px]">{post.title}</span>
      </div>

      {/* Article header */}
      <div className="bd-header">
        <div className="cat">{post.category?.name || 'Genel'}</div>
        <h1>{post.title}</h1>
        <div className="meta">
          {post.author && <b>{post.author.name}</b>}
          {post.published_at && (
            <>
              {post.author && <span className="dot" />}
              <span>{formatDate(post.published_at)}</span>
            </>
          )}
          {post.read_time_minutes && (
            <>
              <span className="dot" />
              <span>{post.read_time_minutes} dk okuma</span>
            </>
          )}
        </div>
      </div>

      {/* Hero photo */}
      {post.featured_image_url && !imgError && (
        <div className="bd-photo">
          <div className="frame">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              sizes="(max-width: 1480px) 100vw, 1480px"
              className="object-cover"
              onError={() => setImgError(true)}
              unoptimized
              priority
            />
          </div>
        </div>
      )}

      {/* Content */}
      <article className="bd-content">
        {post.excerpt && <p className="lead">{post.excerpt}</p>}
        <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      </article>

      {/* Tags + share */}
      {post.tags && post.tags.length > 0 && (
        <div className="bd-foot">
          <div className="tags">
            {post.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Author card */}
      {post.author && (
        <div className="bd-author">
          <div className="av">{initials(post.author.name)}</div>
          <div>
            <div className="l">Yazar</div>
            <div className="n">{post.author.name}</div>
            <div className="bio">
              i-bijuteri editör ekibinden. Bijuteri ve takı sektörü hakkında haftalık
              yazılar.
            </div>
          </div>
        </div>
      )}

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <div className="bd-related">
          <div className="head">
            <h2>İlgili Yazılar</h2>
          </div>
          <div className="grid">
            {relatedPosts.slice(0, 3).map((related) => (
              <BlogCard key={related.id} post={related} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
