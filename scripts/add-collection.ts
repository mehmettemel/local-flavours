// @ts-nocheck
// Polyfill for Node.js < 18
if (typeof globalThis.Headers === 'undefined') {
  globalThis.Headers = class Headers {
    private headers: Map<string, string> = new Map();
    constructor(init?: HeadersInit) {
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.set(key, value));
        } else if (init instanceof Headers) {
          init.forEach((value, key) => this.set(key, value));
        } else {
          Object.entries(init).forEach(([key, value]) => this.set(key, value));
        }
      }
    }
    get(name: string) {
      return this.headers.get(name.toLowerCase()) || null;
    }
    set(name: string, value: string) {
      this.headers.set(name.toLowerCase(), value);
    }
    has(name: string) {
      return this.headers.has(name.toLowerCase());
    }
    delete(name: string) {
      this.headers.delete(name.toLowerCase());
    }
    forEach(callback: (value: string, key: string) => void) {
      this.headers.forEach(callback);
    }
  } as any;
}

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// Helper function to create slug from Turkish text
function createSlug(name: string): string {
  return name
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * ÖRNEK KOLEKSIYON: Adana'daki En İyi Dönerciler
 *
 * Bu scripti kopyalayıp istediğiniz koleksiyonu oluşturabilirsiniz.
 *
 * KULLANIM:
 * 1. USER_ID'yi kendi kullanıcı ID'niz ile değiştirin (veya script'i Supabase'den otomatik alacak)
 * 2. Mekanları düzenleyin (isim, adres, koordinat, vs.)
 * 3. Koleksiyon bilgilerini düzenleyin
 * 4. Çalıştırın: npm run add-collection
 */

// KULLANICI ID'NİZİ BURAYA YAZIN (opsiyonel, boş bırakırsanız ilk admin kullanıcı kullanılır)
const USER_ID = process.env.USER_ID || '';

// ==============================================
// KOLEKSIYON BİLGİLERİ
// ==============================================
const COLLECTION_DATA = {
  // Koleksiyon adı (Türkçe)
  name: "Adana'daki En İyi Dönerciler",

  // Açıklama (opsiyonel)
  description: "Adana'nın en lezzetli ve kaliteli dönerlerini bulabileceğiniz mekanlar. Hem kebapçı usulü, hem de Bursa tipi döner seçenekleriyle.",

  // Şehir slug'ı (locations tablosundan)
  citySlug: 'adana',

  // Kategori slug'ı (categories tablosundan)
  categorySlug: 'doner',

  // Etiketler (opsiyonel)
  tags: ['adana', 'döner', 'et yemekleri', 'hızlı servis'],

  // Öne çıkan koleksiyon olsun mu?
  isFeatured: false,
};

// ==============================================
// MEKANLAR (PLACES)
// ==============================================
const PLACES = [
  {
    name: 'Öz Adana Döner Salonu',
    description: 'Adana\'nın en köklü dönerci ustalarından. Kebapçı usulü döneri ile meşhur.',
    address: 'Kurtuluş Mahallesi, İnönü Cd. No:45, 01130 Seyhan/Adana',
    phone: '+90 322 363 1234',
    latitude: 37.0,
    longitude: 35.3213,
    googleMapsUrl: 'https://maps.google.com/?q=37.0,35.3213',
    website: '',
    curatorNote: 'Kebapçı usulü döneri mutlaka deneyin. Öğlen saatlerinde çok kalabalık olabiliyor.',
    famousItems: ['Kebapçı Usulü Döner', 'Acılı Ezme', 'Şalgam'],
  },
  {
    name: 'Mavi Döner',
    description: 'Modern bir döner konsepti. Hem Bursa hem de Adana usulü döner çeşitleri mevcut.',
    address: 'Çınarlı Mahallesi, Atatürk Caddesi No:128, 01120 Seyhan/Adana',
    phone: '+90 322 455 6789',
    latitude: 37.0052,
    longitude: 35.3281,
    googleMapsUrl: 'https://maps.google.com/?q=37.0052,35.3281',
    website: '',
    curatorNote: 'Temizlik ve hijyen konusunda çok titizler. Porsiyon bol.',
    famousItems: ['Bursa Döneri', 'İskender', 'Pilav Üstü Döner'],
  },
  {
    name: 'Hasan Usta Döner',
    description: 'Adana\'nın en eski döner dükkanlarından. 1985\'ten beri hizmet veriyor.',
    address: 'Ziyapaşa Bulvarı, No:234, 01160 Çukurova/Adana',
    phone: '+90 322 233 4567',
    latitude: 36.9917,
    longitude: 35.3189,
    googleMapsUrl: 'https://maps.google.com/?q=36.9917,35.3189',
    website: '',
    curatorNote: 'Nostaljik atmosferi var. Fiyatları uygun.',
    famousItems: ['Döner Dürüm', 'Döner Porsiyon', 'Ayran'],
  },
  {
    name: 'Yeni Döner Evi',
    description: 'Genç nesil dönerci. Sosyal medyada çok popüler, özellikle gençler arasında.',
    address: 'Reşatbey Mahallesi, 61017 Sokak No:12, 01120 Seyhan/Adana',
    phone: '+90 322 352 9876',
    latitude: 37.0089,
    longitude: 35.3356,
    googleMapsUrl: 'https://maps.google.com/?q=37.0089,35.3356',
    website: 'https://yenidonerevi.com',
    curatorNote: 'Instagram\'dan sipariş verebilirsiniz. Paket servisi çok hızlı.',
    famousItems: ['Special Döner', 'Kaşarlı Döner', 'Atom'],
  },
  {
    name: 'Cihan Döner',
    description: 'Adana\'da et kalitesi konusunda en ünlü mekanlardan. Sadece dana eti kullanılıyor.',
    address: 'Güzelyalı Mahallesi, Fuzuli Caddesi No:89, 01170 Çukurova/Adana',
    phone: '+90 322 247 1357',
    latitude: 36.9845,
    longitude: 35.3078,
    googleMapsUrl: 'https://maps.google.com/?q=36.9845,35.3078',
    website: '',
    curatorNote: 'Biraz pahalı ama kalitesi tartışılmaz. Dana döner harika.',
    famousItems: ['Dana Döner', 'Antep Usulü Döner', 'Patlıcan Salatası'],
  },
];

// ==============================================
// ANA FONKSİYON
// ==============================================
async function addCollection() {
  console.log('🚀 Koleksiyon ekleme başlıyor...\n');

  try {
    // 1. Kullanıcı ID'sini bul
    let userId = USER_ID;
    if (!userId) {
      console.log('📝 Kullanıcı ID bulunamadı, ilk admin kullanıcıyı buluyorum...');
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .limit(1);

      if (!users || users.length === 0) {
        // Admin yoksa herhangi bir user
        const { data: anyUser } = await supabase
          .from('users')
          .select('id')
          .limit(1);

        if (!anyUser || anyUser.length === 0) {
          throw new Error('Hiç kullanıcı bulunamadı! Önce bir kullanıcı oluşturun.');
        }
        userId = anyUser[0].id;
      } else {
        userId = users[0].id;
      }
      console.log(`  ✅ Kullanıcı bulundu: ${userId}`);
    }

    // 2. Şehri bul
    console.log(`\n🌍 ${COLLECTION_DATA.citySlug} şehri aranıyor...`);
    const { data: city, error: cityError } = await supabase
      .from('locations')
      .select('id, slug, names')
      .eq('slug', COLLECTION_DATA.citySlug)
      .eq('type', 'city')
      .single();

    if (cityError || !city) {
      throw new Error(`Şehir bulunamadı: ${COLLECTION_DATA.citySlug}`);
    }
    console.log(`  ✅ Şehir bulundu: ${city.names.tr} (${city.id})`);

    // 3. Kategoriyi bul
    console.log(`\n📂 ${COLLECTION_DATA.categorySlug} kategorisi aranıyor...`);
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, slug, names')
      .eq('slug', COLLECTION_DATA.categorySlug)
      .single();

    if (categoryError || !category) {
      throw new Error(`Kategori bulunamadı: ${COLLECTION_DATA.categorySlug}`);
    }
    console.log(`  ✅ Kategori bulundu: ${category.names.tr} (${category.id})`);

    // 4. Mekanları ekle
    console.log('\n📍 Mekanlar ekleniyor...');
    const placeIds: string[] = [];

    for (let i = 0; i < PLACES.length; i++) {
      const place = PLACES[i];
      const placeSlug = createSlug(place.name);

      // Mekan zaten var mı kontrol et
      const { data: existingPlace } = await supabase
        .from('places')
        .select('id')
        .eq('slug', placeSlug)
        .single();

      if (existingPlace) {
        console.log(`  ⚠️  ${place.name} zaten mevcut, atlanıyor...`);
        placeIds.push(existingPlace.id);
        continue;
      }

      // Yeni mekan ekle
      const { data: newPlace, error: placeError } = await supabase
        .from('places')
        .insert({
          location_id: city.id,
          category_id: category.id,
          slug: placeSlug,
          names: { tr: place.name },
          descriptions: place.description ? { tr: place.description } : null,
          address: place.address,
          phone: place.phone || null,
          website: place.website || null,
          google_maps_url: place.googleMapsUrl || null,
          latitude: place.latitude,
          longitude: place.longitude,
          status: 'approved', // Otomatik onaylı
          submitted_by: userId,
          approved_by: userId,
          approved_at: new Date().toISOString(),
        } as any)
        .select('id')
        .single();

      if (placeError) {
        console.error(`  ❌ Mekan eklenirken hata: ${place.name}`, placeError);
        continue;
      }

      placeIds.push(newPlace.id);
      console.log(`  ✅ ${place.name} eklendi (${i + 1}/${PLACES.length})`);
    }

    if (placeIds.length === 0) {
      throw new Error('Hiç mekan eklenemedi!');
    }

    // 5. Koleksiyonu oluştur
    console.log('\n📦 Koleksiyon oluşturuluyor...');
    const collectionSlug = createSlug(COLLECTION_DATA.name);

    // Koleksiyon zaten var mı kontrol et
    const { data: existingCollection } = await supabase
      .from('collections')
      .select('id')
      .eq('slug', collectionSlug)
      .single();

    if (existingCollection) {
      console.log(`  ⚠️  "${COLLECTION_DATA.name}" koleksiyonu zaten mevcut!`);
      console.log(`  💡 Mevcut koleksiyonu kullanarak devam ediyorum...`);

      // Mevcut koleksiyona mekanları ekle
      console.log('\n🔗 Mekanlar koleksiyona ekleniyor...');
      for (let i = 0; i < placeIds.length; i++) {
        const placeId = placeIds[i];
        const place = PLACES[i];

        // Bu mekan koleksiyonda var mı?
        const { data: existingLink } = await supabase
          .from('collection_places')
          .select('id')
          .eq('collection_id', existingCollection.id)
          .eq('place_id', placeId)
          .single();

        if (existingLink) {
          console.log(`  ⚠️  Mekan zaten koleksiyonda: ${place.name}`);
          continue;
        }

        const { error: linkError } = await supabase
          .from('collection_places')
          .insert({
            collection_id: existingCollection.id,
            place_id: placeId,
            display_order: i + 1,
            curator_note: place.curatorNote || null,
            famous_items: place.famousItems || null,
          } as any);

        if (linkError) {
          console.error(`  ❌ Mekan eklenirken hata:`, linkError);
          continue;
        }

        console.log(`  ✅ ${place.name} koleksiyona eklendi`);
      }

      console.log('\n✨ İşlem tamamlandı!');
      process.exit(0);
    }

    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .insert({
        slug: collectionSlug,
        names: { tr: COLLECTION_DATA.name },
        descriptions: COLLECTION_DATA.description ? { tr: COLLECTION_DATA.description } : null,
        creator_id: userId,
        location_id: city.id,
        category_id: category.id,
        status: 'active',
        tags: COLLECTION_DATA.tags || [],
        is_featured: COLLECTION_DATA.isFeatured || false,
      } as any)
      .select('id, slug')
      .single();

    if (collectionError) {
      throw collectionError;
    }

    console.log(`  ✅ Koleksiyon oluşturuldu: ${COLLECTION_DATA.name}`);
    console.log(`     Slug: ${collection.slug}`);
    console.log(`     ID: ${collection.id}`);

    // 6. Mekanları koleksiyona ekle
    console.log('\n🔗 Mekanlar koleksiyona bağlanıyor...');
    for (let i = 0; i < placeIds.length; i++) {
      const placeId = placeIds[i];
      const place = PLACES[i];

      const { error: linkError } = await supabase
        .from('collection_places')
        .insert({
          collection_id: collection.id,
          place_id: placeId,
          display_order: i + 1,
          curator_note: place.curatorNote || null,
          famous_items: place.famousItems || null,
        } as any);

      if (linkError) {
        console.error(`  ❌ Bağlantı hatası:`, linkError);
        continue;
      }

      console.log(`  ✅ ${place.name} bağlandı (${i + 1}/${placeIds.length})`);
    }

    // 7. Özet
    console.log('\n' + '='.repeat(50));
    console.log('🎉 BAŞARIYLA TAMAMLANDI!');
    console.log('='.repeat(50));
    console.log(`\n📦 Koleksiyon: ${COLLECTION_DATA.name}`);
    console.log(`🏙️  Şehir: ${city.names.tr}`);
    console.log(`📂 Kategori: ${category.names.tr}`);
    console.log(`📍 Mekan Sayısı: ${placeIds.length}`);
    console.log(`\n🔗 Koleksiyonu görüntüle:`);
    console.log(`   /${city.slug}/${category.slug}/${collection.slug}`);
    console.log('\n' + '='.repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ HATA:', error);
    process.exit(1);
  }
}

// Scripti çalıştır
if (require.main === module) {
  addCollection()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
