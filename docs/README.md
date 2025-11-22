# LocalFlavours - Dokümantasyon

Modern, hızlı ve sade koleksiyon bazlı mekan keşif platformu.

## 📚 Dökümanlar

### Kurulum & Başlangıç
- **[ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md)** - Geliştirme ortamı kurulumu
- **[AUTHENTICATION-GUIDE.md](./AUTHENTICATION-GUIDE.md)** - Supabase auth kurulumu

### Google Places Entegrasyonu
- **[GOOGLE-PLACES-SETUP.md](./GOOGLE-PLACES-SETUP.md)** - Google Places API kurulumu ve kullanımı

### Mimari & Planlama
- **[NEW-SIMPLE-ARCHITECTURE.md](./NEW-SIMPLE-ARCHITECTURE.md)** - Yeni sade yapı mimarisi
- **[project-overview.md](./project-overview.md)** - Proje genel bakış

### UI Components
- **[UI-COMPONENTS-FIXES.md](./UI-COMPONENTS-FIXES.md)** - UI component sorunları ve çözümleri

## 🗂️ Dosya Yapısı

```
docs/
├── README.md                      # Bu dosya
├── AUTHENTICATION-GUIDE.md        # Auth kurulumu
├── ENVIRONMENT-SETUP.md           # Geliştirme ortamı
├── GOOGLE-PLACES-SETUP.md         # Google Places API
├── NEW-SIMPLE-ARCHITECTURE.md     # Yeni mimari
├── UI-COMPONENTS-FIXES.md         # UI component sorunları ve çözümleri
└── project-overview.md            # Proje özeti

supabase/migrations/
├── 001_initial_schema.sql         # İlk schema (users, locations, categories, places)
├── 003_collections_schema.sql     # Collections & voting sistemi
├── 004_auth_setup.sql             # Auth & RLS policies
├── 011_simplify_collections.sql   # Collections sadeleştirme
└── 012_add_google_place_id.sql    # Google Places entegrasyonu

scripts/
└── seed-database.ts               # Database seed script (locations & categories)
```

## 🚀 Hızlı Başlangıç

### 1. Environment Setup
```bash
# .env.local oluştur
cp .env.example .env.local

# Environment variables ekle:
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
GOOGLE_PLACES_API_KEY=your_google_api_key
```

### 2. Dependencies
```bash
npm install
```

### 3. Database Migrations
Supabase Dashboard → SQL Editor'de sırayla çalıştır:
1. `001_initial_schema.sql`
2. `003_collections_schema.sql`
3. `004_auth_setup.sql`
4. `011_simplify_collections.sql`
5. `012_add_google_place_id.sql`

### 4. Seed Database
```bash
npm run seed
```

### 5. Dev Server
```bash
npm run dev
```

## 🎯 Yeni Sade Yapı

### Koleksiyon Oluşturma
1. Koleksiyon adı + kategori
2. Google Places ile mekan ara VEYA text olarak ekle
3. 3-20 mekan ekle (array içinde)
4. Sürükle-bırak ile sırala
5. Oluştur → Hepsi tek seferde kaydedilir

### Özellikler
- ✅ Google Places autocomplete
- ✅ Otomatik adres, telefon, rating, fotoğraf
- ✅ Text fallback (Google'da bulamazsan)
- ✅ Akıllı şehir eşleştirme
- ✅ google_place_id ile mükemmel duplicate detection
- ✅ Responsive fullscreen dialog
- ✅ Drag & drop sıralama

## 📝 Migration Sırası

Migrations mutlaka sırayla çalıştırılmalı:

1. **001** → Initial schema (core tables)
2. **003** → Collections & voting
3. **004** → Auth & RLS
4. **011** → Collections simplification
5. **012** → Google Places integration

## 🔧 Seed Script

`seed-database.ts` şunları ekler:
- Türkiye ve şehirler (locations)
- Ana kategoriler ve alt kategoriler
- Temel veri yapısı

```bash
npm run seed
```

## 📖 Detaylı Dökümanlar

Her bir döküman dosyasında detaylı bilgi bulabilirsin:

- **Ortam kurulumu** → `ENVIRONMENT-SETUP.md`
- **Auth kurulumu** → `AUTHENTICATION-GUIDE.md`
- **Google Places** → `GOOGLE-PLACES-SETUP.md`
- **Yeni mimari** → `NEW-SIMPLE-ARCHITECTURE.md`
- **UI Component çözümleri** → `UI-COMPONENTS-FIXES.md`
- **Proje detayları** → `project-overview.md`

## 🆘 Sorun Giderme

### Build Hatası
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Supabase Bağlantı Hatası
- `.env.local` dosyasındaki URL ve key'leri kontrol et
- Supabase Dashboard'da RLS policies aktif mi kontrol et

### Google Places API Hatası
- API key domain restriction'ları kontrol et
- Console'da API kullanımını kontrol et
- `GOOGLE-PLACES-SETUP.md` dökümanına bak

### UI Component Sorunları
- Dialog içinde Combobox scroll sorunları
- `UI-COMPONENTS-FIXES.md` dökümanına bak

## 📞 Destek

Sorun yaşarsan:
1. İlgili dökümanı oku
2. Console log'lara bak
3. Network tab'da API çağrılarını kontrol et
4. GitHub Issues'da ara veya yeni issue aç

---

**Son Güncelleme:** 2025-01-22
**Versiyon:** 2.0 (Sade Yapı)
