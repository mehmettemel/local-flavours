# Veritabanı Şeması

## 📊 Entity-Relationship Diagram (Basitleştirilmiş)

```
┌──────────────┐
│    users     │
└──────────────┘
       │
       │ created_by
       ↓
┌──────────────┐       ┌─────────────────┐
│  collections │───────│collection_places│
└──────────────┘       └─────────────────┘
       │                       │
       │                       │ place_id
       │                       ↓
       │               ┌──────────────┐
       │               │    places    │
       │               └──────────────┘
       │                       │
       │                       ├─→ location_id ─→ locations
       │                       └─→ category_id ─→ categories
       │
       └─→ collection_votes / votes
```

## 🗃️ Tablolar

### 1. users

Kullanıcı profil bilgileri (Supabase auth.users'ı genişletir)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  trust_score INTEGER DEFAULT 100,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  email_verified BOOLEAN DEFAULT false,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  collections_count INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
```

**İlişkiler:**
- `id` → `auth.users(id)` (FK)
- Bir kullanıcının birden fazla koleksiyonu olabilir
- Bir kullanıcı birden fazla oy verebilir

**Önemli Alanlar:**
- `trust_score`: Kullanıcı güvenilirlik skoru (0-1000)
- `role`: Yetki seviyesi (user/moderator/admin)
- `reputation_score`: Topluluk reputasyonu

---

### 2. categories

Mekan kategorileri (Kebap, Kahvaltı, Pizza, vb.)

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  names JSONB NOT NULL DEFAULT '{"en": "", "tr": ""}'::jsonb,
  icon TEXT,  -- Emoji
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_display_order ON categories(display_order);
```

**Örnek Veri:**
```json
{
  "slug": "kebab",
  "names": {
    "en": "Kebab",
    "tr": "Kebap"
  },
  "icon": "🥙",
  "display_order": 1
}
```

**⭐ Özel Kategori: "Genel"**

Birden fazla kategoriden mekan içeren koleksiyonlar için özel bir "Genel" kategorisi bulunur:

```json
{
  "slug": "genel",
  "names": {
    "en": "General",
    "tr": "Genel",
    "description_en": "Collections with places from multiple categories",
    "description_tr": "Birden fazla kategoriden mekanlar içeren koleksiyonlar"
  },
  "icon": "Globe",
  "display_order": -1
}
```

- `display_order: -1` ile kategori listelerinin en üstünde gösterilir
- Koleksiyonlar bu kategoriyi seçerek farklı kategorilerden mekanları bir arada sunabilir
- Örnek: "İstanbul'un En İyi Mekanları" koleksiyonu kebapçı, cafe ve restoranları birlikte içerebilir

---

### 3. locations

Hiyerarşik konum yapısı (Ülke > Şehir > İlçe)

```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES locations(id),
  type TEXT NOT NULL CHECK (type IN ('country', 'city', 'district')),
  slug TEXT NOT NULL,
  names JSONB NOT NULL DEFAULT '{"en": "", "tr": ""}'::jsonb,
  path TEXT,  -- Materialized path: /turkey/istanbul/kadikoy
  has_districts BOOLEAN DEFAULT false,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, slug)
);

-- Indexes
CREATE INDEX idx_locations_parent_id ON locations(parent_id);
CREATE INDEX idx_locations_type ON locations(type);
CREATE INDEX idx_locations_path ON locations(path);
CREATE INDEX idx_locations_slug ON locations(slug);
```

**Materialized Path Örneği:**
```
Türkiye (country)
  path: /turkey

  İstanbul (city, parent: Türkiye)
    path: /turkey/istanbul

    Kadıköy (district, parent: İstanbul)
      path: /turkey/istanbul/kadikoy
```

**Avantajlar:**
- Hızlı ata-çocuk sorguları
- Tüm alt düğümleri getirmek kolay: `WHERE path LIKE '/turkey/istanbul/%'`

---

### 4. places

Mekanlar (restoran, kafe, bar, vb.)

```sql
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id),
  category_id UUID NOT NULL REFERENCES categories(id),
  slug TEXT UNIQUE NOT NULL,
  names JSONB NOT NULL DEFAULT '{"en": "", "tr": ""}'::jsonb,
  descriptions JSONB,
  address TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  google_maps_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  images JSONB DEFAULT '[]'::jsonb,  -- Array of image URLs
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  vote_count INTEGER DEFAULT 0,
  vote_score DECIMAL(10, 2) DEFAULT 0,  -- Ağırlıklı toplam
  rank INTEGER,  -- Calculated ranking
  submitted_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_places_location_id ON places(location_id);
CREATE INDEX idx_places_category_id ON places(category_id);
CREATE INDEX idx_places_slug ON places(slug);
CREATE INDEX idx_places_status ON places(status);
CREATE INDEX idx_places_vote_score ON places(vote_score DESC);
CREATE INDEX idx_places_location_category ON places(location_id, category_id, vote_score DESC);
```

**Önemli Alanlar:**
- `vote_score`: Ağırlıklı oy toplamı (hesap yaşı bazlı)
- `rank`: Lokasyon+kategori içinde sıralama (computed)
- `status`: MVP'de her mekan otomatik 'approved'

---

### 5. collections

Kullanıcı koleksiyonları

```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  names JSONB NOT NULL DEFAULT '{"en": "", "tr": ""}'::jsonb,
  descriptions JSONB,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id),
  category_id UUID REFERENCES categories(id),
  subcategory_id UUID REFERENCES categories(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'flagged')),
  vote_count INTEGER DEFAULT 0,
  vote_score DECIMAL(10, 2) DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_collections_creator_id ON collections(creator_id);
CREATE INDEX idx_collections_location_id ON collections(location_id);
CREATE INDEX idx_collections_category_id ON collections(category_id);
CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_is_featured ON collections(is_featured);
CREATE INDEX idx_collections_vote_score ON collections(vote_score DESC);
```

**Önemli Alanlar:**
- `is_featured`: Admin tarafından öne çıkarılan koleksiyonlar
- `tags`: Aranabilir etiketler
- `subcategory_id`: Alt kategori (örn: Adana Kebap)

**⭐ "Genel" Koleksiyonlar (Multi-City & Multi-Category):**

Koleksiyonlar iki şekilde "Genel" olabilir:

1. **Şehir Bazında "Genel":** `location_id = NULL`
   - Koleksiyon birden fazla şehirden mekanlar içerebilir
   - Örnek: "Türkiye'nin En İyi Kahvaltı Mekanları" (İstanbul, Ankara, İzmir karışık)
   - UI'da "Genel (Tüm Şehirler)" olarak gösterilir

2. **Kategori Bazında "Genel":** `category_id = 'genel'`
   - Koleksiyon birden fazla kategoriden mekanlar içerebilir
   - Örnek: "Kadıköy'ün En İyi Mekanları" (kebapçı, cafe, restoran karışık)
   - UI'da "Genel (Tüm Kategoriler)" olarak gösterilir

3. **Tam Genel:** `location_id = NULL` VE `category_id = 'genel'`
   - En geniş kapsam: Her şehir ve her kategoriden mekanlar
   - Örnek: "Türkiye'nin Mutlaka Gidilmesi Gereken 50 Mekanı"

**Koleksiyon-Mekan İlişkisi:**
- Bir koleksiyon `collection_places` tablosu üzerinden birden fazla mekana sahip olabilir
- Her mekan kendi `location_id` ve `category_id`'sine sahiptir
- Koleksiyonun location/category değerleri sadece "tavsiye edilen filtre" olarak çalışır
- Kullanıcılar koleksiyona herhangi bir şehir/kategoriden mekan ekleyebilir

---

### 6. collection_places

Koleksiyonlardaki mekanlar (junction table)

```sql
CREATE TABLE collection_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL,

  famous_items TEXT[] DEFAULT '{}',  -- Ünlü ürünler
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, place_id),
  UNIQUE(collection_id, display_order)
);

-- Indexes
CREATE INDEX idx_collection_places_collection_id ON collection_places(collection_id);
CREATE INDEX idx_collection_places_place_id ON collection_places(place_id);
CREATE INDEX idx_collection_places_order ON collection_places(collection_id, display_order);
```

**Önemli Alanlar:**
- `display_order`: Sürükle-bırak ile değişir
- `famous_items`: Örnek: ["Adana Kebap", "Ayran", "Mercimek Çorbası"]


---

### 7. votes

Mekan oyları

```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)),  -- -1: downvote, 1: upvote
  weight DECIMAL(3, 2) DEFAULT 1.0,  -- 0.1 - 1.0 (hesap yaşı bazlı)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

-- Indexes
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_place_id ON votes(place_id);
CREATE INDEX idx_votes_created_at ON votes(created_at);
```

**Oy Ağırlığı Hesaplaması:**
```sql
CREATE FUNCTION calculate_vote_weight(user_created_at TIMESTAMPTZ)
RETURNS DECIMAL AS $$
DECLARE
  account_age_days INTEGER;
  weight DECIMAL;
BEGIN
  account_age_days := EXTRACT(DAY FROM NOW() - user_created_at);

  -- 0-7 gün: 0.1 ağırlık
  -- 8-30 gün: 0.3 ağırlık
  -- 31-90 gün: 0.5 ağırlık
  -- 91-180 gün: 0.7 ağırlık
  -- 180+ gün: 1.0 ağırlık

  IF account_age_days <= 7 THEN weight := 0.1;
  ELSIF account_age_days <= 30 THEN weight := 0.3;
  ELSIF account_age_days <= 90 THEN weight := 0.5;
  ELSIF account_age_days <= 180 THEN weight := 0.7;
  ELSE weight := 1.0;
  END IF;

  RETURN weight;
END;
$$ LANGUAGE plpgsql;
```

---

### 8. collection_votes

Koleksiyon oyları

```sql
CREATE TABLE collection_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  weight DECIMAL(3, 2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, collection_id)
);

-- Indexes
CREATE INDEX idx_collection_votes_user_id ON collection_votes(user_id);
CREATE INDEX idx_collection_votes_collection_id ON collection_votes(collection_id);
```

---

### 9. user_follows

Kullanıcı takip ilişkileri

```sql
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)  -- Kendini takip edemez
);

-- Indexes
CREATE INDEX idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON user_follows(following_id);
```

---

### 10. user_preferences

Kullanıcı ayarları

```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  collection_vote_notifications BOOLEAN DEFAULT true,
  new_follower_notifications BOOLEAN DEFAULT true,
  locale TEXT DEFAULT 'tr' CHECK (locale IN ('en', 'tr')),
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔄 Önemli Veritabanı Fonksiyonları

### 1. update_place_ranks()

Her location+category için mekanları sıralar.

```sql
CREATE FUNCTION update_place_ranks()
RETURNS TRIGGER AS $$
BEGIN
  WITH ranked_places AS (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY location_id, category_id
        ORDER BY vote_score DESC, created_at ASC
      ) AS new_rank
    FROM places
    WHERE status = 'approved'
  )
  UPDATE places p
  SET rank = rp.new_rank
  FROM ranked_places rp
  WHERE p.id = rp.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_place_ranks
AFTER INSERT OR UPDATE OF vote_score ON places
FOR EACH STATEMENT
EXECUTE FUNCTION update_place_ranks();
```

### 2. update_vote_statistics()

Oy değiştiğinde place'in vote_count ve vote_score'unu günceller.

```sql
CREATE FUNCTION update_vote_statistics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE places
  SET
    vote_count = (
      SELECT COUNT(*) FROM votes WHERE place_id = COALESCE(NEW.place_id, OLD.place_id)
    ),
    vote_score = (
      SELECT COALESCE(SUM(value * weight), 0)
      FROM votes
      WHERE place_id = COALESCE(NEW.place_id, OLD.place_id)
    )
  WHERE id = COALESCE(NEW.place_id, OLD.place_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vote_statistics
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_vote_statistics();
```

---

## 📈 Sorgu Örnekleri

### 1. Şehirdeki Top 20 Mekan (Kategori Bazlı)

```sql
SELECT
  p.*,
  c.names AS category_names,
  l.names AS location_names
FROM places p
JOIN categories c ON p.category_id = c.id
JOIN locations l ON p.location_id = l.id
WHERE l.slug = 'istanbul'
  AND c.slug = 'kebab'
  AND p.status = 'approved'
ORDER BY p.vote_score DESC, p.created_at ASC
LIMIT 20;
```

### 2. Koleksiyonun Mekanlarını Getir (Sıralı)

```sql
SELECT
  cp.*,
  p.names,
  p.address,
  p.images
FROM collection_places cp
JOIN places p ON cp.place_id = p.id
WHERE cp.collection_id = 'xxx'
ORDER BY cp.display_order ASC;
```

### 3. Kullanıcının Oylarını Getir

```sql
SELECT
  v.place_id,
  v.value,
  v.weight,
  p.names
FROM votes v
JOIN places p ON v.place_id = p.id
WHERE v.user_id = 'xxx'
ORDER BY v.created_at DESC;
```

### 4. En Popüler Koleksiyonlar (Şehre Göre)

```sql
SELECT
  c.*,
  u.username AS creator_username,
  l.names AS location_names,
  cat.names AS category_names
FROM collections c
JOIN users u ON c.creator_id = u.id
LEFT JOIN locations l ON c.location_id = l.id
LEFT JOIN categories cat ON c.category_id = cat.id
WHERE c.status = 'active'
  AND l.slug = 'istanbul'
ORDER BY c.vote_score DESC
LIMIT 10;
```

---

## 🔐 Row Level Security (RLS) Policies

Supabase'de tablo seviyesinde güvenlik kuralları:

```sql
-- Örnek: users tablosu için RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Herkes kullanıcı profillerini okuyabilir
CREATE POLICY "Users are viewable by everyone"
ON users FOR SELECT
USING (true);

-- Kullanıcı sadece kendi profilini güncelleyebilir
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Örnek: collections tablosu için RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Herkes koleksiyonları okuyabilir
CREATE POLICY "Collections are viewable by everyone"
ON collections FOR SELECT
USING (status = 'active');

-- Kullanıcı kendi koleksiyonlarını oluşturabilir
CREATE POLICY "Users can create own collections"
ON collections FOR INSERT
WITH CHECK (auth.uid() = creator_id);

-- Kullanıcı kendi koleksiyonlarını güncelleyebilir
CREATE POLICY "Users can update own collections"
ON collections FOR UPDATE
USING (auth.uid() = creator_id);

-- Kullanıcı kendi koleksiyonlarını silebilir
CREATE POLICY "Users can delete own collections"
ON collections FOR DELETE
USING (auth.uid() = creator_id);
```

---

## 📝 Migration Stratejisi

Migration dosyaları sıralı şekilde `supabase/migrations/` klasöründe:

```
001_initial_schema.sql       # Core tablolar
003_collections_schema.sql   # Koleksiyon sistemi
004_auth_setup.sql           # Auth trigger'ları
011_*.sql                    # Feature eklemeleri
...
```

Yeni migration oluşturma:
1. Dosya adını sırayla numaralandır
2. SQL komutlarını yaz
3. Supabase Dashboard'da SQL Editor'de çalıştır
4. Git'e commit et
