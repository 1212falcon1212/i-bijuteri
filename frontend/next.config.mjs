import createMDX from '@next/mdx';
import withPWAInit from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
    experimental: {
        optimizeCss: true,
    },
    images: {
        unoptimized: process.env.NODE_ENV === 'development',
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
                pathname: "/storage/**",
            },
            {
                protocol: "https",
                hostname: "i-bijuteri.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "images.pexels.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "cdn.qukasoft.com",
                pathname: "/**",
            },
        ],
    },
    async rewrites() {
        const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004/api')
            .replace(/\/api\/?$/, '');
        return [
            {
                source: '/storage/:path*',
                destination: `${backendUrl}/storage/:path*`,
            },
        ];
    },
};

const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    fallbacks: {
        document: "/offline",
    },
    runtimeCaching: [
        {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
                cacheName: "google-fonts",
                expiration: {
                    maxEntries: 4,
                    maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
                },
            },
        },
        {
            urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "static-font-assets",
                expiration: {
                    maxEntries: 4,
                    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                },
            },
        },
        {
            urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "static-image-assets",
                expiration: {
                    maxEntries: 64,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
            },
        },
        {
            urlPattern: /\/api\/(?:products|categories).*/i,
            handler: "NetworkFirst",
            options: {
                cacheName: "api-data",
                expiration: {
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
                networkTimeoutSeconds: 10,
            },
        },
    ],
});

const withMDX = createMDX({
    extension: /\.mdx?$/,
    options: {
        remarkPlugins: [],
        rehypePlugins: [],
    },
});

export default withPWA(withMDX(nextConfig));
