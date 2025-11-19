# Quick Fix: Profile Fetch Hanging

## Problem
Console'da `🔄 [FETCH PROFILE] Fetching from database...` görüyor ve takılı kalıyorsunuz.

## Olası Sebepler

### 1. RLS (Row Level Security) Policy Eksik ⚠️ EN MUHTEMEL

**Belirti:**
- Query gönderiliyor ama cevap gelmiyor
- 10 saniye sonra timeout hatası

**Çözüm:**
Supabase Dashboard → SQL Editor → Aşağıdaki SQL'i çalıştırın:

```sql
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id);
```

### 2. Supabase URL Yanlış

**Kontrol:**
Console'da şunu görün:
```
🔄 [FETCH PROFILE] Supabase URL: https://xxx.supabase.co
```

**Eğer `undefined` ise:**
- `.env.local` dosyasında `NEXT_PUBLIC_SUPABASE_URL` var mı kontrol edin
- Vercel'de environment variable ekleyin
- Redeploy edin

### 3. Network Sorunu

**Kontrol:**
Tarayıcı DevTools → Network Tab
- `users` endpoint'ine request gidiyor mu?
- Status code ne? (401, 403, 500?)

### 4. Infinite Loop

**Belirti:**
Sürekli aynı log tekrarlanıyor

**Çözüm:**
useCallback dependency'lerini kontrol ettik, bu sorunu çözdük.

## Test Adımları

### Adım 1: RLS Policy'leri Kontrol Edin

Supabase Dashboard → SQL Editor:
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'users';
```

**Beklenen Sonuç:**
En az 2 policy görmeli siniz:
- "Users can view own profile" (SELECT)
- "Users can update own profile" (UPDATE)

### Adım 2: Manuel Test

Supabase Dashboard → SQL Editor:
```sql
-- Bu query çalışmalı (kendi user ID'nizi girin)
SELECT * FROM users WHERE id = 'your-user-id-here';
```

### Adım 3: Console Loglarını İnceleyin

Production'da F12 → Console:

**✅ Başarılı Durum:**
```
🔄 [FETCH PROFILE] Fetching from database...
🔄 [FETCH PROFILE] Supabase URL: https://xxx.supabase.co
🔄 [FETCH PROFILE] Query sent, waiting for response...
🔄 [FETCH PROFILE] Response received!
🔄 [FETCH PROFILE] Data: { username: "..." }
✅ [FETCH PROFILE] Success! Profile: your-username
```

**❌ Başarısız Durum (RLS Sorunu):**
```
🔄 [FETCH PROFILE] Fetching from database...
🔄 [FETCH PROFILE] Query sent, waiting for response...
(10 saniye bekleme)
❌ [FETCH PROFILE] Unexpected error: Profile fetch timeout after 10s
```

**❌ Başarısız Durum (Permission Sorunu):**
```
🔄 [FETCH PROFILE] Fetching from database...
🔄 [FETCH PROFILE] Response received!
🔄 [FETCH PROFILE] Error: { code: "42501", message: "permission denied" }
❌ [FETCH PROFILE] Error: permission denied
```

## Çözümler

### RLS Policy Eksikse:

1. Supabase Dashboard → SQL Editor
2. `supabase/check-rls-policies.sql` dosyasındaki SQL'i çalıştırın
3. Production'ı yenileyin
4. Test edin

### Permission Denied Hatası:

```sql
-- Tüm authenticated kullanıcılar profillerini görebilir
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

### Timeout Sorunu Devam Ediyorsa:

1. Network tab'ı kontrol edin
2. Supabase status page: https://status.supabase.com
3. API rate limit'e takılmış olabilir

## Hızlı Test

Console'da şunu çalıştırın:

```javascript
// Supabase client'ı test et
const { createClient } = await import('./lib/supabase/client');
const supabase = createClient();

// Session kontrolü
const { data: session } = await supabase.auth.getSession();
console.log('Session:', session);

// Profile fetch test
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', session.session.user.id)
  .single();

console.log('Data:', data);
console.log('Error:', error);
```

## Uygulama Yine de Çalışır

**Önemli Not:**
Profil fetch başarısız olsa bile:
- ✅ User authenticated olarak kalır
- ✅ Session korunur
- ✅ Logout çalışır
- ❌ Sadece kullanıcı adı görünmez

Yani kritik bir hata değil, ama düzeltilmesi gerekir.

## Son Çare: RLS'i Geçici Devre Dışı Bırak

**⚠️ SADECE TEST İÇİN - PRODUCTION'DA YAPMAYIN**

```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

Eğer bu çözüyorsa, kesinlikle RLS policy sorunu var demektir.
