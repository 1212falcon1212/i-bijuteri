'use client';

import React from 'react';
import { ProductCard } from './ProductCard';

interface GridProductCardProps {
  product: {
    id: number;
    name: string;
    image?: string;
    image_url?: string;
    brand?: string;
    lowest_price?: number;
    highest_price?: number;
    offers_count?: number;
    stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
    default_offer_id?: number;
  };
  className?: string;
}

/**
 * Grid view of marketplace product card. Renders identical `.mp-card` DOM as
 * `ProductCard` for visual consistency — the design handoff uses one canonical
 * card layout across home, category, search, and related sections.
 */
export const GridProductCard = React.memo(function GridProductCard({
  product,
  className,
}: GridProductCardProps) {
  return <ProductCard product={product} className={className} />;
});
