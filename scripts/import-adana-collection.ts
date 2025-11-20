// scripts/import-adana-collection.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Ortam değişkenlerini yükle (.env.production)
dotenv.config({ path: '.env.production' });

// --- AYARLAR ---
const DATA_FILE = 'lib/data/adana-lezzetleri.json';
// ----------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  console.error(
    '❌ Hata: .env.production dosyasında NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY eksik.'
  );
  process.exit(1);
}

// Service Role ile admin yetkisinde client oluşturuyoruz
const supabase = createClient(supabaseUrl, serviceKey);

// Belirtilen kullanıcıyı kontrol et veya ilk kullanıcıyı al
async function getUserId(targetUserId?: string): Promise<string> {
  // Eğer bir kullanıcı ID'si belirtilmişse, önce onu kontrol et
  if (targetUserId) {
    // Önce profiles tablosuna bak
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', targetUserId)
      .single();

    if (profileData && !profileError) {
      console.log(`✅ Belirtilen kullanıcı profiles tablosunda bulundu: ${targetUserId}`);
      return profileData.id;
    }

    // Profiles'da yoksa auth.users'a bak
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(targetUserId);

    if (authData?.user && !authError) {
      console.log(`✅ Kullanıcı auth.users'da bulundu: ${targetUserId}`);
      console.log(`⚠️  Ancak profiles tablosunda yok. Kullanıcı ID'si yine de kullanılacak.`);
      return authData.user.id;
    }

    console.warn(`⚠️  Belirtilen kullanıcı ne profiles ne de auth.users'da bulunamadı: ${targetUserId}`);
  }

  // Belirtilen kullanıcı yoksa veya bulunamadıysa, ilk kullanıcıyı al
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error(
      '❌ Veritabanında hiç kullanıcı bulunamadı! Önce bir kullanıcı oluşturun.'
    );
  }

  console.log(`✅ İlk kullanıcı kullanılıyor: ${data.id}`);
  return data.id;
}

// Slug oluşturma fonksiyonu (Türkçe karakter uyumlu)
function generateSlug(text: string): string {
  const trMap: { [key: string]: string } = {
    ç: 'c',
    ğ: 'g',
    ı: 'i',
    İ: 'i',
    ö: 'o',
    ş: 's',
    ü: 'u',
    Ç: 'c',
    Ğ: 'g',
    Ö: 'o',
    Ş: 's',
    Ü: 'u',
  };
  return text
    .split('')
    .map((char) => trMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function importCollection() {
  console.log('🚀 Adana Lezzetleri import işlemi başlıyor...');

  // 1. Kullanıcı ID'sini Al
  const userId = await getUserId('a973355b-ffba-45d3-86eb-091f5b97ae2f');

  // 2. JSON Dosyasını Oku
  const jsonPath = path.resolve(process.cwd(), DATA_FILE);
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Hata: ${DATA_FILE} dosyası bulunamadı!`);
    return;
  }
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(rawData);
  const { collection, places } = data;

  console.log(
    `📂 Veri yüklendi: "${collection.name}" (${places.length} mekan)`
  );

  // 3. Gerekli ID'leri Bul (Şehir ve Kategori)

  // Şehir: Adana
  const { data: cityData, error: cityError } = await supabase
    .from('locations')
    .select('id')
    .ilike('names->>tr', collection.cityName)
    .eq('type', 'city')
    .single();

  if (cityError || !cityData)
    throw new Error(`❌ Şehir bulunamadı: ${collection.cityName}`);
  const cityId = cityData.id;

  // Kategori: Kebap & Ocakbaşı (Tek seviye kategori)
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', collection.categorySlug)
    .single();

  if (catError || !catData)
    throw new Error(`❌ Kategori bulunamadı: ${collection.categorySlug}`);
  const categoryId = catData.id;

  console.log(`✅ Şehir ID: ${cityId}`);
  console.log(`✅ Kategori ID: ${categoryId} (${collection.categorySlug})`);

  // 4. Koleksiyonu Oluştur
  const collectionSlug =
    generateSlug(collection.name) +
    '-' +
    Math.random().toString(36).substring(2, 6);

  console.log('📦 Koleksiyon oluşturuluyor...');
  const { data: newCollection, error: colError } = await supabase
    .from('collections')
    .insert({
      slug: collectionSlug,
      names: { tr: collection.name, en: collection.name },
      descriptions: { tr: collection.description, en: collection.description },
      creator_id: userId,
      location_id: cityId,
      category_id: categoryId,
      subcategory_id: null, // Alt kategori yok
      status: 'active',
    })
    .select()
    .single();

  if (colError)
    throw new Error(`❌ Koleksiyon oluşturma hatası: ${colError.message}`);
  console.log(`✅ Koleksiyon hazır: ${newCollection.names.tr}`);

  // 5. Mekanları İşle
  console.log('📍 Mekanlar işleniyor...');

  for (let i = 0; i < places.length; i++) {
    const placeData = places[i];
    const placeSlugBase = generateSlug(placeData.name);

    // Mekan var mı kontrol et (Duplicate check)
    const { data: existingPlaces } = await supabase
      .from('places')
      .select('id')
      .ilike('names->>tr', placeData.name)
      .eq('location_id', cityId);

    let placeId;

    if (existingPlaces && existingPlaces.length > 0) {
      placeId = existingPlaces[0].id;
      console.log(`   🔄 Mevcut mekan bulundu: ${placeData.name}`);
    } else {
      // Yeni mekan oluştur
      const newPlaceSlug =
        placeSlugBase + '-' + Math.random().toString(36).substring(2, 6);

      const { data: newPlace, error: placeError } = await supabase
        .from('places')
        .insert({
          slug: newPlaceSlug,
          names: { tr: placeData.name, en: placeData.name },
          descriptions: {
            tr: placeData.description,
            en: placeData.description,
          },
          address: placeData.address,
          location_id: cityId,
          category_id: categoryId, // Kategori ID'si doğrudan buraya
          status: 'approved',
          vote_count: 0,
          vote_score: 0,
        })
        .select()
        .single();

      if (placeError) {
        console.error(
          `   ❌ Mekan oluşturulamadı (${placeData.name}):`,
          placeError.message
        );
        continue;
      }
      placeId = newPlace.id;
      console.log(`   ✨ Yeni mekan oluşturuldu: ${placeData.name}`);
    }

    // 5. Mekanı Koleksiyona Bağla
    const { error: linkError } = await supabase
      .from('collection_places')
      .insert({
        collection_id: newCollection.id,
        place_id: placeId,
        display_order: i,
        curator_note: placeData.description,
        recommended_items: placeData.recommendedItems || [],
      });

    if (linkError) {
      console.error(
        `   ❌ Bağlantı hatası (${placeData.name}):`,
        linkError.message
      );
    }
  }

  console.log('\n🎉 İŞLEM BAŞARIYLA TAMAMLANDI!');
  console.log(
    `👉 Koleksiyonunuzu görmek için tarayıcıda '/my-collections' sayfasına gidin.`
  );
}

importCollection().catch(console.error);
