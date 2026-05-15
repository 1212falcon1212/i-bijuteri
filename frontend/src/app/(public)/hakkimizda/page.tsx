import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description:
    "Türkiye'nin B2B bijuteri pazaryeri i-bijuteri. Atölyelerden vitrine, şeffaf toptan tedarik.",
  alternates: {
    canonical: 'https://i-bijuteri.com/hakkimizda',
  },
};

const ABOUT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1600&q=85&auto=format&fit=crop';
const ABOUT_CTA_IMAGE =
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=85&auto=format&fit=crop';

const STATS = [
  { v: '340+', l: 'Onaylı Tedarikçi' },
  { v: '12.4K', l: 'Aktif Ürün' },
  { v: '23K+', l: 'Kuyumcu' },
  { v: '48 sa', l: 'Teslimat' },
];

const VALUES = [
  {
    n: '01.',
    h: 'Onaylı tedarik.',
    p: 'Her satıcı kayıt sırasında belge ve referans denetiminden geçer. Listelenen her atölye doğrulanmıştır.',
  },
  {
    n: '02.',
    h: 'Doğrudan tedarik.',
    p: 'Aracı yok. Toptancıdan doğrudan vitrine; şeffaf, görünür ve adil fiyatlandırma.',
  },
  {
    n: '03.',
    h: 'Şeffaf fiyat aralığı.',
    p: 'Aynı ürün farklı tedarikçilerden farklı fiyatlarla listelenir. Karşılaştırın, en uygunu seçin.',
  },
];

const TIMELINE = [
  { y: '2026', h: 'Pazaryeri lansmanı', p: 'i-depo altyapısı üzerine kurulan B2B bijuteri vertikali.' },
  { y: 'Q2', h: 'Hızlı mutabakat', p: 'Satıcılar için ödeme süreleri kısaltılır, otomatik mutabakat raporları eklenir.' },
  { y: 'Q3', h: 'Bölgesel depo', p: 'İstanbul, Bursa ve İzmir bölge depoları aktifleşir; teslimat hızlanır.' },
  { y: 'Q4', h: 'Atölye programı', p: 'Geleneksel atölyelere dijital satıcı paneli eğitim ve destek programı.' },
];

export default function HakkimizdaPage() {
  return (
    <>
      <div className="about-hero">
        <span className="eyebrow">i-bijuteri Hikayesi</span>
        <h1>Daima atölyenin yanında.</h1>
        <p>
          Türkiye&apos;nin köklü bijuteri ve takı atölyeleriyle, vitrinleriyle perakendecileri buluşturmak için
          kurduk. Aracısız, şeffaf, doğrudan — toptan bijuteri ticareti yeniden tanımlandı.
        </p>
      </div>

      <div className="about-banner">
        <div className="frame">
          <img src={ABOUT_HERO_IMAGE} alt="i-bijuteri atölyeleri" />
        </div>
        <div className="stamp">
          <div className="l">Atölyelerden Vitrine</div>
          <div className="n">İstanbul · Bursa · İzmir · Ankara</div>
        </div>
      </div>

      <div className="story">
        <div className="label">Hikayemiz</div>
        <div className="body">
          <h2>Toptancı ile perakendeciyi tek platformda buluşturduk.</h2>
          <p>
            Türkiye&apos;nin köklü bijuteri ve takı atölyeleri yıllardır kendi pazarlarıyla, kendi
            müşterileriyle çalışıyordu. Küçük bir kuyumcu vitrini için yeni bir koleksiyon bulmak,
            farklı atölyeleri tek tek aramak ve fiyat karşılaştırmak — günler süren bir süreçti.
          </p>
          <p>
            Biz bu süreci dönüştürmek için yola çıktık. i-bijuteri, B2B bijuteri tedarik ticaretini
            dijitalleştirmek, atölyeden vitrine giden yolu kısaltmak için var. Komisyon değil
            şeffaflık, baskı değil seçenek, satış değil paylaşılan başarı.
          </p>
          <p>
            Bugün 340+ onaylı tedarikçi, 12.400+ aktif ürün ve 23.000+ kuyumcu vitrinine ulaşmış
            platformuz. Her gün büyüyoruz, her gün daha iyi bir B2B deneyimi için çalışıyoruz.
          </p>
        </div>
      </div>

      <div className="about-stats">
        <div className="grid">
          {STATS.map((s) => (
            <div key={s.l} className="stat">
              <div className="v">{s.v}</div>
              <div className="l">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="values">
        <div className="head">
          <span className="eyebrow">Değerlerimiz</span>
          <h2>Üç ilke, tek dil.</h2>
        </div>
        <div className="grid">
          {VALUES.map((v) => (
            <div key={v.n} className="value-card">
              <div className="n">{v.n}</div>
              <h3>{v.h}</h3>
              <p>{v.p}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="timeline">
        <div className="mb-12">
          <span className="eyebrow inline-flex items-center gap-3">
            <span className="gold-rule" /> Yol Haritası
          </span>
          <h2 className="font-display italic text-[40px] text-[var(--ink)] mt-3 leading-[1.1] -tracking-[.005em]">
            Önümüzdeki dönem.
          </h2>
        </div>
        {TIMELINE.map((t) => (
          <div key={t.y} className="row">
            <div className="year">{t.y}</div>
            <div className="text">
              <h4>{t.h}</h4>
              <p>{t.p}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="about-cta">
        <div className="photo">
          <img src={ABOUT_CTA_IMAGE} alt="" />
        </div>
        <div className="copy">
          <span className="eyebrow">İletişim</span>
          <h3>Sorunuz mu var?</h3>
          <p>
            Tedarikçi olmak, mevcut hesabınızla ilgili yardım almak veya kurumsal işbirliği
            yapmak için ekibimize ulaşın.
          </p>
          <Link href="/iletisim" className="btn btn-gold-outline">
            İletişime Geç
          </Link>
        </div>
      </div>
    </>
  );
}
