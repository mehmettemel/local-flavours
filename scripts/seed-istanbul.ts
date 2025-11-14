import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedIstanbul() {
  console.log('🌱 Starting Istanbul seeding...\n');

  try {
    // 1. First, get or create Turkey
    let { data: turkey } = await supabase
      .from('locations')
      .select('*')
      .eq('slug', 'turkey')
      .eq('type', 'country')
      .single();

    if (!turkey) {
      console.log('Creating Turkey...');
      const { data: newTurkey, error } = await supabase
        .from('locations')
        .insert({
          type: 'country',
          slug: 'turkey',
            en: 'Turkey',
            tr: 'Türkiye',
          },
          path: '/turkey',
          has_districts: false,
          latitude: 38.9637,
          longitude: 35.2433
        })
        .select()
        .single();

      if (error) throw error;
      turkey = newTurkey;
      console.log('✅ Turkey created\n');
    } else {
      console.log('✅ Turkey already exists\n');
    }

    // 2. Create Istanbul city
    let { data: istanbul } = await supabase
      .from('locations')
      .select('*')
      .eq('slug', 'istanbul')
      .eq('type', 'city')
      .single();

    if (!istanbul) {
      console.log('Creating Istanbul...');
      const { data: newIstanbul, error } = await supabase
        .from('locations')
        .insert({
          parent_id: turkey.id,
          type: 'city',
          slug: 'istanbul',
            en: 'Istanbul',
            tr: 'İstanbul',
          },
          path: '/turkey/istanbul',
          has_districts: true,
          latitude: 41.0082,
          longitude: 28.9784
        })
        .select()
        .single();

      if (error) throw error;
      istanbul = newIstanbul;
      console.log('✅ Istanbul created\n');
    } else {
      console.log('✅ Istanbul already exists\n');
    }

    // 3. Create categories
    const categories = [
      {
        slug: 'restaurant',
          en: 'Restaurant',
          tr: 'Restoran',
        },
        icon: 'Utensils',
        display_order: 1
      },
      {
        slug: 'cafe',
          en: 'Cafe',
          tr: 'Kafe',
        },
        icon: 'Coffee',
        display_order: 2
      },
      {
        slug: 'bar',
          en: 'Bar & Pub',
          tr: 'Bar & Pub',
        },
        icon: 'Wine',
        display_order: 3
      }
    ];

    console.log('Creating categories...');

    for (const cat of categories) {
      let { data: existingCat } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', cat.slug)
        .single();

      if (!existingCat) {
        const { data: newCat, error } = await supabase
          .from('categories')
          .insert(cat)
          .select()
          .single();

        if (error) throw error;
        createdCategories.push(newCat);
        console.log(`  ✅ ${cat.slug} created`);
      } else {
        createdCategories.push(existingCat);
        console.log(`  ✅ ${cat.slug} already exists`);
      }
    }
    console.log();

    // 4. Create sample places for Istanbul
    const restaurantCat = createdCategories.find(c => c.slug === 'restaurant');
    const cafeCat = createdCategories.find(c => c.slug === 'cafe');

    const places = [
      {
        location_id: istanbul.id,
        category_id: restaurantCat.id,
        slug: 'karakoy-lokantasi',
          en: 'Karaköy Lokantası',
          tr: 'Karaköy Lokantası',
        },
        descriptions: {
          en: 'A beloved traditional Turkish restaurant in Karaköy serving authentic mezes and home-style dishes. Known for its warm atmosphere and classic recipes passed down through generations.',
          tr: 'Karaköy\'de geleneksel Türk mutfağının en iyi örneklerini sunan sevilen bir lokanta. Sıcak atmosferi ve nesilden nesile aktarılan klasik tarifleriyle ünlü.',
        },
        address: 'Kemankeş Karamustafa Paşa, Kemankeş Cd. No:37/A, 34425 Beyoğlu/İstanbul',
        status: 'approved' as const,
        vote_score: 125,
        vote_count: 108
      },
      {
        location_id: istanbul.id,
        category_id: restaurantCat.id,
        slug: 'ciya-sofrasi',
          en: 'Çiya Sofrası',
          tr: 'Çiya Sofrası',
        },
        descriptions: {
          en: 'An iconic restaurant in Kadıköy specializing in regional Anatolian cuisine. Offers a daily-changing menu of rare and traditional dishes from across Turkey.',
          tr: 'Kadıköy\'de bölgesel Anadolu mutfağında uzmanlaşmış ikonik bir restoran. Türkiye\'nin dört bir yanından nadir ve geleneksel yemeklerin yer aldığı her gün değişen bir menü sunar.',
        },
        address: 'Caferağa, Güneşlibahçe Sk. No:43, 34710 Kadıköy/İstanbul',
        status: 'approved' as const,
        vote_score: 142,
        vote_count: 120
      },
      {
        location_id: istanbul.id,
        category_id: cafeCat.id,
        slug: 'kronotrop-coffee',
          en: 'Kronotrop Coffee',
          tr: 'Kronotrop Coffee',
        },
        descriptions: {
          en: 'A specialty coffee roastery and cafe in Karaköy. Known for sourcing high-quality beans and expert brewing methods. Perfect spot for coffee enthusiasts.',
          tr: 'Karaköy\'de özel kahve kavurmacısı ve kafe. Yüksek kaliteli çekirdekleri tedarik etmesi ve uzman demleme yöntemleriyle tanınır. Kahve tutkunları için mükemmel bir mekan.',
        },
        address: 'Kemankeş Karamustafa Paşa, Mumhane Cd. No:48, 34425 Beyoğlu/İstanbul',
        status: 'approved' as const,
        vote_score: 98,
        vote_count: 85
      },
      {
        location_id: istanbul.id,
        category_id: cafeCat.id,
        slug: 'petra-roasting',
          en: 'Petra Roasting Co.',
          tr: 'Petra Roasting Co.',
        },
        descriptions: {
          en: 'Third-wave coffee shop in Karaköy with a minimalist design. Serves carefully sourced single-origin coffees and light breakfast options.',
          tr: 'Karaköy\'de minimalist tasarımıyla üçüncü dalga kahve dükkanı. Özenle tedarik edilmiş tek kökenli kahveler ve hafif kahvaltı seçenekleri sunar.',
        },
        address: 'Kemankeş Karamustafa Paşa, Kemankeş Cd. No:30/A, 34425 Beyoğlu/İstanbul',
        status: 'approved' as const,
        vote_score: 87,
        vote_count: 76
      },
      {
        location_id: istanbul.id,
        category_id: restaurantCat.id,
        slug: 'mikla-restaurant',
          en: 'Mikla Restaurant',
          tr: 'Mikla Restaurant',
        },
        descriptions: {
          en: 'Fine dining restaurant on the rooftop of Marmara Pera Hotel. Features contemporary Turkish-Scandinavian fusion cuisine with stunning Bosphorus views.',
          tr: 'Marmara Pera Otel\'in çatısında yer alan gurme restoranı. Muhteşem Boğaz manzarası eşliğinde çağdaş Türk-İskandinav füzyon mutfağı sunar.',
        },
        address: 'Asmalı Mescit, Meşrutiyet Cd. No:15, 34430 Beyoğlu/İstanbul',
        status: 'approved' as const,
        vote_score: 156,
        vote_count: 128
      },
      {
        location_id: istanbul.id,
        category_id: restaurantCat.id,
        slug: 'asitane-restaurant',
          en: 'Asitane Restaurant',
          tr: 'Asitane Restaurant',
        },
        descriptions: {
          en: 'Located near the historic Chora Museum, Asitane specializes in Ottoman palace cuisine. Dishes are prepared from historical recipes dating back centuries.',
          tr: 'Tarihi Kariye Müzesi yakınında bulunan Asitane, Osmanlı saray mutfağında uzmanlaşmıştır. Yemekler yüzyıllar öncesine dayanan tarihi tariflerden hazırlanır.',
        },
        address: 'Kariye, Kariye Camii Sk. No:6, 34087 Fatih/İstanbul',
        status: 'approved' as const,
        vote_score: 134,
        vote_count: 115
      }
    ];

    console.log('Creating places for Istanbul...');
    for (const place of places) {
      let { data: existingPlace } = await supabase
        .from('places')
        .select('*')
        .eq('slug', place.slug)
        .single();

      if (!existingPlace) {
        const { error } = await supabase
          .from('places')
          .insert(place);

        if (error) throw error;
        console.log(`  ✅ ${place.slug} created`);
      } else {
        console.log(`  ✅ ${place.slug} already exists`);
      }
    }

    console.log('\n🎉 Istanbul seeding completed successfully!');
    console.log(`\n📍 Created data:`);
    console.log(`   - 1 country (Turkey)`);
    console.log(`   - 1 city (Istanbul)`);
    console.log(`   - ${categories.length} categories`);
    console.log(`   - ${places.length} places`);
    console.log(`\n🌐 Visit: http://localhost:3000/turkey/istanbul`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

// Run the seeding
seedIstanbul()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
