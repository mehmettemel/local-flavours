# 📦 Koleksiyon Ekleme Rehberi

Bu rehber, `add-collection.ts` scriptini kullanarak kendi koleksiyonlarınızı nasıl ekleyeceğinizi gösterir.

## 🚀 Hızlı Başlangıç

### 1. Mevcut Örneği Çalıştırın

```bash
npm run add-collection
```

Bu komut **"Adana'daki En İyi Dönerciler"** koleksiyonunu ve 5 dönerciyi ekler.

### 2. Kendi Koleksiyonunuzu Oluşturun

#### Yöntem A: Mevcut Scripti Düzenleyin

`scripts/add-collection.ts` dosyasını açın ve şu bölümleri değiştirin:

```typescript
// KOLEKSIYON BİLGİLERİ
const COLLECTION_DATA = {
  name: "İstanbul'daki En İyi Kahve Dükkanları",  // ✏️ Değiştir
  description: "...",                              // ✏️ Değiştir
  citySlug: 'istanbul',                            // ✏️ Değiştir
  categorySlug: 'nitelikli-kahve',                // ✏️ Değiştir
  tags: ['istanbul', 'kahve', 'specialty'],       // ✏️ Değiştir
  isFeatured: false,
};

// MEKANLAR
const PLACES = [
  {
    name: 'Kronotrop',                            // ✏️ Değiştir
    description: '...',
    address: '...',
    phone: '+90 ...',
    latitude: 41.0082,                            // ✏️ Değiştir
    longitude: 28.9784,                           // ✏️ Değiştir
    curatorNote: '...',                           // ✏️ Opsiyonel
    famousItems: ['V60', 'Espresso', 'Soğuk Demleme'], // ✏️ Opsiyonel
  },
  // ... daha fazla mekan
];
```

#### Yöntem B: Yeni Script Oluşturun

```bash
# Script dosyasını kopyalayın
cp scripts/add-collection.ts scripts/add-my-collection.ts

# Yeni scripti package.json'a ekleyin
# "add-my-collection": "tsx scripts/add-my-collection.ts"

# Çalıştırın
npm run add-my-collection
```

## 📋 Gerekli Bilgiler

### Şehir Slug'ları (citySlug)

Tüm 81 il database'de mevcut. Slug formatı:

```
İstanbul → istanbul
İzmir → izmir
Adana → adana
Şanlıurfa → sanliurfa
Afyonkarahisar → afyonkarahisar
```

### Kategori Slug'ları (categorySlug)

Mevcut kategoriler:

```javascript
'kebap-ocakbasi'      // Kebap & Ocakbaşı
'esnaf-lokantasi'     // Esnaf Lokantası
'doner'               // Döner
'pide-lahmacun'       // Pide & Lahmacun
'burger'              // Burger
'sokak-lezzetleri'    // Sokak Lezzetleri
'corbaci'             // Çorbacı
'kahvalti'            // Kahvaltı & Börek
'balik-deniz'         // Balık & Deniz Ürünleri
'dunya-mutfagi'       // Dünya Mutfağı
'nitelikli-kahve'     // Nitelikli Kahve
'turk-kahvesi'        // Türk Kahvesi & Çay
'kitap-kafe'          // Kitap Kafe
'calisma-dostu'       // Çalışma Dostu
'pub'                 // Pub & Bar
'meyhane'             // Meyhane
'sarap-evi'           // Şarap Evi
'kokteyl-bar'         // Kokteyl Bar
'baklava-serbetli'    // Baklava & Şerbetli
'pastane'             // Pastane & Fırın
'dondurma'            // Dondurma
'cikolata'            // Çikolatacı
'genel'               // Genel / Diğer
```

### Koordinat Bulma

Google Maps'ten koordinat almak için:

1. Google Maps'te mekanı bulun
2. Mekana sağ tıklayın
3. En üstteki koordinatlara tıklayın (otomatik kopyalanır)
4. Format: `41.0082, 28.9784` (latitude, longitude)

## 🔐 Kullanıcı ID (Opsiyonel)

Script otomatik olarak ilk admin kullanıcıyı bulur. Kendiniz belirtmek isterseniz:

```bash
USER_ID=your-user-id-here npm run add-collection
```

Veya `.env.local` dosyasına ekleyin:

```env
USER_ID=your-user-id-here
```

## 📝 Tam Örnek: İzmir'deki En İyi Kokteyl Barları

```typescript
const COLLECTION_DATA = {
  name: "İzmir'deki En İyi Kokteyl Barları",
  description: "İzmir'de unutulmaz kokteyl deneyimleri yaşayabileceğiniz en iyi barlar.",
  citySlug: 'izmir',
  categorySlug: 'kokteyl-bar',
  tags: ['izmir', 'kokteyl', 'bar', 'gece hayatı'],
  isFeatured: false,
};

const PLACES = [
  {
    name: 'Sakız Bar',
    description: 'Alsancak\'ta ünlü kokteyl barı. Deniz manzaralı teras.',
    address: 'Alsancak Mahallesi, 1482 Sokak No:12, 35220 Konak/İzmir',
    phone: '+90 232 421 1234',
    latitude: 38.4369,
    longitude: 27.1467,
    googleMapsUrl: 'https://maps.google.com/?q=38.4369,27.1467',
    website: 'https://sakizbar.com',
    curatorNote: 'Gin Tonic\'leri harika. Hafta sonu çok kalabalık.',
    famousItems: ['Signature Gin Tonic', 'Old Fashioned', 'Espresso Martini'],
  },
  {
    name: 'Taproom',
    description: 'Craft kokteyl odaklı modern bar.',
    address: 'Kıbrıs Şehitleri Caddesi No:45, 35230 Konak/İzmir',
    phone: '+90 232 489 5678',
    latitude: 38.4189,
    longitude: 27.1287,
    googleMapsUrl: 'https://maps.google.com/?q=38.4189,27.1287',
    curatorNote: 'Bartender\'lar çok deneyimli. Custom kokteyl yapıyorlar.',
    famousItems: ['Smoked Old Fashioned', 'İzmir Mule', 'Negroni'],
  },
  // ... daha fazla bar ekleyin
];
```

## ⚙️ Gelişmiş Özellikler

### Mekan Detayları

Her mekan için şu bilgileri ekleyebilirsiniz:

```typescript
{
  name: string,              // ZORUNLU - Mekan adı
  description?: string,      // Opsiyonel - Açıklama
  address: string,           // ZORUNLU - Adres
  phone?: string,            // Opsiyonel - Telefon (+90 başlasın)
  latitude: number,          // ZORUNLU - Enlem
  longitude: number,         // ZORUNLU - Boylam
  googleMapsUrl?: string,    // Opsiyonel - Google Maps linki
  website?: string,          // Opsiyonel - Web sitesi
  curatorNote?: string,      // Opsiyonel - Küratör notu (sizin yorumunuz)
  famousItems?: string[],    // Opsiyonel - Meşhur ürünler/yemekler
}
```

### Koleksiyon Özellikleri

```typescript
{
  name: string,              // ZORUNLU - Koleksiyon adı
  description?: string,      // Opsiyonel - Açıklama
  citySlug: string,          // ZORUNLU - Şehir slug'ı
  categorySlug: string,      // ZORUNLU - Kategori slug'ı
  tags?: string[],           // Opsiyonel - Etiketler
  isFeatured?: boolean,      // Opsiyonel - Öne çıkan mı? (default: false)
}
```

## 🐛 Hata Ayıklama

### "Şehir bulunamadı"

- `citySlug` değerinin doğru olduğundan emin olun
- Türkçe karakter kullanmayın (ş → s, ı → i, vs.)
- Database'de şehir olup olmadığını kontrol edin: `npm run seed`

### "Kategori bulunamadı"

- Yukarıdaki kategori listesinden birini seçin
- Slug formatına dikkat edin (tire ile ayrılmış, küçük harf)

### "Kullanıcı bulunamadı"

- Önce bir kullanıcı oluşturun (Supabase Auth ile)
- Veya `USER_ID` environment variable'ını set edin

### "Mekan zaten mevcut"

- Script mekanları slug'a göre kontrol eder
- Aynı isimde mekan varsa atlar, koleksiyona eklemeye devam eder

## 💡 İpuçları

1. **Koordinatları doğrulayın**: Yanlış koordinatlar haritada farklı yerde gösterir
2. **Telefon formatı**: `+90 5XX XXX XXXX` formatında olmalı
3. **Slug çakışması**: Aynı isimde iki mekan ekleyemezsiniz (farklı slug kullanın)
4. **Batch işlem**: Çok mekan ekliyorsanız, scripti birden fazla defa çalıştırabilirsiniz
5. **Test**: Önce 1-2 mekanla test edin, sonra tümünü ekleyin

## 🔄 Script Çıktısı

Başarılı çalıştırmada şöyle bir çıktı görmelisiniz:

```
🚀 Koleksiyon ekleme başlıyor...

📝 Kullanıcı ID bulunamadı, ilk admin kullanıcıyı buluyorum...
  ✅ Kullanıcı bulundu: abc123...

🌍 adana şehri aranıyor...
  ✅ Şehir bulundu: Adana (def456...)

📂 doner kategorisi aranıyor...
  ✅ Kategori bulundu: Döner (ghi789...)

📍 Mekanlar ekleniyor...
  ✅ Öz Adana Döner Salonu eklendi (1/5)
  ✅ Mavi Döner eklendi (2/5)
  ...

📦 Koleksiyon oluşturuluyor...
  ✅ Koleksiyon oluşturuldu: Adana'daki En İyi Dönerciler

🔗 Mekanlar koleksiyona bağlanıyor...
  ✅ Öz Adana Döner Salonu bağlandı (1/5)
  ...

==================================================
🎉 BAŞARIYLA TAMAMLANDI!
==================================================

📦 Koleksiyon: Adana'daki En İyi Dönerciler
🏙️  Şehir: Adana
📂 Kategori: Döner
📍 Mekan Sayısı: 5

🔗 Koleksiyonu görüntüle:
   /adana/doner/adanadaki-en-iyi-donerciler

==================================================
```

## 🤝 Yardım

Sorun yaşarsanız:

1. `.env.local` dosyasının doğru olduğundan emin olun
2. Database bağlantısını test edin: `npm run seed`
3. Hata mesajlarını okuyun (hangi aşamada hata verdi?)
4. Script'i adım adım debug edin

---

**Not**: Bu script service role key kullanır, bu yüzden güvenli tutun ve production'da dikkatli kullanın!
