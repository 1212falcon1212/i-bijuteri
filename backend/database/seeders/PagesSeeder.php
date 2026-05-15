<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PagesSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->pages() as $page) {
            Page::updateOrCreate(
                ['slug' => $page['slug']],
                array_merge($page, [
                    'status' => 'published',
                    'template' => $page['template'] ?? 'default',
                ])
            );
        }

        $this->command?->info('Pages seeded: '.Page::count());
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function pages(): array
    {
        return array_merge(
            $this->corporatePages(),
            $this->legalPages(),
            $this->helpPages(),
        );
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function corporatePages(): array
    {
        return [
            [
                'slug' => 'hakkimizda',
                'title' => 'Hakkımızda',
                'category' => 'kurumsal',
                'sort_order' => 1,
                'meta_title' => 'Hakkımızda - i-Bijuteri',
                'meta_description' => 'i-Bijuteri, Türkiye\'nin önde gelen B2B bijuteri pazaryeri olarak toptan bijuteri ticaretini dijitalleştiriyor.',
                'excerpt' => 'Türkiye\'nin B2B bijuteri pazaryeri i-Bijuteri hakkında.',
                'content' => $this->aboutContent(),
            ],
            [
                'slug' => 'iletisim',
                'title' => 'İletişim',
                'category' => 'kurumsal',
                'template' => 'contact',
                'sort_order' => 2,
                'meta_title' => 'İletişim - i-Bijuteri',
                'meta_description' => 'i-Bijuteri ile iletişime geçin. Telefon, e-posta ve adres bilgilerimiz.',
                'excerpt' => 'Bize ulaşın. Sorularınız ve önerileriniz için iletişim bilgilerimiz.',
                'content' => $this->contactContent(),
            ],
            [
                'slug' => 'kariyer',
                'title' => 'Kariyer',
                'category' => 'kurumsal',
                'sort_order' => 3,
                'meta_title' => 'Kariyer - i-Bijuteri',
                'meta_description' => 'i-Bijuteri ekibine katılın. Açık pozisyonlarımızı keşfedin.',
                'excerpt' => 'Hızla büyüyen ekibimize katılın.',
                'content' => $this->careerContent(),
            ],
            [
                'slug' => 'basin-odasi',
                'title' => 'Basın Odası',
                'category' => 'kurumsal',
                'sort_order' => 4,
                'meta_title' => 'Basın Odası - i-Bijuteri',
                'meta_description' => 'i-Bijuteri basın bültenleri, kurumsal kit ve medya kaynakları.',
                'excerpt' => 'Basın bültenleri ve kurumsal medya kaynakları.',
                'content' => $this->pressContent(),
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function legalPages(): array
    {
        return [
            [
                'slug' => 'kvkk',
                'title' => 'KVKK Aydınlatma Metni',
                'category' => 'legal',
                'template' => 'legal',
                'sort_order' => 10,
                'meta_title' => 'KVKK Aydınlatma Metni - i-Bijuteri',
                'meta_description' => '6698 sayılı KVKK kapsamında kişisel verilerin işlenmesine ilişkin aydınlatma metni.',
                'excerpt' => '6698 sayılı KVKK kapsamında veri işleme şartları.',
                'content' => $this->kvkkContent(),
            ],
            [
                'slug' => 'gizlilik-politikasi',
                'title' => 'Gizlilik Politikası',
                'category' => 'legal',
                'template' => 'legal',
                'sort_order' => 11,
                'meta_title' => 'Gizlilik Politikası - i-Bijuteri',
                'meta_description' => 'Kişisel verilerin nasıl toplandığı, kullanıldığı ve korunduğu hakkında bilgilendirme.',
                'excerpt' => 'Verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında.',
                'content' => $this->privacyContent(),
            ],
            [
                'slug' => 'kullanim-kosullari',
                'title' => 'Kullanım Koşulları',
                'category' => 'legal',
                'template' => 'legal',
                'sort_order' => 12,
                'meta_title' => 'Kullanım Koşulları - i-Bijuteri',
                'meta_description' => 'Platform kullanım koşulları ve üyelik şartları.',
                'excerpt' => 'Platform kullanım koşulları ve sorumluluklar.',
                'content' => $this->termsContent(),
            ],
            [
                'slug' => 'cerez-politikasi',
                'title' => 'Çerez Politikası',
                'category' => 'legal',
                'template' => 'legal',
                'sort_order' => 13,
                'meta_title' => 'Çerez Politikası - i-Bijuteri',
                'meta_description' => 'Web sitemizde kullanılan çerez türleri ve yönetimi hakkında bilgilendirme.',
                'excerpt' => 'Web sitemizde kullanılan çerez türleri ve yönetimi.',
                'content' => $this->cookiesContent(),
            ],
            [
                'slug' => 'mesafeli-satis-sozlesmesi',
                'title' => 'Mesafeli Satış Sözleşmesi',
                'category' => 'legal',
                'template' => 'legal',
                'sort_order' => 14,
                'meta_title' => 'Mesafeli Satış Sözleşmesi - i-Bijuteri',
                'meta_description' => 'Platform üzerinden gerçekleştirilen B2B satışlara ilişkin mesafeli satış sözleşmesi.',
                'excerpt' => '6502 sayılı Kanun kapsamında mesafeli satış sözleşmesi.',
                'content' => $this->distanceSalesContent(),
            ],
            [
                'slug' => 'iade-politikasi',
                'title' => 'İade Politikası',
                'category' => 'legal',
                'template' => 'legal',
                'sort_order' => 15,
                'meta_title' => 'İade Politikası - i-Bijuteri',
                'meta_description' => 'Sipariş iptali, ürün iadesi ve geri ödeme süreçleri.',
                'excerpt' => 'Sipariş iptali, ürün iadesi ve geri ödeme süreçleri.',
                'content' => $this->returnPolicyContent(),
            ],
            [
                'slug' => 'uyelik-sozlesmesi',
                'title' => 'Üyelik Sözleşmesi',
                'category' => 'legal',
                'template' => 'legal',
                'sort_order' => 16,
                'meta_title' => 'Üyelik Sözleşmesi - i-Bijuteri',
                'meta_description' => 'B2B bijuteri pazaryeri üyelik koşulları ve hak/yükümlülükler.',
                'excerpt' => 'Platform üyelik koşulları, hak ve yükümlülükler.',
                'content' => $this->membershipContent(),
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function helpPages(): array
    {
        return [
            [
                'slug' => 'sss',
                'title' => 'Sıkça Sorulan Sorular',
                'category' => 'yardim',
                'sort_order' => 20,
                'meta_title' => 'Sıkça Sorulan Sorular - i-Bijuteri',
                'meta_description' => 'i-Bijuteri hakkında merak ettikleriniz. SSS bölümümüze göz atın.',
                'excerpt' => 'En çok sorulan sorular ve cevapları.',
                'content' => $this->faqContent(),
            ],
            [
                'slug' => 'siparis-sureci',
                'title' => 'Sipariş Süreci',
                'category' => 'yardim',
                'sort_order' => 21,
                'meta_title' => 'Sipariş Süreci - i-Bijuteri',
                'meta_description' => 'i-Bijuteri\'de sipariş nasıl verilir, adım adım sipariş süreci.',
                'excerpt' => 'Adım adım sipariş süreci.',
                'content' => $this->orderProcessContent(),
            ],
            [
                'slug' => 'kargo-teslimat',
                'title' => 'Kargo & Teslimat',
                'category' => 'yardim',
                'sort_order' => 22,
                'meta_title' => 'Kargo & Teslimat - i-Bijuteri',
                'meta_description' => 'Anlaşmalı kargo firmaları, teslimat süreleri ve takip.',
                'excerpt' => 'Kargo firmaları, teslimat süreleri ve takip bilgisi.',
                'content' => $this->shippingContent(),
            ],
            [
                'slug' => 'iade-degisim',
                'title' => 'İade ve Değişim',
                'category' => 'yardim',
                'sort_order' => 23,
                'meta_title' => 'İade ve Değişim - i-Bijuteri',
                'meta_description' => 'İade ve değişim talebi nasıl oluşturulur, koşullar nelerdir.',
                'excerpt' => 'İade ve değişim taleplerinde izlenecek adımlar.',
                'content' => $this->returnExchangeContent(),
            ],
            [
                'slug' => 'odeme-yontemleri',
                'title' => 'Ödeme Yöntemleri',
                'category' => 'yardim',
                'sort_order' => 24,
                'meta_title' => 'Ödeme Yöntemleri - i-Bijuteri',
                'meta_description' => 'Kredi kartı, havale/EFT, taksit seçenekleri ve güvenli ödeme.',
                'excerpt' => 'Kredi kartı, havale/EFT ve taksit seçenekleri.',
                'content' => $this->paymentMethodsContent(),
            ],
            [
                'slug' => 'satici-olmak',
                'title' => 'Satıcı Olmak',
                'category' => 'yardim',
                'sort_order' => 25,
                'meta_title' => 'Satıcı Olmak - i-Bijuteri',
                'meta_description' => 'i-Bijuteri\'de satıcı olmak için VKN ile kayıt ve gerekli belgeler.',
                'excerpt' => 'VKN ile kayıt ve belge yükleme adımları.',
                'content' => $this->becomeSellerContent(),
            ],
            [
                'slug' => 'hesap-yonetimi',
                'title' => 'Hesap Yönetimi',
                'category' => 'yardim',
                'sort_order' => 26,
                'meta_title' => 'Hesap Yönetimi - i-Bijuteri',
                'meta_description' => 'Profil bilgileri, şifre, adres ve hesap güvenliği yönetimi.',
                'excerpt' => 'Profil, şifre ve adres yönetimi.',
                'content' => $this->accountContent(),
            ],
        ];
    }

    private function aboutContent(): string
    {
        return <<<'HTML'
<h2>Türkiye'nin B2B Bijuteri Pazaryeri</h2>
<p>i-Bijuteri, bijuteri toptancıları ve perakendecileri buluşturan, güvenli ve şeffaf bir B2B pazaryeridir. Türkiye'nin dört bir yanından satıcıları tek bir platformda topluyor, alıcıların ihtiyaç duyduğu ürünlere en uygun fiyatlarla erişmesini sağlıyoruz.</p>

<h3>Misyonumuz</h3>
<p>Bijuteri sektörünün B2B ticaretini dijitalleştirerek; satıcılara geniş bir alıcı kitlesine erişim, alıcılara ise rekabetçi fiyatlar ve güvenli alışveriş deneyimi sunmak.</p>

<h3>Vizyonumuz</h3>
<p>Türkiye'nin en büyük ve en güvenilir B2B bijuteri pazaryeri olmak; teknolojiyi sektörle buluşturarak iş süreçlerini kolaylaştırmak.</p>

<h3>Neden i-Bijuteri?</h3>
<ul>
<li><strong>Güvenli Ticaret:</strong> Tüm işlemler platform güvencesi altında.</li>
<li><strong>Geniş Ürün Yelpazesi:</strong> Binlerce ürün, yüzlerce satıcı.</li>
<li><strong>Rekabetçi Fiyatlar:</strong> Birden fazla satıcıdan teklif alın.</li>
<li><strong>Hızlı Teslimat:</strong> Anlaşmalı kargo firmaları.</li>
<li><strong>7/24 Destek:</strong> Profesyonel destek ekibi.</li>
</ul>

<h3>Değerlerimiz</h3>
<p>Güvenilirlik, şeffaflık, müşteri odaklılık ve yenilikçilik temel değerlerimizdir. Her gün daha iyiye ulaşmak için çalışıyor, sektör paydaşlarımızla birlikte büyüyoruz.</p>
HTML;
    }

    private function contactContent(): string
    {
        return <<<'HTML'
<h2>Bize Ulaşın</h2>
<p>Sorularınız, önerileriniz veya destek talepleriniz için aşağıdaki kanallardan bize ulaşabilirsiniz.</p>

<h3>İletişim Bilgileri</h3>
<ul>
<li><strong>Telefon:</strong> 0850 123 45 67</li>
<li><strong>E-posta:</strong> info@i-bijuteri.com</li>
<li><strong>Adres:</strong> Kapalıçarşı civarı, Eminönü / İstanbul</li>
</ul>

<h3>Çalışma Saatleri</h3>
<ul>
<li>Pazartesi - Cuma: 09:00 - 18:00</li>
<li>Cumartesi: 10:00 - 14:00</li>
<li>Pazar: Kapalı</li>
</ul>

<h3>Konum</h3>
<p>İstanbul merkez ofisimiz ziyaretçilere randevu ile açıktır. Harita ve detaylı yön tarifi için iletişime geçin.</p>

<h3>Destek</h3>
<p>Sipariş, ödeme veya teknik konularda hesabınızdan <strong>Destek Talebi</strong> oluşturabilirsiniz; en kısa sürede dönüş yapıyoruz.</p>
HTML;
    }

    private function careerContent(): string
    {
        return <<<'HTML'
<h2>i-Bijuteri'de Kariyer</h2>
<p>Hızla büyüyen ekibimize katılarak Türkiye'nin B2B bijuteri sektörünü dönüştüren projenin bir parçası olun.</p>

<h3>Açık Pozisyonlar</h3>
<p>Şu anda yeni pozisyonlar için duyuru hazırlıyoruz. Açık pozisyonlar yakında bu sayfada paylaşılacaktır.</p>

<h3>Neden Bizi Tercih Etmelisiniz?</h3>
<ul>
<li>Hızlı büyüyen, dinamik bir ekip</li>
<li>Esnek çalışma saatleri</li>
<li>Sürekli öğrenme ve gelişim fırsatları</li>
<li>Rekabetçi maaş ve yan haklar</li>
</ul>

<h3>Başvuru</h3>
<p>Genel başvuru için CV'nizi <strong>kariyer@i-bijuteri.com</strong> adresine gönderebilirsiniz.</p>
HTML;
    }

    private function pressContent(): string
    {
        return <<<'HTML'
<h2>Basın Odası</h2>
<p>i-Bijuteri hakkında haber, röportaj ve medya çalışmalarınız için gerekli kaynaklara bu sayfadan ulaşabilirsiniz.</p>

<h3>Basın Bültenleri</h3>
<p>Güncel basın bültenlerimiz yakında bu bölümde yayınlanacaktır.</p>

<h3>Kurumsal Kit</h3>
<ul>
<li>Logo paketi (PNG / SVG)</li>
<li>Marka kullanım kılavuzu</li>
<li>Şirket tanıtım dosyası</li>
</ul>
<p>İçerikleri talep etmek için <strong>basin@i-bijuteri.com</strong> adresinden bizimle iletişime geçebilirsiniz.</p>

<h3>Medya İletişim</h3>
<p><strong>E-posta:</strong> basin@i-bijuteri.com</p>
HTML;
    }

    private function kvkkContent(): string
    {
        return <<<'HTML'
<h2>KVKK Aydınlatma Metni</h2>
<p>i-Bijuteri B2B Pazaryeri ("Platform") olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla kişisel verilerinizin işlenmesi hakkında sizi bilgilendirmek isteriz.</p>

<h3>1. Veri Sorumlusu</h3>
<p>Veri sorumlusu olarak i-Bijuteri, kişisel verilerinizi aşağıdaki kapsamda işlemektedir.</p>

<h3>2. İşleme Amaçları</h3>
<ul>
<li>Üyelik işlemleri ve hesap yönetimi</li>
<li>Sipariş ve ödeme süreçleri</li>
<li>Yasal yükümlülüklerin yerine getirilmesi</li>
<li>Platform güvenliğinin sağlanması</li>
<li>Müşteri hizmetleri</li>
</ul>

<h3>3. İşlenen Veriler</h3>
<ul>
<li>Kimlik, iletişim, mesleki ve finansal bilgiler</li>
<li>İşlem ve teknik veriler (IP, tarayıcı, çerezler)</li>
</ul>

<h3>4. Aktarım</h3>
<p>Kişisel verileriniz; yasal yetkili kurumlara, ödeme sağlayıcılarına ve kargo firmalarına gerekli ölçüde aktarılabilir.</p>

<h3>5. Haklarınız</h3>
<p>KVKK m.11 uyarınca verilerinize erişim, düzeltme, silme ve itiraz haklarına sahipsiniz. Başvurularınızı <strong>kvkk@i-bijuteri.com</strong> adresine iletebilirsiniz.</p>
HTML;
    }

    private function privacyContent(): string
    {
        return <<<'HTML'
<h2>Gizlilik Politikası</h2>
<p>i-Bijuteri olarak gizliliğinize saygı duyuyoruz. Bu politika hangi verileri topladığımızı, nasıl kullandığımızı ve nasıl koruduğumuzu açıklar.</p>

<h3>1. Toplanan Veriler</h3>
<ul>
<li>Kimlik, iletişim ve adres bilgileri</li>
<li>VKN/TCKN, vergi dairesi gibi yasal bilgiler</li>
<li>Sipariş, ödeme ve işlem verileri</li>
<li>Teknik veriler (IP, çerezler, tarayıcı bilgisi)</li>
</ul>

<h3>2. Kullanım Amaçları</h3>
<ul>
<li>Hizmet sunumu ve iyileştirme</li>
<li>Kimlik doğrulama ve güvenlik</li>
<li>Yasal yükümlülükler</li>
<li>Pazarlama (yalnızca açık rıza ile)</li>
</ul>

<h3>3. Paylaşım</h3>
<p>Verileriniz yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz.</p>

<h3>4. Güvenlik</h3>
<p>SSL şifreleme, güvenli sunucular ve erişim kontrolü ile verileriniz korunmaktadır.</p>

<h3>5. İletişim</h3>
<p>Sorularınız için: <strong>destek@i-bijuteri.com</strong></p>
HTML;
    }

    private function termsContent(): string
    {
        return <<<'HTML'
<h2>Kullanım Koşulları</h2>

<h3>1. Genel Hükümler</h3>
<p>i-Bijuteri platformunu kullanan tüm kullanıcılar bu koşulları kabul etmiş sayılır.</p>

<h3>2. Üyelik ve Hesap Güvenliği</h3>
<p>Üyelik bilgilerinizin doğruluğundan ve hesap güvenliğinden siz sorumlusunuz.</p>

<h3>3. Platform Kullanımı</h3>
<p>Platform üzerinden sadece yasal ürünlerin ticareti yapılabilir. Sahte ürün, marka taklidi veya yasal düzenlemelere aykırı içerikler kesinlikle yasaktır.</p>

<h3>4. Ödeme ve Komisyon</h3>
<p>Platform üzerinden gerçekleştirilen satışlardan belirli oranda komisyon alınır. Komisyon oranları güncel tarifeye göre uygulanır.</p>

<h3>5. Sorumluluk</h3>
<p>Platform, kullanıcılar arasındaki işlemlerin tarafı değildir; aracı hizmet sağlayıcı olarak hareket eder.</p>

<h3>6. Değişiklikler</h3>
<p>Bu koşullar önceden haber verilmeksizin güncellenebilir.</p>
HTML;
    }

    private function cookiesContent(): string
    {
        return <<<'HTML'
<h2>Çerez Politikası</h2>

<h3>Çerez Nedir?</h3>
<p>Çerezler, web sitemizi ziyaret ettiğinizde cihazınıza kaydedilen küçük metin dosyalarıdır.</p>

<h3>Kullandığımız Çerez Türleri</h3>
<ul>
<li><strong>Zorunlu Çerezler:</strong> Sitenin temel işlevleri için gereklidir.</li>
<li><strong>Performans Çerezleri:</strong> Site performansını ölçer.</li>
<li><strong>İşlevsellik Çerezleri:</strong> Tercihlerinizi hatırlar.</li>
<li><strong>Analiz Çerezleri:</strong> Kullanıcı davranışlarını analiz eder.</li>
</ul>

<h3>Çerez Tercihleri</h3>
<p>Tarayıcı ayarlarınızdan çerezleri kontrol edebilirsiniz; ancak bazı çerezler engellendiğinde site işlevleri sınırlanabilir.</p>
HTML;
    }

    private function distanceSalesContent(): string
    {
        return <<<'HTML'
<h2>Mesafeli Satış Sözleşmesi</h2>

<h3>Madde 1 - Taraflar</h3>
<p><strong>Satıcı:</strong> Platform üzerinde ilgili ürünü satışa sunan üye satıcı.<br>
<strong>Alıcı:</strong> Platform üzerinden sipariş veren üye alıcı.</p>

<h3>Madde 2 - Konu</h3>
<p>İşbu sözleşme, Alıcı'nın i-Bijuteri üzerinden elektronik ortamda siparişini verdiği ürünlerin satışı ve teslimi ile ilgili, 6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamındaki hak ve yükümlülükleri düzenler.</p>

<h3>Madde 3 - Ürün Bilgileri</h3>
<p>Ürün türü, miktarı, satış bedeli, KDV ve kargo bedeli sipariş özet sayfasında belirtilmektedir.</p>

<h3>Madde 4 - Teslimat</h3>
<p>Teslimat anlaşmalı kargo firmaları aracılığıyla Alıcı'nın belirttiği adrese yapılır. Teslimat süresi tahmini olup stok ve kargo koşullarına bağlı olarak değişebilir.</p>

<h3>Madde 5 - Ödeme</h3>
<p>Ödeme, güvenli ödeme altyapısı üzerinden gerçekleştirilir. Kart bilgileri Platform tarafından saklanmaz.</p>

<h3>Madde 6 - Cayma Hakkı</h3>
<p>Alıcı, teslimden itibaren 14 gün içinde cayma hakkını kullanabilir. Cayma hakkının kullanılmayacağı istisnai ürün grupları yasal düzenlemelere tabidir.</p>

<h3>Madde 7 - Uyuşmazlık Çözümü</h3>
<p>Uyuşmazlıklarda yetkili merciler ilgili mevzuatta belirtilen Tüketici Hakem Heyetleri ve İstanbul Mahkemeleridir.</p>
HTML;
    }

    private function returnPolicyContent(): string
    {
        return <<<'HTML'
<h2>İade Politikası</h2>

<h3>1. Genel Bilgilendirme</h3>
<p>i-Bijuteri üzerinden gerçekleştirilen alışverişlere ilişkin iade ve geri ödeme süreçleri, 6502 sayılı Kanun ve ilgili mevzuat çerçevesinde aşağıda düzenlenmiştir.</p>

<h3>2. Cayma Hakkı</h3>
<p>Alıcı, ürünün teslim tarihinden itibaren 14 (on dört) gün içinde gerekçe göstermeksizin cayma hakkını kullanabilir.</p>

<h3>3. İade Koşulları</h3>
<ul>
<li>Ürünün ambalajı açılmamış ve hasarsız olmalıdır.</li>
<li>Tüm aksesuar ve belgeler eksiksiz iade edilmelidir.</li>
<li>Talep, Platform üzerinden veya destek@i-bijuteri.com'a yazılı olarak iletilmelidir.</li>
</ul>

<h3>4. Geri Ödeme</h3>
<p>İade onaylandıktan sonra ödeme, kullanılan yönteme bağlı olarak en geç 14 iş günü içinde gerçekleştirilir.</p>

<h3>5. İade Kargo Ücreti</h3>
<ul>
<li>Cayma hakkı kapsamında: Satıcı karşılar.</li>
<li>Hasarlı/hatalı ürün iadeleri: Satıcı karşılar.</li>
<li>Alıcı kaynaklı iadeler: Alıcı karşılar.</li>
</ul>
HTML;
    }

    private function membershipContent(): string
    {
        return <<<'HTML'
<h2>Üyelik Sözleşmesi</h2>

<h3>Madde 1 - Taraflar</h3>
<p><strong>Platform:</strong> i-Bijuteri B2B Pazaryeri (www.i-bijuteri.com)<br>
<strong>Üye:</strong> Platform'a üyelik başvurusunda bulunan tüzel/gerçek kişi.</p>

<h3>Madde 2 - Konu</h3>
<p>İşbu sözleşme Üye'nin Platform'u kullanma koşullarını, tarafların hak ve yükümlülüklerini düzenler.</p>

<h3>Madde 3 - Üyelik Koşulları</h3>
<ul>
<li>Geçerli bir VKN/TCKN ile kayıt</li>
<li>Vergi levhası veya kimlik belgesi yüklenmesi (satıcılar için)</li>
<li>Doğru ve güncel iletişim bilgisi</li>
<li>İşbu sözleşmenin, KVKK ve Gizlilik Politikası'nın kabulü</li>
</ul>

<h3>Madde 4 - Üye'nin Yükümlülükleri</h3>
<ul>
<li>Hesap güvenliğini sağlamak</li>
<li>Yasal ürünlerin ticaretini yapmak</li>
<li>Sipariş ve teslim taahhütlerine uymak</li>
<li>Vergi ve fatura yükümlülüklerini yerine getirmek</li>
</ul>

<h3>Madde 5 - Platform'un Yükümlülükleri</h3>
<ul>
<li>Güvenli ticaret altyapısı sağlamak</li>
<li>Ödeme güvenliği</li>
<li>Veri korunması</li>
<li>Destek talebi yönetimi</li>
</ul>

<h3>Madde 6 - Hizmet Bedeli</h3>
<p>Platform, aracılık hizmeti karşılığında Satıcı'dan komisyon tahsil eder. Güncel oranlar Platform'da yayımlanır.</p>

<h3>Madde 7 - Fesih</h3>
<p>Taraflardan her biri yazılı bildirimle sözleşmeyi feshedebilir.</p>

<h3>Madde 8 - Uyuşmazlık</h3>
<p>İstanbul Mahkemeleri ve İcra Daireleri yetkilidir; Türkiye Cumhuriyeti hukuku uygulanır.</p>
HTML;
    }

    private function faqContent(): string
    {
        return <<<'HTML'
<h2>Sıkça Sorulan Sorular</h2>

<h3>i-Bijuteri'ye nasıl üye olabilirim?</h3>
<p>Ana sayfadaki "Üye Ol" bağlantısından TCKN/VKN'nizle birkaç dakika içinde üye olabilirsiniz. E-posta doğrulamanın ardından platformu kullanmaya başlayabilirsiniz.</p>

<h3>Satıcı olmak için ne yapmalıyım?</h3>
<p>Satıcı olarak kayıt olurken vergi levhası ve kimlik belgesi yüklemeniz gerekir. Belgeleriniz onaylandıktan sonra ürün yüklemeye başlayabilirsiniz.</p>

<h3>Siparişlerimi nasıl takip ederim?</h3>
<p>Hesabınız üzerindeki "Siparişlerim" bölümünden tüm siparişlerinizi ve kargo durumlarını anlık takip edebilirsiniz.</p>

<h3>Hangi ödeme yöntemlerini destekliyorsunuz?</h3>
<p>Kredi kartı, banka kartı, havale/EFT ve taksitli ödeme seçeneklerimiz mevcuttur. Kart bilgileriniz güvenli ödeme altyapısı üzerinden işlenir.</p>

<h3>Kargo süresi ne kadardır?</h3>
<p>Stok durumuna ve satıcıya bağlı olarak kargolar genellikle 1-3 iş günü içinde yola çıkar. Türkiye geneli teslimat süresi 2-5 iş günüdür.</p>

<h3>İade nasıl yaparım?</h3>
<p>Hesabınızdan ilgili siparişe gidip "İade Talebi" oluşturabilirsiniz. Cayma hakkınız, teslimden itibaren 14 gündür.</p>

<h3>Ürünler orijinal mi?</h3>
<p>Platformumuzdaki tüm satıcılar belge yükleme ile doğrulanır. Sahte ürün satışı kesinlikle yasaktır ve şikayet edildiği takdirde hesap kapatılır.</p>

<h3>KDV ve fatura nasıl uygulanıyor?</h3>
<p>Tüm satışlar yasal mevzuata uygun şekilde KDV'li olarak gerçekleştirilir. E-fatura ve e-arşiv siparişle birlikte iletilir.</p>

<h3>Minimum sipariş tutarı var mı?</h3>
<p>Bazı satıcılar minimum sepet tutarı belirleyebilir; bu bilgi ürün/satıcı sayfasında görüntülenir.</p>

<h3>Müşteri hizmetlerine nasıl ulaşırım?</h3>
<p>Hesabınızdan "Destek Talebi" oluşturabilir veya destek@i-bijuteri.com adresine e-posta gönderebilirsiniz.</p>
HTML;
    }

    private function orderProcessContent(): string
    {
        return <<<'HTML'
<h2>Sipariş Süreci</h2>
<p>i-Bijuteri'de sipariş vermek son derece basit ve hızlıdır. Aşağıdaki adımları izleyerek alışverişinizi tamamlayabilirsiniz.</p>

<h3>1. Ürünü Seçin</h3>
<p>Ana sayfa, kategori veya arama yoluyla ihtiyacınız olan ürünü bulun. Birden fazla satıcı varsa fiyat ve teslim sürelerini karşılaştırabilirsiniz.</p>

<h3>2. Sepete Ekleyin</h3>
<p>Adet seçtikten sonra ürünü sepetinize ekleyin. Sepet sayfasında ürünlerinizi gözden geçirebilirsiniz.</p>

<h3>3. Adres ve Kargo</h3>
<p>Teslimat adresinizi seçin veya yeni adres ekleyin. Kargo firması ve teslimat seçeneği bu adımda belirlenir.</p>

<h3>4. Ödeme</h3>
<p>Kredi kartı, banka kartı, havale/EFT seçeneklerinden uygun olanı tercih edin. Tüm ödemeler güvenli altyapı üzerinden işlenir.</p>

<h3>5. Onay ve Takip</h3>
<p>Sipariş tamamlandığında size onay e-postası gönderilir. "Siparişlerim" bölümünden kargo takibinizi yapabilirsiniz.</p>
HTML;
    }

    private function shippingContent(): string
    {
        return <<<'HTML'
<h2>Kargo & Teslimat</h2>

<h3>Anlaşmalı Kargo Firmaları</h3>
<p>i-Bijuteri olarak Türkiye'nin önde gelen kargo firmaları ile çalışıyoruz: Yurtiçi Kargo, Aras Kargo, MNG Kargo ve Sürat Kargo.</p>

<h3>Teslimat Süreleri</h3>
<ul>
<li>İstanbul içi: 1-2 iş günü</li>
<li>Büyük şehirler: 2-3 iş günü</li>
<li>Diğer iller: 3-5 iş günü</li>
</ul>

<h3>Kargo Ücreti</h3>
<p>Belirli bir tutarın üzerindeki siparişlerde kargo ücretsizdir. Bu tutar satıcıya göre değişebilir; sepet sayfasında net olarak görüntülenir.</p>

<h3>Kargo Takibi</h3>
<p>Sipariş kargoya verildikten sonra "Siparişlerim" sayfasından kargo takip numaranıza erişebilir, kargonuzun konumunu anlık takip edebilirsiniz.</p>

<h3>Teslim Alma</h3>
<p>Teslim sırasında ürünleri kontrol etmenizi öneririz. Hasar durumunda kargo görevlisi nezdinde tutanak tutturmanız iade sürecini hızlandırır.</p>
HTML;
    }

    private function returnExchangeContent(): string
    {
        return <<<'HTML'
<h2>İade ve Değişim</h2>

<h3>Cayma Hakkı</h3>
<p>Teslim tarihinden itibaren 14 gün içinde gerekçe göstermeksizin cayma hakkınızı kullanabilirsiniz.</p>

<h3>İade Talebi Oluşturma</h3>
<ol>
<li>Hesabınızdan "Siparişlerim" bölümüne gidin.</li>
<li>İlgili siparişin yanındaki "İade Talebi" butonuna tıklayın.</li>
<li>İade nedenini ve detayları girin.</li>
<li>Talebiniz oluşturulduktan sonra satıcı onayı beklenecektir.</li>
</ol>

<h3>Değişim</h3>
<p>Renk, model veya beden değişikliği için ilgili satıcı ile iletişime geçerek değişim talebi oluşturabilirsiniz.</p>

<h3>İade Edilemeyecek Ürünler</h3>
<ul>
<li>Kişiselleştirilmiş veya özel üretim ürünler</li>
<li>Hijyen kapsamındaki ürünler (kupe, piercing vb. ambalajı açılmış ise)</li>
<li>Çabuk bozulabilen ürünler</li>
</ul>
HTML;
    }

    private function paymentMethodsContent(): string
    {
        return <<<'HTML'
<h2>Ödeme Yöntemleri</h2>
<p>i-Bijuteri olarak çeşitli ve güvenli ödeme yöntemleri sunuyoruz.</p>

<h3>Kredi/Banka Kartı</h3>
<p>Tüm Visa, Mastercard, Maestro ve Troy kartları kabul edilir. Ödemeleriniz PCI-DSS standartlarına uygun güvenli altyapı üzerinden işlenir.</p>

<h3>Taksit Seçenekleri</h3>
<p>Anlaşmalı bankaların kredi kartları ile 2-12 aya kadar taksit imkanı sunuyoruz. Taksit seçenekleri ürün ve banka bazında değişebilir.</p>

<h3>Havale / EFT</h3>
<p>Banka hesap numaralarımıza havale veya EFT ile ödeme yapabilirsiniz. Ödeme dekontunuzu sistemde yüklemeniz veya açıklama olarak sipariş numarasını girmeniz yeterlidir.</p>

<h3>Güvenli Ödeme</h3>
<p>Kart bilgileriniz hiçbir şekilde Platform tarafından saklanmaz. Tüm işlemler 3D Secure altyapısı ile şifrelenir.</p>
HTML;
    }

    private function becomeSellerContent(): string
    {
        return <<<'HTML'
<h2>Satıcı Olmak</h2>
<p>i-Bijuteri'de satıcı olarak yer alın, binlerce alıcıya ulaşın.</p>

<h3>Avantajlar</h3>
<ul>
<li>Türkiye genelinde geniş alıcı kitlesi</li>
<li>Düşük komisyon oranları</li>
<li>Güvenli ödeme ve havale güvencesi</li>
<li>Anlaşmalı kargo entegrasyonları</li>
<li>Satış raporları ve analiz araçları</li>
</ul>

<h3>Başvuru Adımları</h3>
<ol>
<li>"Satıcı Ol" sayfasından VKN/TCKN ile kayıt olun.</li>
<li>Vergi levhanızı ve kimlik belgenizi yükleyin.</li>
<li>Banka hesap bilgilerinizi ekleyin.</li>
<li>Belge onayından sonra ürünlerinizi yükleyin.</li>
<li>Siparişler gelmeye başlasın!</li>
</ol>

<h3>Gerekli Belgeler</h3>
<ul>
<li>Vergi levhası</li>
<li>İmza sirküleri veya nüfus cüzdanı fotokopisi</li>
<li>Faaliyet belgesi (varsa)</li>
<li>IBAN bilgisi</li>
</ul>

<h3>İletişim</h3>
<p>Detaylı bilgi için <strong>satici@i-bijuteri.com</strong> adresine yazabilirsiniz.</p>
HTML;
    }

    private function accountContent(): string
    {
        return <<<'HTML'
<h2>Hesap Yönetimi</h2>

<h3>Profil Bilgileri</h3>
<p>"Hesabım" sayfasından adınız, e-posta, telefon ve diğer iletişim bilgilerinizi güncelleyebilirsiniz.</p>

<h3>Şifre Değiştirme</h3>
<p>Hesabınızın güvenliği için şifrenizi düzenli aralıklarla güncellemenizi öneririz. "Hesabım" &gt; "Güvenlik" bölümünden şifrenizi değiştirebilirsiniz.</p>

<h3>Adres Yönetimi</h3>
<p>Birden fazla teslimat adresi ekleyebilir, varsayılan adres belirleyebilir ve adreslerinizi düzenleyebilirsiniz.</p>

<h3>Bildirim Tercihleri</h3>
<p>E-posta ve SMS bildirimi tercihlerinizi "Hesabım" &gt; "Bildirimler" sekmesinden yönetebilirsiniz.</p>

<h3>Hesap Silme</h3>
<p>Hesabınızı kapatmak isterseniz "Hesap Ayarları" bölümünden talep oluşturabilirsiniz. KVKK kapsamındaki haklarınız saklıdır.</p>
HTML;
    }
}
