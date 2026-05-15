'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { BlogPost } from '@/lib/api';

interface BlogCardProps {
  post: BlogPost;
  className?: string;
}

export function BlogCard({ post, className }: BlogCardProps) {
  const [imgError, setImgError] = useState(false);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <Link href={`/market/blog/${post.slug}`} className={cn('bg-card', className)}>
      <div className="photo">
        {post.featured_image_url && !imgError ? (
          <Image
            src={post.featured_image_url}
            alt={post.title}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-[var(--ink-3)]"
            >
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              <path d="M18 14h-8" />
              <path d="M15 18h-5" />
              <path d="M10 6h8v4h-8V6Z" />
            </svg>
          </div>
        )}
      </div>
      <div className="body">
        {post.category && <div className="cat">{post.category.name}</div>}
        <h3>{post.title}</h3>
        {post.excerpt && <p>{post.excerpt}</p>}
        <div className="meta">
          {post.author && (
            <>
              <b>{post.author.name}</b>
              <span className="dot" />
            </>
          )}
          {post.published_at && <span>{formatDate(post.published_at)}</span>}
          {post.read_time_minutes && (
            <>
              <span className="dot" />
              <span>{post.read_time_minutes} dk okuma</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
