'use client';

import Link from 'next/link';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=1400&q=85&auto=format&fit=crop';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <div className="login-split flex-1 relative">
        <Link
          href="/"
          aria-label="i-bijuteri"
          className="absolute top-6 left-6 z-10 hidden md:inline-flex items-center bg-white/85 backdrop-blur rounded-md px-3 py-2 shadow-sm"
        >
          <img
            src="/i-bijuteri-logo.webp"
            alt="i-bijuteri"
            className="block h-8 w-auto object-contain"
            width={160}
            height={40}
          />
        </Link>
        {/* Left photo + copy */}
        <div className="login-photo">
          <img src={HERO_IMAGE} alt="" />
          <div className="copy">
            <span className="eyebrow">B2B Pazaryeri · 2026</span>
            <h2>
              Onaylı tedarikçi.
              <br />
              Doğrudan tedarik.
              <br />
              Şeffaf fiyat.
            </h2>
            <p>
              340+ onaylı tedarikçi, 12.400+ aktif ürün. Toptan fiyat avantajıyla
              vitrininize doğrudan tedarik.
            </p>
            <div className="meta-row">
              <div className="item">
                <div className="v">340+</div>
                <div className="l">Tedarikçi</div>
              </div>
              <div className="item">
                <div className="v">12.4K</div>
                <div className="l">Aktif Ürün</div>
              </div>
              <div className="item">
                <div className="v">48 sa</div>
                <div className="l">Teslimat</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="login-form">{children}</div>
      </div>
    </div>
  );
}
