# Database Migrations

Bu klasör veritabanı migration dosyalarını içerir.

## Migration Uygulama

### Yöntem 1: Supabase Dashboard (Önerilen)

1. [Supabase Dashboard](https://app.supabase.com) üzerinden projenize giriş yapın
2. Sol menüden **SQL Editor** seçin
3. **New query** butonuna tıklayın
4. Migration dosyasının içeriğini kopyalayıp yapıştırın
5. **Run** butonuna tıklayın

### Yöntem 2: Supabase CLI

```bash
# Supabase CLI kurulumu (eğer yoksa)
npm install -g supabase

# Projeye bağlan
supabase link --project-ref YOUR_PROJECT_REF

# Migration'ı uygula
supabase db push

# Veya belirli bir migration dosyası için
psql $DATABASE_URL -f supabase/migrations/016_add_genel_category.sql
```

### Yöntem 3: psql ile Direkt Bağlantı

```bash
# .env.local'deki DATABASE_URL kullanarak
psql YOUR_DATABASE_URL -f supabase/migrations/016_add_genel_category.sql
```

## Migration Listesi

| # | Dosya | Açıklama | Tarih |
|---|-------|----------|-------|
| 001 | `001_initial_schema.sql` | İlk veritabanı şeması | 2024-11-18 |
| 003 | `003_collections_schema.sql` | Koleksiyon tabloları | 2024-11-18 |
| 004 | `004_auth_setup.sql` | Auth kurulumu | 2024-11-18 |
| 011 | `011_simplify_collections.sql` | location_id nullable yapıldı | 2024-11-22 |
| 012 | `012_add_google_place_id.sql` | Google Place ID eklendi | 2024-11-22 |
| 013 | `013_api_usage_tracking.sql` | API kullanım takibi | 2024-11-22 |
| 014 | `014_fix_collections_location_fk.sql` | Collection location FK düzeltildi | 2024-11-24 |
| 015 | `015_add_famous_items_to_collection_places.sql` | Famous items eklendi | 2024-11-25 |
| **016** | **`016_add_genel_category.sql`** | **"Genel" kategorisi eklendi** | **2024-11-27** |

## Son Migration: 016_add_genel_category

Bu migration "Genel" kategorisini ekler. Bu özel kategori:

- ✅ Birden fazla kategoriden mekan içeren koleksiyonlar için kullanılır
- ✅ `display_order: -1` ile listelerde en üstte görünür
- ✅ İkon: Globe
- ✅ İki dilli destek (TR/EN)

**Kullanım Senaryoları:**

1. **Genel Kategori + Belirli Şehir:**
   - Örnek: "Kadıköy'ün En İyi Mekanları"
   - Tek şehir, çoklu kategori (kebap, cafe, bar karışık)

2. **Belirli Kategori + Genel Şehir (location_id = null):**
   - Örnek: "Türkiye'nin En İyi Kahvaltı Mekanları"
   - Çoklu şehir (İstanbul, Ankara, İzmir karışık), tek kategori

3. **Genel Kategori + Genel Şehir:**
   - Örnek: "Türkiye'nin Mutlaka Gidilmesi Gereken Mekanlar"
   - Çoklu şehir, çoklu kategori (en geniş kapsam)

## Migration Sonrası Kontrol

Migration uygulandıktan sonra kontrol etmek için:

```sql
-- "Genel" kategorisinin eklendiğini kontrol et
SELECT slug, names, icon, display_order
FROM categories
WHERE slug = 'genel';

-- Beklenen sonuç:
-- slug: genel
-- names: {"en": "General", "tr": "Genel", ...}
-- icon: Globe
-- display_order: -1
```

## Sorun Giderme

**Hata: "duplicate key value violates unique constraint"**
- Zaten "genel" kategorisi var demektir
- Migration'da `ON CONFLICT (slug) DO NOTHING` komutu olduğu için sorun yok

**Hata: "permission denied"**
- Veritabanı kullanıcınızın INSERT yetkisi olduğundan emin olun
- Supabase Dashboard üzerinden uygularsanız bu sorun olmaz
