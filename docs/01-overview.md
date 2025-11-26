# Proje Genel Bakış

## 🎯 Proje Amacı

LocalFlavors, kullanıcıların yerel restoranları, kafeleri ve gizli mücevherleri keşfetmelerini sağlayan topluluk destekli bir öneri platformudur. Platform, kişisel kürasyon ile topluluk bilgeliğini birleştirerek güvenilir mekan önerileri oluşturur.

## 🌟 Temel Konsept

**Koleksiyon Sistemi:** Kullanıcılar belirli temalara göre (örn: "İstanbul'daki En İyi Adana Kebapçıları") mekan listeleri oluşturur.

**Demokratik Oylama:** Topluluk oylarıyla en iyi mekanlar belirlenir. Hesap yaşına göre ağırlıklı oylama sistemi.

**Şehir Bazlı Keşif:** Her şehir için kategorilere göre sıralanmış top 20 mekan listesi.

## ✅ Tamamlanmış Özellikler (MVP)

### 1. Kullanıcı Sistemi
- Email/şifre ile kayıt ve giriş
- Kullanıcı profilleri ve istatistikler
- Hesap yaşına göre oy ağırlığı (0.1-1.0)
- Rol tabanlı yetkilendirme (user, moderator, admin)
- Email doğrulama ve şifre sıfırlama

### 2. Koleksiyon Sistemi
- Koleksiyon oluşturma ve düzenleme
- Sürükle-bırak ile mekan sıralama
- Her mekan için küratör notu ekleme
- Mekan başına ünlü ürün önerileri (örn: "Adana Kebap", "Ayran")
- Kategori ve alt kategori bazlı organizasyon
- Öne çıkan koleksiyon özelliği
- Koleksiyon oylama sistemi

### 3. Mekan Yönetimi
- Google Places API entegrasyonu (otomatik adres tamamlama)
- Mekan ekleme (otomatik onaylı MVP'de)
- Duplike uyarı sistemi
- Çoklu dil desteği (TR/EN)
- Kategori bazlı organizasyon
- Konum hiyerarşisi (ülke > şehir > ilçe)

### 4. Liderlik Tablosu
- Şehir bazlı top 20 mekan listesi
- Canlı oylama (upvote/downvote)
- İlk 3 için madalya sistemi (altın, gümüş, bronz)
- Kategori bazlı filtreleme
- Tüm kategorileri görme seçeneği
- Gerçek zamanlı oy güncellemeleri

### 5. Admin Paneli
- Gerçek zamanlı istatistik kartları
- Mekan yönetimi (CRUD)
- Konum yönetimi (ülke, şehir, ilçe)
- Kategori yönetimi
- Koleksiyon yönetimi
- Öne çıkan koleksiyonları belirleme
- Kullanıcı rol yönetimi

### 6. UX/UI Özellikleri
- Karanlık mod desteği (next-themes)
- Tamamen responsive tasarım
- Toast bildirimleri (Sonner)
- Loading state'leri ve skeleton UI
- Form validasyonu (Zod)
- Ana sayfada particle efektleri
- Smooth animasyonlar (Framer Motion)

### 7. SEO & Teknik
- Dinamik sitemap oluşturma
- JSON-LD yapılandırılmış veri
- OpenGraph meta etiketleri
- Robots.txt yapılandırması
- Server-side rendering (SSR)

## 🎨 Kullanıcı Akışları

### Koleksiyon Oluşturma Akışı
1. Kullanıcı "Yeni Koleksiyon" butonuna tıklar
2. Başlık, açıklama, şehir, kategori seçer
3. Google Places API ile mekan arar veya mevcut mekanlardan seçer
4. Her mekan için ünlü ürünler ve notlar ekler
5. Sürükle-bırak ile mekan sırasını düzenler
6. Koleksiyonu yayınlar

### Oylama Akışı
1. Kullanıcı liderlik tablosunda bir mekana tıklar
2. Upvote (👍) veya downvote (👎) butonuna tıklar
3. Oy ağırlığı hesaplanır (hesap yaşı bazlı)
4. Mekan skoru ve sırası güncellenir
5. Kullanıcının oyu kaydedilir (tekrar oy kullanılabilir)

### Mekan Ekleme Akışı
1. Kullanıcı "Mekan Ekle" butonuna tıklar
2. Google Places'te mekan arar
3. Seçtiği mekan otomatik doldurulur (ad, adres, konum)
4. Eksik bilgileri manuel girer (kategori, açıklama)
5. Duplike kontrolü yapılır
6. MVP'de otomatik onaylanır ve yayınlanır

## 📊 Veri Modeli Özeti

**Ana Varlıklar:**
- **Users:** Kullanıcılar ve profil bilgileri
- **Places:** Mekanlar (restoran, kafe, vb.)
- **Collections:** Kullanıcı koleksiyonları
- **Categories:** Mekan kategorileri (Kebap, Kahvaltı, vb.)
- **Locations:** Konum hiyerarşisi (ülke > şehir > ilçe)

**İlişki Tabloları:**
- **Collection_Places:** Koleksiyonlardaki mekanlar (sıra, not, ünlü ürünler)
- **Votes:** Mekan oyları
- **Collection_Votes:** Koleksiyon oyları

## 🎯 Hedef Kitle

- **Yerel Kaşifler:** Şehirlerinde yeni mekanlar keşfetmek isteyen kullanıcılar
- **Küratörler:** Kendi keşfettikleri mekanları paylaşmak isteyen food blogger'lar
- **Turistler:** Yerel önerilere güvenen ziyaretçiler
- **Yemek Tutkunları:** Spesifik kategorilerde en iyileri arayan kullanıcılar

## 🚀 Platform Değeri

1. **Güvenilir Öneriler:** Topluluk oylarıyla doğrulanmış mekanlar
2. **Küratörlü İçerik:** Deneyimli kullanıcıların özel listeleri
3. **Yerel Odaklı:** Her şehir için özelleştirilmiş içerik
4. **Keşif Kolaylığı:** Kategori ve konum bazlı filtreleme
5. **Şeffaflık:** Açık oylama sistemi ve sıralamalar

## 🔮 Gelecek Planlar (Roadmap)

**Öncelikli Özellikler:**
- Kullanıcı takip sistemi
- Favoriler sayfası
- Koleksiyon yorumları
- Gelişmiş arama ve filtreleme
- Moderasyon araçları
- Email bildirimleri

**İleri Seviye Özellikler:**
- Sosyal özellikler (beğeni, paylaşma)
- Mekan sayfalarında fotoğraflar
- Harita görünümü
- Mobil uygulama
- Yapay zeka destekli öneriler

## 📈 Başarı Metrikleri

- Aktif kullanıcı sayısı
- Oluşturulan koleksiyon sayısı
- Toplam oy sayısı
- Eklenen mekan sayısı
- Kullanıcı engagement oranı
