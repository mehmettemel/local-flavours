# Yeni Sade Yapı - Architecture

## 🎯 Vizyon

**Koleksiyon oluşturmak 30 saniye sürmeli.**

Kullanıcı:
1. Koleksiyon adı yazar
2. Kategori seçer
3. Google'da arar veya text yazar → Enter
4. 3-4 mekan ekler
5. "Oluştur" butonuna basar
6. Bitti! 🎉

## 🏗️ Yeni Yapı

### Tek Dialog, Hepsi İçinde

```
┌────────────────────────────────────────────────────────┐
│  KOLEKSYON OLUŞTUR                          [X]        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Koleksiyon Adı *                                     │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Adana'nın En İyi Kebapçıları                     │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Kategori *                                           │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 🍖 Kebap & Ocakbaşı                      ▼       │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ─────────────────────────────────────────────────── │
│                                                        │
│  Mekanlar (3-20 arası)                                │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 🔍 Google'da ara veya mekan adı yaz... (Enter)  │ │
│  │    ↓ Dropdown (Google sonuçları)                 │ │
│  │    • Halil Usta Kebap - Seyhan, Adana            │ │
│  │    • Öz Adana Kebap - Çukurova, Adana            │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ≡  1. Halil Usta Kebap                    [x]    │ │
│  │       📍 Seyhan, Adana  ⭐ 4.5 (1,234)            │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ ≡  2. Öz Adana Kebap                      [x]    │ │
│  │       📍 Çukurova, Adana  ⭐ 4.8 (892)            │ │
│  ├──────────────────────────────────────────────────┤ │
│  │ ≡  3. Kazım'ın Yeri (Text)                [x]    │ │
│  │       📝 Kullanıcı tarafından eklendi            │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  En az 3 mekan eklemelisin                            │
│                                                        │
│                                  [İptal]  [Oluştur]   │
└────────────────────────────────────────────────────────┘

Responsive: Mobilde fullscreen, desktop'ta 90% genişlik
```

### İki Tip Mekan Ekleme

#### 1. Google Places (Öncelikli)
```
Kullanıcı "Halil Usta" yazar
↓
Google API'den 5 sonuç gelir (autocomplete)
↓
Kullanıcı birine tıklar
↓
Place Details API çağrılır (background)
↓
Mekan bilgileri çekilir:
  - İsim
  - Adres
  - Koordinat
  - Telefon
  - Rating
  - Fotoğraflar
  - google_place_id
↓
Array'e eklenir (local state)
↓
"Oluştur"a basınca database'e kaydedilir
```

#### 2. Text (Fallback)
```
Kullanıcı "Kazım'ın Yeri" yazar
↓
Google sonuç bulamaz
↓
Kullanıcı Enter'a basar
↓
Plain text olarak array'e eklenir:
  {
    type: 'text',
    name: 'Kazım'ın Yeri',
    google_place_id: null
  }
↓
"Oluştur"a basınca:
  - places tablosuna minimal bilgi ile ekler
  - google_place_id = null
  - sadece name ve category_id var
```

## 📊 Database Değişiklikleri

### places Tablosu Sadeleşir

**Kaldırılacak Kolonlar:**
- ❌ `descriptions` (Google'dan alıyoruz veya hiç yok)
- ❌ `images` → `google_photos` (Google'dan direkt çekiyoruz)

**Zorunlu → Opsiyonel:**
- `location_id` → NULL olabilir (text mekanlar için)
- `address` → NULL olabilir
- `google_maps_url` → NULL olabilir

**Yeni Yapı:**
```sql
places:
  - id (PK)
  - slug
  - names (JSONB) -- Sadece name
  - category_id (FK, nullable)
  - google_place_id (TEXT, UNIQUE, nullable)
  - address (TEXT, nullable)
  - location_id (FK, nullable)
  - phone_number (TEXT, nullable)
  - website (TEXT, nullable)
  - latitude/longitude (nullable)
  - rating (nullable)
  - user_ratings_total (nullable)
  - opening_hours (JSONB, nullable)
  - status (approved/pending)
  - vote_count, vote_score
```

**Text Mekanlar:**
```json
{
  "id": "abc-123",
  "names": {"tr": "Kazım'ın Yeri", "en": "Kazım'ın Yeri"},
  "google_place_id": null,
  "address": null,
  "location_id": null,
  "category_id": "kebap-id",
  "status": "approved"
}
```

## 🗂️ Component Yapısı

### Kaldırılacak Component'ler
```
components/collections/
  ❌ add-place-dialog.tsx (artık yok)
  ❌ add-place-dialog-old.tsx (backup)

components/admin/
  ❌ place-dialog.tsx (admin'de mekan ekleme yok)
  ❌ places/page.tsx (admin'de mekan listesi yok)

components/places/
  ❌ place-card.tsx (artık place detail page yok)
```

### Yeni Component Yapısı
```
components/collections/
  ✅ collection-dialog.tsx (YENİ - hepsi burada)
     ├─ Google autocomplete input
     ├─ Mekan array display (draggable)
     └─ Form submit

components/ui/
  ✅ google-places-autocomplete.tsx (mevcut, küçük iyileştirmeler)
  ✅ inline-place-item.tsx (YENİ - array'deki her mekan)
```

## 🎨 UI/UX Detayları

### Responsive Dialog
```css
/* Mobile */
@media (max-width: 768px) {
  dialog: {
    width: 100vw,
    height: 100vh,
    maxHeight: 100vh,
    padding: 16px
  }
}

/* Desktop */
@media (min-width: 769px) {
  dialog: {
    width: 90vw,
    maxWidth: 1200px,
    height: 90vh,
    maxHeight: 900px,
    padding: 32px
  }
}
```

### Mekan Input Davranışı
```
┌─────────────────────────────────────────────┐
│ 🔍 Google'da ara veya mekan adı yaz...     │
│                                              │
│ Kullanıcı yazmaya başlar                    │
│    ↓                                         │
│ Google autocomplete dropdown                │
│    • Halil Usta Kebap - Adana               │
│    • Halil Lokantası - İstanbul             │
│    • [Google'da sonuç yoksa]                │
│    💡 "Kazım'ın Yeri" olarak eklemek için  │
│       Enter'a bas                            │
└─────────────────────────────────────────────┘
```

### Drag & Drop Sıralama
- Her mekan kartında ≡ (grip) ikonu
- Sürükle-bırak ile sıralama
- Otomatik numara güncellemesi

## 🔄 Akış Diyagramları

### Koleksiyon Oluşturma
```
[Dialog Aç]
    ↓
[Koleksiyon Adı Gir]
    ↓
[Kategori Seç]
    ↓
[Mekan Ara/Ekle] ←────┐
    ↓                  │
[Google sonuç var mı?] │
    ├─ Evet → [Place Details API] → [Array'e Ekle] ─┘
    └─ Hayır → [Enter: Text Ekle] → [Array'e Ekle] ─┘

[En az 3 mekan var mı?]
    ├─ Hayır → [Hata: En az 3 mekan ekle]
    └─ Evet → [Oluştur Butonu Aktif]
        ↓
    [Oluştur'a Tıkla]
        ↓
    [Database'e Kaydet]
        ├─ Collection insert
        ├─ Her mekan için:
        │   ├─ google_place_id var mı kontrol et
        │   ├─ Varsa: Mevcut place'i kullan
        │   └─ Yoksa: Yeni place oluştur
        └─ collection_places insert (bulk)
        ↓
    [Success → Dialog Kapat]
```

## 🚮 Kaldırılacaklar

### API Routes
- ❌ `/api/places/create` (artık gerek yok)
- ✅ `/api/places/search` (KALIYOR - Google autocomplete)
- ✅ `/api/places/details` (KALIYOR - Place details)

### Pages
- ❌ `/admin/places` (admin'de mekan yönetimi yok)
- ❌ `/places/[slug]` (mekan detail page yok)

### Hooks
- ❌ `use-places.ts` (places fetch hook'u gereksiz)

### Utils
- ✅ `match-location.ts` (KALIYOR - Google'dan şehir eşleştirme için)

### Docs
- ❌ `COLLECTION-IMPORT-GUIDE.md` (eski import yapısı)
- ✅ `GOOGLE-PLACES-SETUP.md` → Güncelle (sadeleştir)

### Scripts
- ❌ `scripts/import-koleksiyon.ts` (eski import)
- ❌ `scripts/seed-collections.ts` → Sadeleştir (sadece categories ve locations seed)

## 📱 Responsive Tasarım

### Mobile (< 768px)
- Dialog fullscreen
- Input'lar stack (dikey)
- Mekan kartları küçük
- Tek sütun layout

### Tablet (768px - 1024px)
- Dialog 90% ekran
- Input'lar yan yana (2 sütun)
- Mekan kartları orta boy

### Desktop (> 1024px)
- Dialog max 1200px genişlik
- Geniş layout
- Mekan kartları detaylı (fotoğraf + bilgiler)

## 🎯 Performans

### Optimizasyonlar
1. **Debounce**: Google autocomplete 300ms debounce
2. **Lazy Load**: Place details sadece seçildiğinde
3. **Duplicate Check**: google_place_id ile instant
4. **Bulk Insert**: Tüm mekanlar tek seferde
5. **No Redirect**: Dialog içinde success/error mesajı

### Hedef Metrikler
- Koleksiyon oluşturma: < 30 saniye
- Google API response: < 500ms
- Dialog açılış: < 100ms
- Sıralama (drag): 60fps

## 🔐 Güvenlik

### API Key
- ✅ Backend'de saklanıyor
- ✅ Domain restriction aktif
- ✅ API restriction (Places API only)

### Validation
- Koleksiyon adı: 3-100 karakter
- Mekan sayısı: 3-20 arası
- Kategori: Zorunlu

### Rate Limiting
- Google API: Google tarafından
- Database: Supabase RLS policies

## 📝 Migration Planı

### 1. Yeni Component Oluştur
- `collection-dialog.tsx` (yeni)
- `inline-place-item.tsx` (yeni)

### 2. Eski Component'leri Kaldır
- `add-place-dialog.tsx`
- `add-place-dialog-old.tsx`
- `components/admin/place-dialog.tsx`

### 3. Database Cleanup (Opsiyonel)
```sql
-- Gereksiz kolonları kaldır (ileride)
ALTER TABLE places DROP COLUMN IF EXISTS descriptions;
```

### 4. Routing Cleanup
- Admin routes'dan places sayfalarını kaldır
- Place detail page route'unu kaldır

### 5. Docs Update
- `NEW-SIMPLE-ARCHITECTURE.md` (bu dosya)
- `GOOGLE-PLACES-SETUP.md` → Sadeleştir

## ✅ Checklist

### Phase 1: Core Implementation
- [ ] Yeni `collection-dialog.tsx` oluştur
- [ ] Google autocomplete entegre et
- [ ] Text mode ekle (Enter ile)
- [ ] Mekan array display (draggable)
- [ ] Form validation
- [ ] Database bulk insert
- [ ] Responsive tasarım

### Phase 2: Cleanup
- [ ] Eski component'leri sil
- [ ] Admin places sayfalarını sil
- [ ] Gereksiz API routes sil
- [ ] Gereksiz hooks sil
- [ ] Docs güncelle

### Phase 3: Polish
- [ ] Loading states
- [ ] Error handling
- [ ] Success messages
- [ ] Keyboard shortcuts (Esc, Enter)
- [ ] Accessibility (a11y)

---

**Son Güncelleme:** 2025-01-22
**Durum:** Planlama Aşaması
