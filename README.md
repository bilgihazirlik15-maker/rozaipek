# Roza İpek

[www.rozaipek.com](https://www.rozaipek.com/) sitesinin 14 Eylül 2026 tarihinde erişilebilen ziyaretçi sayfalarının statik kopyası.

Özgün HTML, CSS, JavaScript, logolar, ürün fotoğrafları, slaytlar ve yazı tipleri korunmuştur. Türkçe ve İngilizce toplam **37 sayfa** bulunur. Dosyalar `dist/` klasöründedir; PHP veya Joomla kurulumu gerekmez.

## Çalıştırma

Node.js 24 veya üstü ile:

```sh
npm start
```

Tarayıcıda `http://127.0.0.1:4173` adresini açın. Bağımlılık kurulumu gerekmez. `dist/` klasörü herhangi bir statik web sunucusunda, kök dizinde veya alt klasörde sunulabilir.

## Kapsam

- Ana sayfalar, hakkımızda, ürün sayfaları, iletişim, video ve İngilizce kalite sayfası.
- Özgün mobil menü, ürün alt menüleri, slayt ve görsel büyütme kodları.
- Yazı tipleri dahil görsel varlıklar yerel dosyalardan yüklenir.
- Joomla araması yerine iki dilde yerel sayfa içeriklerini tarayan arama.
- Kaynak sitedeki bozuk ürün/dil bağlantıları ve bir ikon fontu yolu düzeltildi.
- Kaynak sitenin Google Tag Manager izleme kodu kaldırıldı.

Bu repo ziyaretçiye sunulan ön yüzü içerir; orijinal PHP kaynakları, Joomla yönetim paneli, veritabanı ve sunucu ayarları dışarıdan alınamadığı için dahil değildir. YouTube videoları, harita ve sosyal paylaşım bağlantıları internet bağlantısı gerektirir. Kaynak video sayfasındaki video kimliği boş olan iki alan aynen korunmuştur; bunlara video uydurulmamıştır. Görsel eşitlik tarayıcı ekran görüntüsü karşılaştırmasıyla doğrulanmamıştır.

## Kontrol ve yeniden alma

```sh
npm run check
npm run mirror
```

`check`, tüm HTML/CSS dosyalarındaki yerel bağlantıları ve JavaScript sözdizimini kontrol eder. `mirror`, kaynak siteyi yeniden okuyarak kopyalanan dosyaları günceller; bu dosyalardaki elle yapılan değişikliklerin üzerine yazabilir. Kaynak sunucunun süresi dolmuş sertifikası nedeniyle sadece `rozaipek.com` alanına yapılan herkese açık indirme isteklerinde sertifika doğrulaması devre dışıdır. Kimlik bilgisi gönderilmez; diğer alanlarda doğrulama açıktır.

- `reports/mirror.json`: İndirilen dosyalar ve kaynakta karşılaşılan erişim hataları.
- `reports/adjustments.json`: Yerelleştirilen fontlar ve bağlantı düzeltmeleri.
- `reports/validation.json`: Son yerel doğrulama sonucu.

Orijinal marka, içerik ve üçüncü taraf kütüphanelerinin hakları ilgili sahiplerine aittir. Mevcut kütüphane lisans başlıkları korunmuştur.
