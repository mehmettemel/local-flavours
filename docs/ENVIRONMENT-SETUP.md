# Environment Setup Guide

Bu rehber, lokal development ve production ortamları arasındaki ayrımı nasıl yapacağınızı gösterir.

## 📋 İçindekiler

1. [Ortam Türleri](#ortam-türleri)
2. [Lokal Development Setup](#lokal-development-setup)
3. [Production Setup](#production-setup)
4. [Database Seed İşlemleri](#database-seed-işlemleri)
5. [Deployment](#deployment)

---

## Ortam Türleri

### 🔵 Development (Lokal)
- **Amaç**: Geliştirme ve test
- **Database**: Development Supabase projesi
- **URL**: `http://localhost:3001`
- **Env File**: `.env.local`

### 🟢 Production (Canlı)
- **Amaç**: Gerçek kullanıcılar için canlı site
- **Database**: Production Supabase projesi
- **URL**: `https://your-domain.com`
- **Env File**: `.env.production` (sadece seed işlemleri için)

---

## Lokal Development Setup

### 1. Environment Dosyası Oluştur

```bash
# .env.example'ı kopyala
cp .env.example .env.local
```

### 2. Development Credentials'ları Ekle

`.env.local` dosyasını düzenle:

```env
# Supabase Configuration (Development)
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-dev-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
```

**Credentials'ları nereden bulabilirsin?**
1. https://supabase.com/dashboard
2. **Development** projenizi seçin
3. Settings > API
4. `URL`, `anon public` key ve `service_role` key'ini kopyala

### 3. Database'i Seed Et

```bash
# Development database'ini seed et
npm run seed
```

### 4. Development Server'ı Başlat

```bash
npm run dev
```

✅ Site şurada açılacak: http://localhost:3001

---

## Production Setup

### ⚠️ ÖNEMLİ UYARILAR

- Production database'e **çok dikkatli** yaklaş!
- İşlem öncesi mutlaka **backup** al
- İlk önce development'ta test et
- `.env.production` dosyasını **asla** git'e commit etme

### 1. Production Environment Dosyası Oluştur

```bash
# .env.example'ı kopyala
cp .env.example .env.production
```

### 2. Production Credentials'ları Ekle

`.env.production` dosyasını düzenle:

```env
# Supabase Configuration (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-prod-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### 3. .gitignore Kontrolü

`.gitignore` dosyasında şunun olduğundan emin ol:

```
# env files
.env*
```

✅ Zaten varsayılan olarak var, ancak kontrol et.

---

## Database Seed İşlemleri

### 🔵 Development Database Seed

Development database'ini seed etmek için:

```bash
# .env.local kullanılır (otomatik)
npm run seed
```

Bu komut şunları yapar:
- 5 ana kategori + 22 alt kategori ekler
- 81 Türk ili ekler
- İstanbul'un 3 ilçesini ekler
- Eski kategorileri temizler

### 🟢 Production Database Seed

Production database'ini seed etmek için **3 yöntem** var:

#### Yöntem 1: Otomatik Script (ÖNERİLEN)

```bash
# Interactive (onay sorar)
DOTENV_CONFIG_PATH=.env.production npm run seed:production

# Veya direkt
DOTENV_CONFIG_PATH=.env.production npm run seed
```

**Avantajları:**
- ✅ Onay isteyerek güvenli
- ✅ Otomatik cleanup
- ✅ Progress gösterir

#### Yöntem 2: Manuel SQL (EN GÜVENLİ)

1. `scripts/production-seed.sql` dosyasını aç
2. Supabase Dashboard > SQL Editor'e git
3. **Production** projeyi seç
4. SQL'i kopyala-yapıştır ve çalıştır

**Avantajları:**
- ✅ En güvenli (manual kontrol)
- ✅ Adım adım görürsün
- ✅ Supabase Dashboard'da çalışır

#### Yöntem 3: CI/CD Pipeline

GitHub Actions ile otomatik:

```yaml
# .github/workflows/seed-production.yml
name: Seed Production Database

on:
  workflow_dispatch: # Manuel trigger

jobs:
  seed:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - name: Seed Production
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.PROD_SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.PROD_SERVICE_KEY }}
        run: npm run seed
```

---

## Deployment

### Vercel (Next.js için önerilen)

#### 1. Vercel CLI Kurulumu

```bash
npm i -g vercel
```

#### 2. İlk Deployment

```bash
# Login
vercel login

# Deploy
vercel

# Production'a deploy
vercel --prod
```

#### 3. Environment Variables Ekle

Vercel Dashboard'da veya CLI ile:

```bash
# Production env vars ekle
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_APP_URL production
```

**Önemli:**
- ✅ `NEXT_PUBLIC_*` değişkenleri client-side'da görünür
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` sadece server-side kullanılmalı

#### 4. Sürekli Deployment

Git push ile otomatik deploy:

```bash
git add .
git commit -m "feat: update categories"
git push origin main

# Vercel otomatik deploy edecek
```

### Supabase Production Ayarları

Production Supabase projesinde:

1. **Authentication > URL Configuration**
   - Site URL: `https://your-domain.com`
   - Redirect URLs:
     - `https://your-domain.com/auth/callback`
     - `https://your-domain.com/**`

2. **Authentication > Email Templates**
   - Confirm signup template'ini özelleştir
   - Email sender'ı ayarla

3. **Database > Backups**
   - Otomatik backup'ları aktif et
   - Manuel backup al (önemli değişiklikler öncesi)

---

## Hızlı Komut Referansı

```bash
# ========== DEVELOPMENT ==========

# Geliştirme sunucusu
npm run dev

# Database seed (dev)
npm run seed

# Demo collections ekle
npm run seed:demo

# ========== PRODUCTION ==========

# Production seed (interactive)
DOTENV_CONFIG_PATH=.env.production npm run seed:production

# Production seed (direct)
DOTENV_CONFIG_PATH=.env.production npm run seed

# Production deploy
vercel --prod

# ========== BUILD ==========

# Production build test
npm run build
npm run start
```

---

## Sorun Giderme

### "Missing environment variables" Hatası

**Çözüm:**
```bash
# .env.local veya .env.production dosyasının varlığını kontrol et
ls -la .env*

# Dosya içeriğini kontrol et (credentials görünmemeli)
cat .env.local | grep "SUPABASE_URL"
```

### Production Seed Çalışmıyor

**Çözüm:**
```bash
# .env.production'ın doğru yolda olduğundan emin ol
ls -la .env.production

# DOTENV_CONFIG_PATH belirt
DOTENV_CONFIG_PATH=.env.production npm run seed
```

### Vercel Deployment'ta Env Vars Görünmüyor

**Çözüm:**
1. Vercel Dashboard > Project > Settings > Environment Variables
2. Tüm değişkenlerin eklendiğinden emin ol
3. Re-deploy et:
   ```bash
   vercel --prod --force
   ```

### Database Connection Hatası

**Çözüm:**
1. Supabase Dashboard > Project Settings > API
2. Credentials'ların doğru olduğunu kontrol et
3. Service role key kullandığından emin ol (anon key değil!)

---

## Güvenlik Kontrol Listesi

### ✅ Development
- [x] `.env.local` git'te ignore ediliyor
- [x] Development database ayrı bir Supabase projesi
- [x] Test verileri ile çalışıyorsun

### ✅ Production
- [x] `.env.production` git'te ignore ediliyor
- [x] Production credentials güvende
- [x] Backup aldın (seed öncesi)
- [x] Service role key sadece server-side kullanılıyor
- [x] Vercel env vars doğru ayarlandı
- [x] Supabase redirect URLs production domain içeriyor

---

## Önerilen İş Akışı

### Yeni Özellik Geliştirme

1. **Development'ta geliştir**
   ```bash
   npm run dev
   ```

2. **Development'ta test et**
   - Yeni özelliği test et
   - Database değişikliklerini kontrol et

3. **Production'a hazırla**
   ```bash
   npm run build
   npm run start
   # Production build'i test et
   ```

4. **Git commit & push**
   ```bash
   git add .
   git commit -m "feat: new feature"
   git push origin main
   ```

5. **Vercel otomatik deploy eder**
   - Build logs'u kontrol et
   - Production site'ı test et

6. **Production database güncelleme (gerekirse)**
   ```bash
   # Backup al önce!
   DOTENV_CONFIG_PATH=.env.production npm run seed
   ```

### Database Schema Değişiklikleri

1. **Development'ta migration oluştur**
   - Supabase Dashboard (Dev) > SQL Editor
   - SQL migration'ı çalıştır

2. **Test et**
   - App'i test et
   - Data bütünlüğünü kontrol et

3. **Production migration**
   - **Backup al!**
   - Supabase Dashboard (Prod) > SQL Editor
   - Aynı migration'ı çalıştır

4. **Verify**
   - Production app'i test et
   - Hata logs'ları kontrol et

---

## Yardım ve Destek

- **Dokümantasyon**: `/docs` klasörü
- **Issues**: GitHub Issues
- **Supabase Docs**: https://supabase.com/docs

---

**Son Güncelleme**: 2025-01-19
