'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Truck, CreditCard, Clock, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function IletisimPage() {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    subject: 'genel',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Lütfen zorunlu alanları doldurun.');
      return;
    }
    setSubmitting(true);
    try {
      // TODO: connect to backend contact endpoint when available
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Mesajınız iletildi. En kısa sürede dönüş yapılacak.');
      setForm({ name: '', company: '', email: '', phone: '', subject: 'genel', message: '' });
    } catch {
      toast.error('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="contact-hero">
        <span className="eyebrow">İletişim</span>
        <h1>Bize ulaşın.</h1>
        <p>
          Tedarikçi olmak, hesabınızla ilgili destek almak veya kurumsal işbirliği için ekibimiz
          her zaman hazır.
        </p>
      </div>

      <div className="contact-cards">
        <div className="info-card">
          <div className="ic">
            <Phone strokeWidth={1.5} />
          </div>
          <div className="label">Telefon</div>
          <h3>Çağrı Merkezi</h3>
          <a href="tel:+905428482646" className="link">
            +90 542 848 26 46
          </a>
          <div className="sub">
            Hafta içi 09:00 – 18:00
            <br />
            Cumartesi 10:00 – 14:00
          </div>
        </div>

        <div className="info-card">
          <div className="ic">
            <Mail strokeWidth={1.5} />
          </div>
          <div className="label">E-Posta</div>
          <h3>Destek</h3>
          <a href="mailto:destek@i-bijuteri.com" className="link">
            destek@i-bijuteri.com
          </a>
          <div className="sub">
            Ortalama yanıt süresi: 4 saat
            <br />
            Kurumsal: kurumsal@i-bijuteri.com
          </div>
        </div>

        <div className="info-card">
          <div className="ic">
            <MapPin strokeWidth={1.5} />
          </div>
          <div className="label">Adres</div>
          <h3>Merkez Ofis</h3>
          <div className="sub">
            Kapalıçarşı Bölgesi
            <br />
            Beyazıt Mah. Fatih / İstanbul
            <br />
            34126 Türkiye
          </div>
        </div>
      </div>

      <div className="contact-form-row">
        {/* Left dark panel */}
        <div className="cf-side dark">
          <span className="eyebrow">Yardım Konuları</span>
          <h2>Hangi konuda destek arıyorsunuz?</h2>
          <p>
            Bizimle aşağıdaki konularda iletişime geçebilirsiniz. Sağdaki formu doldurun, en uygun
            ekip arkadaşımız size dönüş yapsın.
          </p>
          <div className="bullets">
            <div className="b">
              <span className="ic">
                <ShieldCheck />
              </span>
              <span>Hesap doğrulama ve onay süreci hakkında</span>
            </div>
            <div className="b">
              <span className="ic">
                <Truck />
              </span>
              <span>Kargo, teslimat ve iade süreçleri</span>
            </div>
            <div className="b">
              <span className="ic">
                <CreditCard />
              </span>
              <span>Ödeme, fatura ve mutabakat</span>
            </div>
            <div className="b">
              <span className="ic">
                <Clock />
              </span>
              <span>Tedarikçi başvurusu ve atölye programı</span>
            </div>
          </div>
        </div>

        {/* Right form */}
        <form onSubmit={handleSubmit} className="cf-form">
          <h3>Mesaj Gönder</h3>
          <div className="sub">Aşağıdaki formu doldurun, en kısa sürede dönüş yapalım.</div>

          <div className="grid">
            <div className="field">
              <label>Ad Soyad <span className="text-[var(--danger)]">*</span></label>
              <div className="wrap">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>Firma</label>
              <div className="wrap">
                <input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </div>
            </div>
            <div className="field">
              <label>E-Posta <span className="text-[var(--danger)]">*</span></label>
              <div className="wrap">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>Telefon</label>
              <div className="wrap">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="field full">
              <label>Konu</label>
              <div className="wrap">
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="flex-1 border-0 outline-0 bg-transparent font-sans text-[14px] text-[var(--ink)]"
                >
                  <option value="genel">Genel Bilgi</option>
                  <option value="hesap">Hesap & Üyelik</option>
                  <option value="siparis">Sipariş & Kargo</option>
                  <option value="tedarikci">Tedarikçi Başvurusu</option>
                  <option value="kurumsal">Kurumsal İşbirliği</option>
                </select>
              </div>
            </div>
            <div className="field full">
              <label>Mesajınız <span className="text-[var(--danger)]">*</span></label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={5}
                placeholder="Konunuzu detaylı yazın…"
              />
            </div>
            <div className="submit-row">
              <p className="priv">
                Gönderdiğiniz bilgiler KVKK kapsamında işlenir. Detaylar için Aydınlatma Metni&apos;ni inceleyin.
              </p>
              <button type="submit" disabled={submitting} className="btn btn-dark">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Gönder
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="map-section">
        <div className="frame">
          <div className="pin">
            <div className="dot" />
            <div className="label">i-bijuteri Merkez · Kapalıçarşı</div>
          </div>
        </div>
      </div>
    </>
  );
}
