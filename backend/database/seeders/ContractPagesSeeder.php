<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class ContractPagesSeeder extends Seeder
{
    public function run(): void
    {
        $registrationContent = <<<'HTML'
<h2>MADDE 1 – TARAFLAR</h2>
<p><strong>1.1.</strong> İşbu üyelik sözleşmesi ("Üyelik Sözleşmesi" veya "Sözleşme" olarak anılacaktır) <strong>i-Bijuteri B2B Bijuteri Pazaryeri</strong> ile Üye arasında, Üye'nin platformda sunulan hizmetlerden faydalanmasına ilişkin koşulların tespit edilmesi amacıyla akdedilmiştir.</p>
<p><strong>1.2.</strong> i-Bijuteri ile Üye işbu Üyelik Sözleşmesi'nde ayrı ayrı "Taraf" ve birlikte "Taraflar" olarak anılacaktır.</p>

<h2>MADDE 2 – KONU, AMAÇ VE KAPSAM</h2>
<p><strong>2.1.</strong> i-Bijuteri, 6563 Sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun kapsamında Aracı Hizmet Sağlayıcı olarak www.i-bijuteri.com alan adlı çevrimiçi B2B bijuteri pazaryeri platformunu işletmektedir.</p>
<p><strong>2.2.</strong> Üye, platforma üye olarak statüsüne uygun biçimde ürün satışı yapabilir, ilan ekleyebilir ve/veya toptan ürün satın alabilir.</p>

<h2>MADDE 3 – KOMİSYON VE HİZMET BEDELLERİ</h2>
<p><strong>3.1.</strong> Satıcı Üye, platform üzerinden gerçekleştirilen her satışta i-Bijuteri'nin belirlediği komisyon oranını ve sabit hizmet bedelini kabul eder.</p>
<p><strong>3.2.</strong> Üyenin başvurusu sırasında uygulanan komisyon oranı: <strong>{{commission_rate}}</strong></p>
<p><strong>3.3.</strong> i-Bijuteri, komisyon oranlarını ve hizmet bedelini önceden bildirimde bulunmak kaydıyla değiştirme hakkını saklı tutar.</p>

<h2>MADDE 4 – KARGO VE TESLİMAT</h2>
<p><strong>4.1.</strong> Kargo politikası: <strong>{{shipping_policy}}</strong></p>
<p><strong>4.2.</strong> Satıcı Üye, sipariş onayından sonra en geç 3 (üç) iş günü içerisinde ürünleri kargoya verme yükümlülüğündedir.</p>

<h2>MADDE 5 – ÖDEME VE HAKEDİŞ</h2>
<p><strong>5.1.</strong> Alıcı ödemeleri i-Bijuteri tarafından güvenli ödeme altyapısı ile alınır.</p>
<p><strong>5.2.</strong> Satıcı hakedişleri, ürün teslimatının ALICI tarafından onaylanmasını veya yasal süre olan 14 (on dört) gün geçmesini takiben Satıcı'nın cüzdanına aktarılır.</p>

<h2>MADDE 6 – YÜKÜMLÜLÜKLER</h2>
<p><strong>6.1.</strong> Satıcı, sattığı ürünlerin yasal mevzuata, fikri ve sınai mülkiyet haklarına ve marka korumalarına uygun olduğunu kabul ve taahhüt eder.</p>
<p><strong>6.2.</strong> Üye, platforma yüklediği tüm içeriklerin doğruluğundan münhasıran sorumludur.</p>
<p><strong>6.3.</strong> i-Bijuteri, mevzuata aykırı içerik tespit etmesi durumunda ilan veya hesabı askıya alma hakkını saklı tutar.</p>

<h2>MADDE 7 – KİŞİSEL VERİLERİN KORUNMASI</h2>
<p><strong>7.1.</strong> Taraflar, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu sıfatıyla hareket eder. Detaylar için <strong>KVKK Aydınlatma Metni</strong> incelenebilir.</p>

<h2>MADDE 8 – SÖZLEŞMENİN SÜRESİ VE FESHİ</h2>
<p><strong>8.1.</strong> İşbu sözleşme süresiz olarak akdedilmiş olup, taraflardan herhangi biri en az 30 (otuz) gün önceden yazılı bildirimde bulunmak kaydıyla sözleşmeyi tek taraflı feshedebilir.</p>
<p><strong>8.2.</strong> i-Bijuteri, Üye'nin sözleşme şartlarını ihlali halinde sözleşmeyi derhal feshedebilir.</p>

<h2>MADDE 9 – UYUŞMAZLIKLARIN ÇÖZÜMÜ</h2>
<p><strong>9.1.</strong> İşbu Sözleşme'nin uygulanmasından doğacak uyuşmazlıklarda Türkiye Cumhuriyeti yasaları uygulanır ve İstanbul Mahkemeleri ile İcra Daireleri yetkilidir.</p>

<h2>MADDE 10 – YÜRÜRLÜK</h2>
<p>İşbu sözleşmenin onaylanması ile yukarıdaki tüm şart ve koşullar kayıtsız olarak kabul edilmiş olup, sözleşme Üye tarafından elektronik ortamda onaylanmak suretiyle akdedilmiş ve yürürlüğe girmiş sayılır.</p>
<p><strong>Sözleşme Tarihi:</strong> {{date}}</p>
HTML;

        $salesContent = <<<'HTML'
<p><strong>6.1.</strong> ALICI, sipariş konusu ürünün temel niteliklerini, satış fiyatını ve ödeme şeklini okuyup bilgi sahibi olduğunu kabul eder.</p>
<p><strong>6.2.</strong> Sipariş konusu ürün, yasal 30 günlük süreyi aşmamak kaydıyla ALICI'ya teslim edilir.</p>
<p><strong>6.3.</strong> Bu sözleşme tacirler arası B2B niteliğinde olup, 6502 sayılı Tüketicinin Korunması Hakkında Kanun hükümlerine tabi değildir. ALICI, ürün tesliminden itibaren 14 gün içinde cayma hakkına sahip değildir; iade ancak ayıplı ürün durumunda Türk Ticaret Kanunu hükümleri çerçevesinde mümkündür.</p>
<p><strong>6.4.</strong> SATICI, sipariş konusu ürünün sağlam, eksiksiz ve siparişe uygun olarak teslim edilmesinden sorumludur.</p>
<p><strong>6.5.</strong> Tarafların ticari faaliyet kapsamında gerçekleştirdiği bu işlem nedeniyle aralarındaki ilişki Türk Ticaret Kanunu ve genel hükümlere tabidir.</p>
<p><strong>6.6.</strong> İşbu sözleşme elektronik ortamda taraflarca onaylanarak yürürlüğe girmiştir.</p>
<p><strong>6.7.</strong> Uyuşmazlıkların çözümünde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.</p>
HTML;

        Page::updateOrCreate(
            ['slug' => 'uyelik-sozlesmesi'],
            [
                'title' => 'Üyelik Sözleşmesi',
                'content' => $registrationContent,
                'excerpt' => 'i-Bijuteri pazaryeri üyelik sözleşmesi. Yeni satıcı/alıcı kayıt sırasında onaylanır.',
                'status' => 'published',
                'template' => 'default',
                'category' => 'legal',
                'sort_order' => 1,
            ]
        );

        Page::updateOrCreate(
            ['slug' => 'mesafeli-satis-sozlesmesi'],
            [
                'title' => 'B2B Satış Sözleşmesi',
                'content' => $salesContent,
                'excerpt' => 'Her sipariş sonrası otomatik oluşan satış sözleşmesinin Genel Hükümler bölümü.',
                'status' => 'published',
                'template' => 'default',
                'category' => 'legal',
                'sort_order' => 2,
            ]
        );

        $this->command->info('✓ Sözleşme şablonları seed edildi:');
        $this->command->line('  • /sayfa/uyelik-sozlesmesi (registration → admin\'den düzenlenebilir)');
        $this->command->line('  • /sayfa/mesafeli-satis-sozlesmesi (sales → admin\'den düzenlenebilir)');
        $this->command->line('  Admin → İçerik → Sayfalar üzerinden düzenleyebilir.');
        $this->command->newLine();
        $this->command->line('Placeholder\'lar (registration):');
        $this->command->line('  {{member_name}}, {{member_address}}, {{commission_rate}}, {{shipping_policy}}, {{date}}');
    }
}
