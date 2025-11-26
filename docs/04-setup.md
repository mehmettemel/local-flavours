# Kurulum ve Geliştirme

## 📋 Gereksinimler

- **Node.js:** >= 20.x
- **npm:** >= 10.x
- **Git:** En güncel versiyon
- **Supabase Hesabı:** [supabase.com](https://supabase.com)
- **Google Cloud Console:** (Google Places API için)

## 🚀 İlk Kurulum

### 1. Projeyi Klonla

```bash
git clone <repository-url>
cd local-flavours
```

### 2. Bağımlılıkları Yükle

```bash
npm install
```

Bu komut tüm gerekli paketleri yükleyecek:
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase client
- UI kütüphaneleri (shadcn/ui, Radix UI)
- State management (TanStack Query, Zustand)
- Form kütüphaneleri (React Hook Form, Zod)
- Ve diğerleri...

### 3. Environment Variables Ayarla

`.env.example` dosyasını `.env.local` olarak kopyala:

```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenle:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development

# Google Maps API (Opsiyonel - mekan arama için)
GOOGLE_PLACES_API_KEY=your-google-api-key
```

### 4. Supabase Projesi Oluştur

1. [supabase.com](https://supabase.com) adresine git
2. "New Project" butonuna tıkla
3. Proje adı, database şifresi ve region seç
4. Projenin hazırlanmasını bekle (2-3 dakika)

### 5. Veritabanı Migration'larını Çalıştır

Supabase Dashboard'da SQL Editor'ü aç ve `supabase/migrations/` klasöründeki dosyaları sırayla çalıştır:

```sql
-- 1. supabase/migrations/001_initial_schema.sql içeriğini kopyala ve çalıştır
-- 2. supabase/migrations/003_collections_schema.sql
-- 3. supabase/migrations/004_auth_setup.sql
-- 4. Diğer migration dosyalarını sırayla...
```

**Önemli:** Migration'ları dosya adındaki numaraya göre sırayla çalıştırın!

### 6. Supabase Credentials'ı Al

Supabase Dashboard'da:
- **Project URL:** Settings > API > Project URL
- **Anon Key:** Settings > API > Project API keys > anon public
- **Service Role Key:** Settings > API > Project API keys > service_role (dikkatli kullan!)

Bu değerleri `.env.local` dosyasına yapıştır.

### 7. Google Places API Ayarla (Opsiyonel)

1. [Google Cloud Console](https://console.cloud.google.com) git
2. Yeni proje oluştur veya mevcut projeyi seç
3. "APIs & Services" > "Library" > "Places API" etkinleştir
4. "Credentials" > "Create Credentials" > "API Key"
5. API key'i `.env.local` dosyasına ekle

**Not:** Google Places API olmadan da çalışır, sadece otomatik adres tamamlama olmaz.

### 8. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

Tarayıcıda [http://localhost:3001](http://localhost:3001) adresini aç.

İlk açılışta boş bir uygulama göreceksin. Admin hesabı oluşturmak için devam et.

---

## 👤 İlk Admin Kullanıcısı Oluşturma

### 1. Kayıt Ol

- Ana sayfada sağ üstteki "Giriş Yap" butonuna tıkla
- "Kayıt Ol" sekmesine geç
- Email, kullanıcı adı ve şifre gir
- "Kayıt Ol" butonuna tıkla

### 2. Email Doğrulama (Opsiyonel)

Supabase otomatik doğrulama emaili gönderir. Geliştirme ortamında zorunlu değil.

### 3. Admin Rolü Ver

Supabase Dashboard'da SQL Editor'ü aç ve şu komutu çalıştır:

```sql
UPDATE users
SET role = 'admin'
WHERE username = 'your-username';
```

Artık `/admin` rotalarına erişebilirsin!

---

## 🗄️ Veritabanını Test Verisiyle Doldurma (Opsiyonel)

Hızlı test için örnek veri eklemek istersen:

```bash
npm run seed
```

Bu komut `scripts/seed-database.ts` dosyasını çalıştırır ve şu verileri ekler:
- Örnek kategoriler (Kebap, Kahvaltı, Pizza, vb.)
- Örnek lokasyonlar (Türkiye > İstanbul, Ankara, İzmir)
- Örnek mekanlar (her şehirde 5-10 mekan)
- Örnek koleksiyonlar

**Uyarı:** Mevcut verilerin üzerine yazabilir!

---

## 🛠️ Geliştirme Komutları

### Geliştirme Sunucusu

```bash
npm run dev
```

Port 3001'de başlar. Hot reload aktif.

### Production Build

```bash
npm run build
```

Optimize edilmiş production build oluşturur.

### Production Sunucusu

```bash
npm run start
```

Build'i çalıştırdıktan sonra production sunucusunu başlatır.

### Linting

```bash
npm run lint
```

ESLint ile kod kalitesi kontrolü.

### Formatting

```bash
npm run format
```

Prettier ile kod formatlama. Tailwind class'larını da sıralar.

### Type Check

```bash
npx tsc --noEmit
```

TypeScript hata kontrolü.

---

## 📁 Proje İçinde Yol Bulma

### Yeni Sayfa Eklemek

Next.js App Router kullanıyor. Yeni sayfa için:

```bash
# 1. app/ klasörü altında klasör oluştur
mkdir app/yeni-sayfa

# 2. page.tsx dosyası ekle
touch app/yeni-sayfa/page.tsx
```

```typescript
// app/yeni-sayfa/page.tsx
export default function YeniSayfa() {
  return <div>Yeni Sayfa</div>;
}
```

Otomatik olarak `/yeni-sayfa` route'u oluşur.

### Yeni Component Eklemek

```bash
# components/ klasörüne ekle
touch components/yeni-component.tsx
```

```typescript
// components/yeni-component.tsx
export function YeniComponent() {
  return <div>Yeni Component</div>;
}
```

### Yeni API Fonksiyonu Eklemek

```bash
# lib/api/ klasörüne ekle
touch lib/api/yeni-api.ts
```

```typescript
// lib/api/yeni-api.ts
import { createClient } from '@/lib/supabase/server';

export async function getYeniData() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('tablo').select('*');
  if (error) throw error;
  return data;
}
```

### shadcn/ui Component Eklemek

```bash
npx shadcn@latest add button
```

Bu komut `components/ui/button.tsx` dosyasını oluşturur.

Mevcut componentler:
- button, input, textarea, select
- dialog, dropdown-menu, popover
- card, table, badge, avatar
- form (React Hook Form wrapper)
- ve daha fazlası...

---

## 🐛 Yaygın Sorunlar ve Çözümler

### 1. "Supabase client returned empty" Hatası

**Sebep:** `.env.local` dosyası eksik veya yanlış.

**Çözüm:**
- `.env.local` dosyasının olduğundan emin ol
- `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` değerlerini kontrol et
- Development sunucusunu yeniden başlat (`npm run dev`)

### 2. "Relation does not exist" Hatası

**Sebep:** Migration'lar çalıştırılmamış.

**Çözüm:**
- Supabase Dashboard > SQL Editor
- `supabase/migrations/` klasöründeki dosyaları sırayla çalıştır

### 3. "Unauthorized" veya 403 Hatası

**Sebep:** Row Level Security (RLS) policy'leri yanlış veya eksik.

**Çözüm:**
- Supabase Dashboard > Authentication > Policies
- İlgili tablo için policy'leri kontrol et
- Geliştirme ortamında RLS'i geçici olarak devre dışı bırakabilirsin (önerilmez)

### 4. TypeScript Hataları

**Sebep:** `types/database.ts` dosyası güncel değil.

**Çözüm:**
```bash
# Supabase CLI ile tip tanımlarını yeniden oluştur
npx supabase gen types typescript --project-id "your-project-ref" > types/database.ts
```

### 5. Port 3001 Kullanımda

**Sebep:** Başka bir uygulama port kullanıyor.

**Çözüm:**
```bash
# Farklı port kullan
npm run dev -- -p 3002

# Veya port 3001'i kullanan uygulamayı kapat
lsof -ti:3001 | xargs kill
```

### 6. Google Places API 403 Hatası

**Sebep:** API key geçersiz veya kısıtlanmış.

**Çözüm:**
- Google Cloud Console > Credentials
- API key'in "Places API" için etkin olduğunu kontrol et
- Billing hesabının aktif olduğunu kontrol et

---

## 🧪 Test Kullanıcı Senaryoları

### Senaryo 1: Koleksiyon Oluştur

1. Giriş yap
2. Ana sayfada "Yeni Koleksiyon" butonuna tıkla
3. Başlık: "İstanbul'daki En İyi Adana Kebapçıları"
4. Şehir: İstanbul seç
5. Kategori: Kebap seç
6. Mekan ekle butonu > Google'da ara: "Kebapçı"
7. İlk mekanı seç > Ünlü ürünler: "Adana Kebap, Ayran"
8. "Koleksiyonu Kaydet"

### Senaryo 2: Mekan Oyla

1. Ana sayfada "Liderlik Tablosu" bölümüne git
2. Şehir filtresi: İstanbul
3. Kategori filtresi: Kebap
4. İlk mekana upvote ver (👍)
5. Skorun değiştiğini gör

### Senaryo 3: Admin Paneli

1. Admin olarak giriş yap
2. Sağ üst menüden "Admin Paneli" tıkla
3. İstatistik kartlarını gör
4. "Mekanlar" sekmesine git
5. Yeni mekan ekle veya mevcut mekanı düzenle

---

## 🔄 Git Workflow

### Branch Stratejisi

```bash
# main: production-ready kod
# develop: geliştirme branch'i (varsa)
# feature/*: yeni özellikler
# fix/*: bug fix'ler
```

### Yeni Özellik Geliştirme

```bash
# 1. Yeni branch oluştur
git checkout -b feature/yeni-ozellik

# 2. Kodunu yaz
# ...

# 3. Commit et
git add .
git commit -m "feat: yeni özellik eklendi"

# 4. Push et
git push origin feature/yeni-ozellik

# 5. Pull request oluştur (GitHub/GitLab'de)
```

### Commit Mesajı Formatı

Conventional Commits kullan:

```
feat: yeni özellik eklendi
fix: bug düzeltildi
docs: dokümantasyon güncellendi
style: kod formatlama
refactor: kod refactor
test: test eklendi
chore: build/config değişikliği
```

---

## 📦 Production Deployment

### Vercel (Önerilen)

1. [vercel.com](https://vercel.com) hesabı oluştur
2. GitHub reposunu bağla
3. Environment variables ekle (`.env.local` değerleri)
4. Deploy butonuna tıkla
5. Her commit otomatik deploy edilir

### Environment Variables (Production)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
GOOGLE_PLACES_API_KEY=your-google-api-key
```

### Build Optimizasyonları

```typescript
// next.config.ts
{
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' }
    ]
  },
  // Production'da bundle analysis
  // npm run build && npm run analyze
  // webpack: (config) => { ... }
}
```

---

## 🔍 Debugging

### Server Component Debugging

```typescript
// Server Component içinde
console.log('[SERVER]', data); // Terminal'de görünür
```

### Client Component Debugging

```typescript
// Client Component içinde
'use client';
console.log('[CLIENT]', data); // Browser console'da görünür
```

### React Query Debugging

```typescript
// Devtools ekle (sadece development)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />
```

### Supabase Query Debugging

```typescript
const { data, error } = await supabase
  .from('places')
  .select('*')
  .explain({ analyze: true }); // Query planını gösterir

console.log(error); // Hata detayları
```

---

## 📚 Faydalı Kaynaklar

- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **TanStack Query:** [tanstack.com/query](https://tanstack.com/query)
- **shadcn/ui:** [ui.shadcn.com](https://ui.shadcn.com)
- **Tailwind CSS:** [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

## 💡 Geliştirme İpuçları

1. **Hot Reload Hızlandırma:** Sadece değiştirdiğin sayfayı aç
2. **Type Safety:** Her zaman TypeScript tiplerini kullan
3. **Component Reusability:** Tekrar eden UI'ları component'e çıkar
4. **Server/Client Split:** Mümkün olduğunca Server Component kullan
5. **Query Keys:** TanStack Query'de descriptive key'ler kullan
6. **Error Boundaries:** Hata yakalama için error boundary ekle
7. **Loading States:** Her async işlem için loading state göster
8. **Optimistic Updates:** Hızlı UX için optimistic update kullan
