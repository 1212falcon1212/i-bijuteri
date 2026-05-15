'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Box, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface ProductGalleryProps {
    images: string[];
    productName: string;
    className?: string;
}

function getImageUrl(image: string) {
    if (image.startsWith('http')) return image;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
    return `${apiUrl}/storage/${image}`;
}

export function ProductGallery({ images, productName, className }: ProductGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);

    const hasImages = images && images.length > 0;
    const currentImage = hasImages ? images[selectedIndex] : null;

    const handlePrevious = () => {
        setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className={cn(className)}>
            <div className="pd-main">
                {currentImage ? (
                    <>
                        <Image
                            src={getImageUrl(currentImage)}
                            alt={productName}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 480px"
                            priority
                        />
                        <button
                            type="button"
                            className="zoom"
                            onClick={() => setShowLightbox(true)}
                            aria-label="Zoom"
                        >
                            <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--surface-2)]">
                        <Box className="h-12 w-12 text-[var(--ink-3)] mb-3" strokeWidth={1.2} />
                        <span className="text-[11.5px] text-[var(--ink-3)] uppercase tracking-[.18em]">
                            Görsel yok
                        </span>
                    </div>
                )}
            </div>

            {images.length > 1 && (
                <div className="pd-thumbs">
                    {images.slice(0, 5).map((image, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedIndex(index)}
                            className={cn(selectedIndex === index && 'active')}
                            aria-label={`Görsel ${index + 1}`}
                        >
                            <Image
                                src={getImageUrl(image)}
                                alt={`${productName} - ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="100px"
                            />
                        </button>
                    ))}
                </div>
            )}

            <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
                <DialogContent className="max-w-5xl w-full h-[90vh] p-0 bg-black/95 border-0 rounded-none">
                    <DialogTitle className="sr-only">{productName} – Görsel Galerisi</DialogTitle>
                    <button
                        type="button"
                        className="absolute top-4 right-4 z-50 w-10 h-10 text-white hover:bg-white/20 grid place-items-center"
                        onClick={() => setShowLightbox(false)}
                        aria-label="Kapat"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {images.length > 1 && (
                        <>
                            <button
                                type="button"
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 text-white hover:bg-white/20 grid place-items-center"
                                onClick={handlePrevious}
                                aria-label="Önceki"
                            >
                                <ChevronLeft className="h-8 w-8" />
                            </button>
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 text-white hover:bg-white/20 grid place-items-center"
                                onClick={handleNext}
                                aria-label="Sonraki"
                            >
                                <ChevronRight className="h-8 w-8" />
                            </button>
                        </>
                    )}

                    {currentImage && (
                        <div className="relative w-full h-full flex items-center justify-center p-12">
                            <Image
                                src={getImageUrl(currentImage)}
                                alt={productName}
                                fill
                                className="object-contain"
                                sizes="100vw"
                            />
                        </div>
                    )}

                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setSelectedIndex(index)}
                                    className={cn(
                                        'relative w-12 h-12 overflow-hidden border-2 transition-all',
                                        selectedIndex === index
                                            ? 'border-[var(--accent)] opacity-100'
                                            : 'border-transparent opacity-60 hover:opacity-100'
                                    )}
                                >
                                    <Image
                                        src={getImageUrl(image)}
                                        alt={`${productName} - ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="48px"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
