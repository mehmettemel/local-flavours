# Teknik Mimari

## 🏗️ Genel Mimari

LocalFlavors, modern bir full-stack Next.js uygulamasıdır. Supabase (PostgreSQL) backend'i ile monolitik bir yapıya sahiptir.

```
┌─────────────────────────────────────────────────────┐
│                   Next.js App Router                │
│  ┌─────────────────────────────────────────────┐   │
│  │     React Server Components (SSR)           │   │
│  │  ┌──────────────────────────────────────┐   │   │
│  │  │   Client Components (Interactive)    │   │   │
│  │  └──────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────┐
│            API Layer (Server Actions)               │
│  - TanStack Query (Client State)                    │
│  - Zod Validation                                   │
│  - Rate Limiting                                    │
└─────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────┐
│               Supabase (Backend)                    │
│  - PostgreSQL Database                              │
│  - Auth (PKCE Flow)                                 │
│  - Real-time Subscriptions                          │
│  - Row Level Security (RLS)                         │
└─────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────┐
│             External APIs                           │
│  - Google Places API (Autocomplete, Details)        │
└─────────────────────────────────────────────────────┘
```

## 📦 Teknoloji Stack

### Frontend

| Teknoloji | Versiyon | Amaç |
|-----------|----------|------|
| **Next.js** | 16.0.2 | React framework, SSR, routing |
| **React** | 19.2.0 | UI kütüphanesi |
| **TypeScript** | 5.x | Tip güvenliği |
| **Tailwind CSS** | 4.x | Utility-first CSS |
| **shadcn/ui** | - | UI component kütüphanesi |
| **TanStack Query** | 5.90.8 | Server state management |
| **Zustand** | 5.0.8 | Client state management |
| **Framer Motion** | 12.23.24 | Animasyonlar |
| **React Hook Form** | 7.66.1 | Form yönetimi |
| **Zod** | 4.1.12 | Schema validation |
| **@dnd-kit** | - | Drag & drop |
| **next-themes** | 0.4.6 | Dark mode |
| **Sonner** | - | Toast notifications |

### Backend & Database

| Teknoloji | Amaç |
|-----------|------|
| **Supabase** | Backend-as-a-Service |
| **PostgreSQL** | İlişkisel veritabanı |
| **Supabase Auth** | Kimlik doğrulama |
| **Supabase Storage** | Dosya depolama (gelecek) |

### External APIs

| API | Amaç |
|-----|------|
| **Google Places API** | Mekan arama ve detayları |

## 📁 Proje Yapısı

```
local-flavours/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group
│   │   ├── auth/
│   │   │   ├── callback/  # OAuth callback
│   │   │   └── error/     # Auth errors
│   ├── (main)/            # Ana uygulama
│   │   ├── collections/[slug]/  # Koleksiyon detay sayfası
│   │   ├── categories/[slug]/   # Kategori sayfası
│   │   ├── places/[slug]/       # Mekan detay sayfası
│   │   ├── turkey/[city]/       # Şehir sayfaları
│   │   ├── profile/[username]/  # Kullanıcı profili
│   │   ├── my-collections/      # Kullanıcı koleksiyonları
│   │   ├── favorites/           # Favoriler
│   │   ├── settings/            # Ayarlar
│   │   └── page.tsx             # Ana sayfa
│   ├── admin/             # Admin paneli
│   │   ├── places/
│   │   ├── locations/
│   │   ├── categories/
│   │   └── collections/
│   ├── api/               # API routes
│   │   └── places/
│   │       ├── search/    # Google Places proxy
│   │       └── details/   # Place details
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   ├── sitemap.ts         # Dynamic sitemap
│   └── robots.ts          # Robots.txt
│
├── components/             # React bileşenleri
│   ├── admin/             # Admin bileşenleri
│   ├── auth/              # Auth modalleri
│   ├── collections/       # Koleksiyon bileşenleri
│   ├── home/              # Ana sayfa bileşenleri
│   ├── layout/            # Layout bileşenleri
│   ├── leaderboard/       # Liderlik tablosu
│   ├── places/            # Mekan bileşenleri
│   ├── profile/           # Profil bileşenleri
│   ├── providers/         # Context provider'lar
│   ├── seo/               # SEO bileşenleri
│   └── ui/                # shadcn/ui bileşenleri
│
├── lib/                   # Core iş mantığı
│   ├── api/               # API fonksiyonları
│   │   ├── auth.ts        # Auth işlemleri
│   │   ├── collections.ts # Koleksiyon CRUD
│   │   ├── places.ts      # Mekan CRUD
│   │   ├── categories.ts  # Kategori işlemleri
│   │   ├── locations.ts   # Konum işlemleri
│   │   └── rate-limiter.ts # Rate limiting
│   ├── contexts/          # React contexts
│   │   └── auth-context.tsx
│   ├── hooks/             # Custom hooks
│   │   ├── use-auth-query.ts
│   │   ├── use-categories.ts
│   │   └── use-locations.ts
│   ├── supabase/          # Supabase clients
│   │   ├── client.ts      # Browser client (singleton)
│   │   ├── server.ts      # Server client
│   │   └── middleware.ts  # Middleware client
│   ├── validations/       # Zod schemas
│   │   ├── collection.ts
│   │   └── place.ts
│   └── utils.ts           # Utility fonksiyonlar
│
├── supabase/              # Supabase migration'ları
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 003_collections_schema.sql
│       ├── 004_auth_setup.sql
│       └── ...
│
├── types/                 # TypeScript tipleri
│   └── database.ts        # Supabase generated types
│
├── hooks/                 # Root-level hooks
│   ├── use-alert-dialog.tsx
│   └── use-toast.ts
│
├── scripts/               # Utility scripts
│   └── seed-database.ts
│
├── public/                # Statik dosyalar
│
├── middleware.ts          # Next.js middleware
├── next.config.ts         # Next.js config
├── tailwind.config.ts     # Tailwind config
├── tsconfig.json          # TypeScript config
└── package.json           # Dependencies
```

## 🔄 Veri Akışı

### 1. Server Component Veri Akışı (SSR)

```typescript
// app/collections/[slug]/page.tsx
export default async function CollectionPage({ params }) {
  // Server'da direkt DB'ye erişim
  const supabase = await createClient();
  const { data: collection } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', params.slug)
    .single();

  // Server component olarak render
  return <CollectionDetail collection={collection} />;
}
```

**Avantajlar:**
- SEO dostu (HTML server'da oluşur)
- İlk yükleme hızlı
- JavaScript yükü azalır

### 2. Client Component Veri Akışı (TanStack Query)

```typescript
// components/collections/collection-feed.tsx
'use client';

function CollectionFeed() {
  const { data, isLoading } = useQuery({
    queryKey: ['collections', { featured: true }],
    queryFn: () => getCollections({ featured: true })
  });

  if (isLoading) return <Skeleton />;
  return <CollectionCards collections={data} />;
}
```

**TanStack Query Özellikleri:**
- Otomatik caching
- Background refetching
- Optimistic updates
- Loading/error states

### 3. Mutation Akışı (Create/Update/Delete)

```typescript
const mutation = useMutation({
  mutationFn: (data) => createCollection(data),
  onMutate: async (newCollection) => {
    // Optimistic update
    await queryClient.cancelQueries(['collections']);
    const previous = queryClient.getQueryData(['collections']);
    queryClient.setQueryData(['collections'], (old) => [...old, newCollection]);
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback
    queryClient.setQueryData(['collections'], context.previous);
  },
  onSuccess: () => {
    // Cache invalidation
    queryClient.invalidateQueries(['collections']);
  }
});
```

## 🔐 Kimlik Doğrulama Mimarisi

### Auth Flow

```
┌─────────────────────────────────────────────────────┐
│           1. Kullanıcı login formu doldurur         │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│      2. signInWithEmail() → Supabase Auth           │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  3. Supabase cookie'lere session kaydeder (PKCE)    │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│    4. AuthContext state'i günceller (React Query)   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│       5. Middleware her request'te session check    │
└─────────────────────────────────────────────────────┘
```

### Supabase Client Stratejisi

**1. Browser Client (Singleton)**
```typescript
// lib/supabase/client.ts
let client: SupabaseClient | undefined;

export function createBrowserClient() {
  if (client) return client;

  client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true
      }
    }
  );

  return client;
}
```

**2. Server Client (Per-Request)**
```typescript
// lib/supabase/server.ts
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set(name, value, options),
        remove: (name, options) => cookieStore.delete(name)
      }
    }
  );
}
```

### Middleware Koruma

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes kontrolü
  if (!session && protectedPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/?auth=login', request.url));
  }

  // Admin routes kontrolü
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}
```

## 🎨 UI/UX Patterns

### Component Composition Pattern

shadcn/ui compound component pattern:

```typescript
<Card>
  <CardHeader>
    <CardTitle>Başlık</CardTitle>
    <CardDescription>Açıklama</CardDescription>
  </CardHeader>
  <CardContent>
    İçerik
  </CardContent>
  <CardFooter>
    <Button>Aksiyon</Button>
  </CardFooter>
</Card>
```

### Form Pattern (React Hook Form + Zod)

```typescript
// 1. Schema tanımla
const schema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email()
});

// 2. Form hook
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: '', email: '' }
});

// 3. Submit handler
const onSubmit = form.handleSubmit(async (data) => {
  await createCollection(data);
});

// 4. Form UI
<Form {...form}>
  <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel>İsim</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

## 🌍 Çoklu Dil Desteği

### JSONB Pattern

Veritabanında:
```sql
CREATE TABLE places (
  names JSONB NOT NULL DEFAULT '{"en": "", "tr": ""}'::jsonb,
  descriptions JSONB
);
```

TypeScript'te:
```typescript
type MultilingualContent = {
  en: string;
  tr: string;
};

interface Place {
  names: MultilingualContent;
  descriptions?: MultilingualContent;
}
```

Kullanım:
```typescript
const place = {
  names: {
    en: "The Best Kebab",
    tr: "En İyi Kebap"
  }
};

// Runtime dil seçimi
const displayName = place.names[currentLocale];
```

## 🚀 Performans Optimizasyonları

### 1. Server Components ile Bundle Azaltma
- Layout ve statik componentler Server Component
- Sadece interaktif kısımlar Client Component

### 2. TanStack Query ile Caching
- 5 dakika default cache time
- Background refetch
- Stale-while-revalidate stratejisi

### 3. Image Optimization
- Next.js Image component
- Lazy loading
- Responsive images

### 4. Code Splitting
- Route-based splitting (Next.js otomatik)
- Dynamic imports ağır componentler için

### 5. Database Optimizasyonları
- Index'ler kritik query'lerde
- Materialized path location hiyerarşisi için
- Computed columns (vote_score, rank)

## 🔒 Güvenlik

### 1. Row Level Security (RLS)
Supabase'de tablo seviyesinde erişim kontrolü.

### 2. Zod Validation
Hem client hem server-side validation.

### 3. Rate Limiting
Google Places API için rate limiter.

### 4. PKCE Flow
Modern OAuth flow, CSRF koruması.

### 5. Environment Variables
Hassas bilgiler .env.local'de.
