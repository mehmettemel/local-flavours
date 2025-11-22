# Google Places API Entegrasyonu - Kurulum Rehberi

Bu doküman, Google Places API (New) entegrasyonunun nasıl kurulacağını adım adım açıklar.

## 🎯 Neler Değişti?

### Yeni Özellikler
- ✅ Google Places Autocomplete ile mekan arama
- ✅ Otomatik adres, telefon, fotoğraf çekme
- ✅ Akıllı şehir eşleştirme
- ✅ Google Place ID ile mükemmel duplicate detection
- ✅ Rating, opening hours ve diğer zengin veriler

### UX İyileştirmeleri
- 🚀 5 saniyede mekan ekleme
- 🔍 Hybrid arama: Önce database, sonra Google
- 📍 Otomatik konum tespiti
- 📸 Otomatik fotoğraf import

---

## 📋 Kurulum Adımları

### 1. Google Cloud Console Kurulumu

#### 1.1 Proje Oluştur
1. [Google Cloud Console](https://console.cloud.google.com/) adresine git
2. Sağ üst köşeden "Select a project" → "New Project" tıkla
3. Proje adı: `LocalFlavours` (veya istediğin bir isim)
4. "Create" butonuna tıkla

#### 1.2 Places API (New) Etkinleştir
1. Sol menüden **"APIs & Services"** → **"Library"** seç
2. Arama kutusuna **"Places API (New)"** yaz
3. **"Places API (New)"** kartına tıkla
4. **"Enable"** butonuna tıkla

> ⚠️ **DİKKAT**: "Places API (New)" kullanmalısın, eski "Places API" değil!

#### 1.3 API Key Oluştur
1. Sol menüden **"APIs & Services"** → **"Credentials"** seç
2. Üstten **"+ CREATE CREDENTIALS"** → **"API key"** seç
3. API key oluşturulacak, kopyala ve güvenli bir yere kaydet

#### 1.4 API Key'i Kısıtla (GÜVENLİK ÖNEMLİ!)
1. Oluşturulan API key'in yanındaki **"Edit"** (kalem) ikonuna tıkla
2. **"Application restrictions"** bölümünde **"HTTP referrers"** seç
3. **"Add an item"** tıklayarak şu domain'leri ekle:
   ```
   localhost:3001/*
   localhost:3000/*
   yourdomain.com/*
   *.yourdomain.com/*
   ```
4. **"API restrictions"** bölümünde **"Restrict key"** seç
5. Dropdown'dan **"Places API (New)"** seç
6. **"Save"** butonuna tıkla

---

### 2. Environment Variable Ekle

`.env.local` dosyasını aç ve Google API key'ini ekle:

```bash
# Google Places API Configuration
GOOGLE_PLACES_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

> ⚠️ **GÜVENLİK**: API key'i asla git'e commit etme! `.env.local` dosyası `.gitignore`'da olduğundan emin ol.

---

### 3. Database Migration Çalıştır

Supabase Dashboard'a git:
1. **SQL Editor** sekmesine tıkla
2. `supabase/migrations/012_add_google_place_id.sql` dosyasını aç
3. İçeriği kopyalayıp SQL Editor'e yapıştır
4. **RUN** butonuna tıkla

Migration şu kolonları ekler:
- `google_place_id` (UNIQUE) - Duplicate detection için
- `phone_number` - Telefon numarası
- `website` - Web sitesi URL'i
- `latitude`, `longitude` - Koordinatlar
- `rating` - Google rating (0-5)
- `user_ratings_total` - Toplam değerlendirme sayısı
- `price_level` - Fiyat seviyesi (0-4)
- `opening_hours` - Çalışma saatleri (JSONB)

---

### 4. Test Et

```bash
# Dev server'ı başlat
npm run dev

# Tarayıcıda aç
http://localhost:3001
```

#### Test Senaryosu:
1. Koleksiyonlarım sayfasına git
2. "Yeni Koleksiyon" oluştur
3. "Mekan Ekle" butonuna tıkla
4. **Google'da Ara** kutusuna bir mekan adı yaz (örn: "Halil Usta Kebap Adana")
5. Dropdown'dan bir mekan seç
6. Google'dan otomatik gelen bilgileri gör:
   - ✅ Adres
   - ✅ Telefon
   - ✅ Rating
   - ✅ Fotoğraflar
7. "Oluştur ve Ekle" butonuna tıkla

**Beklenen Sonuç:**
- Mekan 5 saniye içinde oluşturulup koleksiyona eklenmeli
- Şehir otomatik olarak eşleştirilmeli
- Fotoğraflar Google'dan çekilmeli

---

## 🔧 Sorun Giderme

### API Key Çalışmıyor
**Hata:** `Google Places API key is not configured`

**Çözüm:**
1. `.env.local` dosyasında `GOOGLE_PLACES_API_KEY` var mı kontrol et
2. Dev server'ı **restart** et (environment variable değişikliği sonrası gerekli)

### API Key Restriction Hatası
**Hata:** `API key not valid. Please pass a valid API key.`

**Çözüm:**
1. Google Cloud Console → Credentials → API Key'i düzenle
2. HTTP referrers kısmına `localhost:3001/*` eklenmiş mi kontrol et
3. API restrictions kısmında "Places API (New)" seçili mi kontrol et
4. 2-3 dakika bekle (restriction'lar hemen aktif olmayabilir)

### Şehir Eşleşmiyor
**Hata:** `Mekanın şehri otomatik olarak bulunamadı`

**Çözüm:**
1. `lib/utils/match-location.ts` dosyasını kontrol et
2. Console'da hangi şehir ismini Google'dan aldığını gör
3. Database'de o şehir var mı kontrol et:
   ```sql
   SELECT * FROM locations WHERE type = 'city';
   ```
4. Gerekirse şehri manuel olarak database'e ekle

### Fotoğraflar Yüklenmiyor
**Hata:** Fotoğraflar gösterilmiyor

**Çözüm:**
1. API key'in "Places API (New)" için yetkilendirildiğinden emin ol
2. Fotoğraf URL'leri şu formatta olmalı:
   ```
   https://places.googleapis.com/v1/places/{place_id}/photos/{photo_id}/media?key=API_KEY
   ```
3. Network tab'da fotoğraf isteklerini kontrol et

---

## 💰 Fiyatlandırma

Google Places API (New) kullanımı ücretli (ama **$200/ay free credit** var):

### Autocomplete
- **$2.83 / 1000 request** (ilk 100.000 request)
- Ortalama kullanım: ~50 request/gün = ~$4/ay

### Place Details
- **$17 / 1000 request** (Basic Data)
- Ortalama kullanım: ~10 request/gün = ~$5/ay

### Toplam Tahmini Maliyet
- İlk aylar: **$0** (free credit ile)
- Aylık: **~$10-15** (orta trafik)

> 💡 **Optimizasyon:**
> - Database'de zaten varsa Google'a istek atmıyoruz
> - Autocomplete debounce ile optimize edildi (300ms)
> - Sadece gerekli field'ları çekiyoruz

---

## 📊 API Kullanım Takibi

Google Cloud Console'da API kullanımını takip edebilirsin:

1. [Google Cloud Console](https://console.cloud.google.com/)
2. Sol menü → **"APIs & Services"** → **"Dashboard"**
3. **"Places API (New)"** kartına tıkla
4. Grafiklerde günlük/aylık kullanımı gör

**Uyarı Ayarla:**
1. Sol menü → **"Billing"** → **"Budgets & alerts"**
2. "CREATE BUDGET" tıkla
3. Aylık limit: $50
4. Alert threshold: 50%, 90%, 100%
5. Email bildirimi aktif et

---

## 🚀 Production Checklist

Production'a çıkmadan önce:

- [ ] API Key restriction'ları production domain'i içeriyor
- [ ] `.env` dosyasında production API key var
- [ ] Billing alert'leri kuruldu
- [ ] Database migration production'da çalıştırıldı
- [ ] Test edildi: En az 5 farklı mekan Google'dan eklendi
- [ ] Şehir eşleştirme %90+ başarılı
- [ ] Error handling test edildi (API key yanlış, rate limit, vb.)

---

## 📚 Referanslar

- [Google Places API (New) Docs](https://developers.google.com/maps/documentation/places/web-service/op-overview)
- [Autocomplete API](https://developers.google.com/maps/documentation/places/web-service/autocomplete)
- [Place Details API](https://developers.google.com/maps/documentation/places/web-service/place-details)
- [Pricing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing)

---

## 🆘 Destek

Sorun yaşarsan:
1. Console log'lara bak (`/api/places/search` ve `/api/places/details`)
2. Network tab'da API request'leri kontrol et
3. Google Cloud Console'da API kullanımına bak
4. Database'de `google_place_id` düzgün kaydediliyor mu kontrol et

**Hala çözemediysen:** GitHub Issues'a detaylı açıklama + log'larla birlikte yaz.
