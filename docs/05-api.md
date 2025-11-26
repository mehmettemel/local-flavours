# API Referansı

Bu dokümanda tüm backend API fonksiyonları ve kullanım örnekleri yer alıyor.

## 🗂️ API Organizasyonu

API fonksiyonları `lib/api/` klasöründe modüler şekilde organize edilmiş:

```
lib/api/
├── auth.ts           # Kimlik doğrulama
├── collections.ts    # Koleksiyon işlemleri
├── places.ts         # Mekan işlemleri
├── categories.ts     # Kategori işlemleri
├── locations.ts      # Konum işlemleri
└── rate-limiter.ts   # Rate limiting
```

---

## 🔐 Authentication API

Dosya: `lib/api/auth.ts`

### getCurrentUser()

Mevcut oturum kullanıcısını getirir (Supabase auth.users).

```typescript
import { getCurrentUser } from '@/lib/api/auth';

// Kullanım
const user = await getCurrentUser();

// Dönüş tipi
type User = {
  id: string;
  email: string;
  created_at: string;
  // ... diğer Supabase auth alanları
} | null;
```

### getCurrentUserProfile()

Mevcut kullanıcının profil bilgilerini getirir (users tablosundan).

```typescript
import { getCurrentUserProfile } from '@/lib/api/auth';

const profile = await getCurrentUserProfile();

// Dönüş tipi
type Profile = {
  id: string;
  username: string;
  role: 'user' | 'moderator' | 'admin';
  trust_score: number;
  reputation_score: number;
  followers_count: number;
  following_count: number;
  collections_count: number;
  created_at: string;
} | null;
```

### isAuthenticated()

Kullanıcının giriş yapıp yapmadığını kontrol eder.

```typescript
import { isAuthenticated } from '@/lib/api/auth';

const authenticated = await isAuthenticated();
// Dönüş: boolean
```

### isAdmin()

Kullanıcının admin olup olmadığını kontrol eder.

```typescript
import { isAdmin } from '@/lib/api/auth';

const admin = await isAdmin();
// Dönüş: boolean
```

### signUpWithEmail()

Yeni kullanıcı kaydı.

```typescript
import { signUpWithEmail } from '@/lib/api/auth';

const result = await signUpWithEmail({
  email: 'user@example.com',
  password: 'securePassword123',
  username: 'johndoe'
});

// Dönüş
{
  data: {
    user: User;
    session: Session;
  } | null;
  error: Error | null;
}
```

### signInWithEmail()

Kullanıcı girişi.

```typescript
import { signInWithEmail } from '@/lib/api/auth';

const result = await signInWithEmail({
  email: 'user@example.com',
  password: 'securePassword123'
});

// Dönüş
{
  data: {
    user: User;
    session: Session;
  } | null;
  error: Error | null;
}
```

### signOut()

Kullanıcı çıkışı.

```typescript
import { signOut } from '@/lib/api/auth';

await signOut();
```

### resetPasswordForEmail()

Şifre sıfırlama emaili gönderir.

```typescript
import { resetPasswordForEmail } from '@/lib/api/auth';

const result = await resetPasswordForEmail('user@example.com');

// Dönüş
{
  data: {} | null;
  error: Error | null;
}
```

### updatePassword()

Kullanıcı şifresini günceller.

```typescript
import { updatePassword } from '@/lib/api/auth';

const result = await updatePassword('newSecurePassword123');

// Dönüş
{
  data: { user: User } | null;
  error: Error | null;
}
```

### updateUserPreferences()

Kullanıcı tercihlerini günceller.

```typescript
import { updateUserPreferences } from '@/lib/api/auth';

await updateUserPreferences({
  email_notifications: true,
  locale: 'tr',
  theme: 'dark'
});
```

---

## 📚 Collections API

Dosya: `lib/api/collections.ts`

### getCollections()

Koleksiyonları filtrelerle getirir.

```typescript
import { getCollections } from '@/lib/api/collections';

const collections = await getCollections({
  creatorId?: string;      // Belirli kullanıcının koleksiyonları
  locationId?: string;     // Belirli lokasyondaki koleksiyonlar
  categoryId?: string;     // Belirli kategorideki koleksiyonlar
  featured?: boolean;      // Sadece öne çıkan koleksiyonlar
  status?: 'active' | 'archived' | 'flagged';
  limit?: number;          // Maksimum sonuç sayısı
  offset?: number;         // Pagination için offset
});

// Dönüş
type Collection[] = {
  id: string;
  slug: string;
  names: { en: string; tr: string };
  descriptions?: { en: string; tr: string };
  creator_id: string;
  location_id?: string;
  category_id?: string;
  subcategory_id?: string;
  vote_count: number;
  vote_score: number;
  is_featured: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}[];
```

### getCollectionById()

ID ile tek koleksiyon getirir.

```typescript
import { getCollectionById } from '@/lib/api/collections';

const collection = await getCollectionById('collection-uuid');
```

### getCollectionBySlug()

Slug ile tek koleksiyon getirir.

```typescript
import { getCollectionBySlug } from '@/lib/api/collections';

const collection = await getCollectionBySlug('istanbul-best-kebab-places');
```

### createCollection()

Yeni koleksiyon oluşturur.

```typescript
import { createCollection } from '@/lib/api/collections';

const newCollection = await createCollection({
  names: {
    en: 'Best Kebab Places in Istanbul',
    tr: 'İstanbul\'daki En İyi Kebapçılar'
  },
  descriptions: {
    en: 'My favorite kebab places',
    tr: 'Favori kebapçılarım'
  },
  location_id: 'istanbul-uuid',
  category_id: 'kebab-uuid',
  tags: ['kebab', 'istanbul', 'food']
});

// Otomatik oluşturulur:
// - slug (names.tr'den generate edilir)
// - creator_id (mevcut kullanıcı)
// - status: 'active'
```

### updateCollection()

Koleksiyonu günceller.

```typescript
import { updateCollection } from '@/lib/api/collections';

await updateCollection('collection-uuid', {
  names: {
    en: 'Updated Title',
    tr: 'Güncellenmiş Başlık'
  },
  is_featured: true
});
```

### deleteCollection()

Koleksiyonu siler.

```typescript
import { deleteCollection } from '@/lib/api/collections';

await deleteCollection('collection-uuid');
```

### getCollectionPlaces()

Koleksiyondaki mekanları getirir (sıralı).

```typescript
import { getCollectionPlaces } from '@/lib/api/collections';

const places = await getCollectionPlaces('collection-uuid');

// Dönüş
type CollectionPlace[] = {
  id: string;
  collection_id: string;
  place_id: string;
  display_order: number;
  curator_note?: string;
  famous_items: string[];  // ["Adana Kebap", "Ayran"]
  created_at: string;
  place: {
    id: string;
    names: { en: string; tr: string };
    address: string;
    images: string[];
    vote_score: number;
    // ... diğer place alanları
  };
}[];
```

### addPlaceToCollection()

Koleksiyona mekan ekler.

```typescript
import { addPlaceToCollection } from '@/lib/api/collections';

await addPlaceToCollection({
  collection_id: 'collection-uuid',
  place_id: 'place-uuid',
  display_order: 1,
  curator_note: 'Harika bir yer!',
  famous_items: ['Adana Kebap', 'Ayran', 'Mercimek Çorbası']
});
```

### removePlaceFromCollection()

Koleksiyondan mekan çıkarır.

```typescript
import { removePlaceFromCollection } from '@/lib/api/collections';

await removePlaceFromCollection('collection-place-uuid');
```

### reorderCollectionPlaces()

Koleksiyondaki mekanların sırasını değiştirir.

```typescript
import { reorderCollectionPlaces } from '@/lib/api/collections';

await reorderCollectionPlaces('collection-uuid', [
  { place_id: 'place-1-uuid', display_order: 1 },
  { place_id: 'place-2-uuid', display_order: 2 },
  { place_id: 'place-3-uuid', display_order: 3 }
]);
```

### toggleCollectionFeatured()

Koleksiyonu öne çıkar/çıkarma (sadece admin).

```typescript
import { toggleCollectionFeatured } from '@/lib/api/collections';

await toggleCollectionFeatured('collection-uuid', true);
```

### getTopCollections()

Şehirdeki en popüler koleksiyonları getirir.

```typescript
import { getTopCollections } from '@/lib/api/collections';

const topCollections = await getTopCollections('istanbul', 10);
```

### getFeaturedCollection()

Şehir için öne çıkan hero koleksiyonunu getirir.

```typescript
import { getFeaturedCollection } from '@/lib/api/collections';

const featured = await getFeaturedCollection('istanbul');
```

---

## 📍 Places API

Dosya: `lib/api/places.ts`

### getPlaces()

Mekanları filtrelerle getirir.

```typescript
import { getPlaces } from '@/lib/api/places';

const places = await getPlaces({
  locationId?: string;     // Şehir/ilçe bazlı
  categoryId?: string;     // Kategori bazlı
  status?: 'pending' | 'approved' | 'rejected';
  limit?: number;
  offset?: number;
});
```

### getPlaceById()

ID ile mekan getirir.

```typescript
import { getPlaceById } from '@/lib/api/places';

const place = await getPlaceById('place-uuid');
```

### getPlaceBySlug()

Slug ile mekan getirir.

```typescript
import { getPlaceBySlug } from '@/lib/api/places';

const place = await getPlaceBySlug('sultanahmet-koftecisi');
```

### createPlace()

Yeni mekan oluşturur.

```typescript
import { createPlace } from '@/lib/api/places';

const newPlace = await createPlace({
  names: {
    en: 'Sultanahmet Köftecisi',
    tr: 'Sultanahmet Köftecisi'
  },
  address: 'Divanyolu Cad. No:12, Sultanahmet, İstanbul',
  location_id: 'istanbul-uuid',
  category_id: 'kebab-uuid',
  phone: '+90 212 123 45 67',
  website: 'https://example.com',
  latitude: 41.0082,
  longitude: 28.9784
});

// MVP'de otomatik onaylanır (status: 'approved')
```

### updatePlace()

Mekanı günceller.

```typescript
import { updatePlace } from '@/lib/api/places';

await updatePlace('place-uuid', {
  names: { en: 'Updated Name', tr: 'Güncellenmiş İsim' },
  phone: '+90 212 999 99 99'
});
```

### deletePlace()

Mekanı siler.

```typescript
import { deletePlace } from '@/lib/api/places';

await deletePlace('place-uuid');
```

### getTopPlaces()

Şehir+kategori bazlı top 20 mekan.

```typescript
import { getTopPlaces } from '@/lib/api/places';

const topPlaces = await getTopPlaces({
  location_slug: 'istanbul',
  category_slug: 'kebab',
  limit: 20
});

// Dönüş: vote_score'a göre sıralı mekanlar
```

### votePlace()

Mekana oy verir.

```typescript
import { votePlace } from '@/lib/api/places';

await votePlace({
  place_id: 'place-uuid',
  value: 1  // 1: upvote, -1: downvote
});

// Oy ağırlığı otomatik hesaplanır (hesap yaşı bazlı)
// Aynı kullanıcı tekrar oy verirse güncellenir
```

### getUserVote()

Kullanıcının mekana verdiği oyu getirir.

```typescript
import { getUserVote } from '@/lib/api/places';

const vote = await getUserVote('place-uuid');

// Dönüş
{
  value: 1 | -1 | null;  // null: oy verilmemiş
  weight: number;
}
```

---

## 🏷️ Categories API

Dosya: `lib/api/categories.ts`

### getCategories()

Kategorileri getirir.

```typescript
import { getCategories } from '@/lib/api/categories';

const categories = await getCategories({
  parentId?: string;  // Alt kategoriler için
  limit?: number;
});

// Dönüş
type Category[] = {
  id: string;
  slug: string;
  names: { en: string; tr: string };
  icon: string;  // Emoji
  display_order: number;
  created_at: string;
}[];
```

### getCategoryBySlug()

Slug ile kategori getirir.

```typescript
import { getCategoryBySlug } from '@/lib/api/categories';

const category = await getCategoryBySlug('kebab');
```

### createCategory()

Yeni kategori oluşturur (admin).

```typescript
import { createCategory } from '@/lib/api/categories';

await createCategory({
  slug: 'kebab',
  names: { en: 'Kebab', tr: 'Kebap' },
  icon: '🥙',
  display_order: 1
});
```

---

## 📌 Locations API

Dosya: `lib/api/locations.ts`

### getLocations()

Lokasyonları getirir.

```typescript
import { getLocations } from '@/lib/api/locations';

const locations = await getLocations({
  parentId?: string;  // Alt lokasyonlar için
  type?: 'country' | 'city' | 'district';
  limit?: number;
});
```

### getCities()

Tüm şehirleri getirir.

```typescript
import { getCities } from '@/lib/api/locations';

const cities = await getCities();

// Türkiye altındaki tüm city tipindeki lokasyonları getirir
```

### getLocationBySlug()

Slug ile lokasyon getirir.

```typescript
import { getLocationBySlug } from '@/lib/api/locations';

const location = await getLocationBySlug('istanbul');
```

### createLocation()

Yeni lokasyon oluşturur (admin).

```typescript
import { createLocation } from '@/lib/api/locations';

await createLocation({
  parent_id: 'turkey-uuid',
  type: 'city',
  slug: 'istanbul',
  names: { en: 'Istanbul', tr: 'İstanbul' },
  latitude: 41.0082,
  longitude: 28.9784,
  has_districts: true
});

// path otomatik oluşturulur: /turkey/istanbul
```

---

## ⏱️ Rate Limiter API

Dosya: `lib/api/rate-limiter.ts`

Google Places API için rate limiting.

### checkRateLimit()

Rate limit kontrolü yapar.

```typescript
import { checkRateLimit } from '@/lib/api/rate-limiter';

const allowed = await checkRateLimit('places-search', userId);

if (!allowed) {
  throw new Error('Rate limit exceeded');
}
```

**Limitler:**
- **Per Minute:** 10 istek
- **Per Hour:** 100 istek
- **Per Day:** 500 istek

### logApiUsage()

API kullanımını loglar.

```typescript
import { logApiUsage } from '@/lib/api/rate-limiter';

await logApiUsage({
  endpoint: 'places-search',
  userId: 'user-uuid',
  cost: 0.032  // Google Places API cost
});
```

### getCachedSearch()

Cache'lenmiş arama sonuçlarını getirir.

```typescript
import { getCachedSearch } from '@/lib/api/rate-limiter';

const cached = await getCachedSearch('kebap istanbul');
// 5 dakika cache TTL
```

### setCachedSearch()

Arama sonuçlarını cache'ler.

```typescript
import { setCachedSearch } from '@/lib/api/rate-limiter';

await setCachedSearch('kebap istanbul', results);
```

---

## 🌐 Next.js API Routes

### POST /api/places/search

Google Places Autocomplete proxy.

```typescript
// Frontend'den kullanım
const response = await fetch('/api/places/search?' + new URLSearchParams({
  input: 'kebap',
  location: '41.0082,28.9784',
  radius: '50000'
}));

const data = await response.json();

// Dönüş
{
  predictions: [
    {
      description: 'Sultanahmet Köftecisi, İstanbul',
      place_id: 'ChIJ...',
      structured_formatting: {
        main_text: 'Sultanahmet Köftecisi',
        secondary_text: 'İstanbul'
      }
    }
  ]
}
```

### POST /api/places/details

Google Places Details proxy.

```typescript
// Frontend'den kullanım
const response = await fetch('/api/places/details?' + new URLSearchParams({
  place_id: 'ChIJ...'
}));

const data = await response.json();

// Dönüş
{
  name: 'Sultanahmet Köftecisi',
  formatted_address: 'Divanyolu Cad. No:12, İstanbul',
  geometry: {
    location: { lat: 41.0082, lng: 28.9784 }
  },
  formatted_phone_number: '+90 212 123 45 67',
  website: 'https://example.com',
  photos: [...]
}
```

---

## 🪝 Custom React Hooks

### useAuth()

Auth context hook.

```typescript
import { useAuth } from '@/lib/contexts/auth-context';

function Component() {
  const { user, profile, session, isLoading } = useAuth();

  if (isLoading) return <Spinner />;
  if (!user) return <LoginButton />;

  return <div>Hoş geldin, {profile?.username}</div>;
}
```

### useAuthQuery()

TanStack Query ile auth state.

```typescript
import { useAuthQuery } from '@/lib/hooks/use-auth-query';

const { data: session } = useAuthQuery();
```

### useCategories()

Kategorileri getirir.

```typescript
import { useCategories } from '@/lib/hooks/use-categories';

const { data: categories, isLoading } = useCategories();
```

### useLocations()

Lokasyonları getirir.

```typescript
import { useLocations } from '@/lib/hooks/use-locations';

const { data: cities, isLoading } = useLocations({ type: 'city' });
```

---

## 🔄 TanStack Query Kullanımı

### Query Keys Konvansiyonu

```typescript
// Collections
['collections']                           // Tüm koleksiyonlar
['collections', { featured: true }]       // Öne çıkan koleksiyonlar
['collections', collectionId]             // Tek koleksiyon
['collections', collectionId, 'places']   // Koleksiyon mekanları

// Places
['places']                                // Tüm mekanlar
['places', { locationId, categoryId }]    // Filtrelenmiş mekanlar
['places', placeId]                       // Tek mekan
['places', placeId, 'vote']               // Kullanıcının oyu

// Auth
['auth', 'session']                       // Session
['auth', 'profile', userId]               // User profile
```

### Mutation Örneği

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCollection } from '@/lib/api/collections';

function CreateCollectionButton() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createCollection,
    onSuccess: () => {
      // Cache invalidation
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Koleksiyon oluşturuldu!');
    },
    onError: (error) => {
      toast.error('Hata: ' + error.message);
    }
  });

  return (
    <button onClick={() => mutation.mutate(formData)}>
      Oluştur
    </button>
  );
}
```

---

## 🛡️ Error Handling

Tüm API fonksiyonları hata fırlatır. Try-catch ile yakalayın:

```typescript
try {
  const collection = await getCollectionBySlug('invalid-slug');
} catch (error) {
  if (error instanceof Error) {
    console.error('Hata:', error.message);
  }
}
```

TanStack Query ile:

```typescript
const { data, error, isError } = useQuery({
  queryKey: ['collections', slug],
  queryFn: () => getCollectionBySlug(slug)
});

if (isError) {
  return <div>Hata: {error.message}</div>;
}
```

---

## 📊 Response Format

Tüm API fonksiyonları tipli dönüşler yapar:

```typescript
// Başarılı
return data;  // Array veya Object

// Hata durumunda throw
throw new Error('Collection not found');
```

Supabase yanıtları:

```typescript
const { data, error } = await supabase...;

if (error) throw error;
return data;
```
