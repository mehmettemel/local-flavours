import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedIstanbulRealPlaces() {
  console.log('🌱 Starting Istanbul real places seeding...\n');

  try {
    // Get Istanbul city
    const { data: istanbul } = await supabase
      .from('locations')
      .select('*')
      .eq('slug', 'istanbul')
      .single();

    if (!istanbul) {
      console.error('❌ Istanbul city not found!');
      return;
    }

    // Get categories
    const { data: restaurantCat } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', 'restaurant')
      .single();

    const { data: cafeCat } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', 'cafe')
      .single();

    const { data: barCat } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', 'bar')
      .single();

    console.log('📍 Found Istanbul:', istanbul.id);
    console.log('🍽️  Categories ready\n');

    // Real Istanbul places - Local favorites
    const places = [
      // === DÖNERCI (Restaurants) ===
      {
        location_id: istanbul.id,
        category_id: restaurantCat.id,
        slug: 'karadeniz-doner-besiktas',
          en: 'Karadeniz Döner (Beşiktaş)',
          tr: 'Karadeniz Döner (Beşiktaş)',
        },
        descriptions: {
          en: 'Legendary döner spot in Beşiktaş, serving quality döner kebab since 1967. Famous for their crispy bread and perfectly seasoned meat.',
          tr: '1967\'den beri Beşiktaş\'ta kaliteli döner servisi yapan efsane mekan. Çıtır ekmeği ve mükemmel baharatlanmış etiyle ünlü.',
        },
        address: 'Sinanpaşa, Barbaros Blv. No:18, Beşiktaş',
        status: 'approved' as const,
        vote_score: 245,
        vote_count: 198
      },
      {
        location_id: istanbul.id,
        category_id: restaurantCat.id,
        slug: 'bayramoğlu-doner-uskudar',
          en: 'Bayramoğlu Döner (Üsküdar)',
          tr: 'Bayramoğlu Döner (Üsküdar)',
        },
        descriptions: {
          en: 'Authentic Anatolian döner experience. Known for generous portions and traditional recipes.',
          tr: 'Otantik Anadolu döner deneyimi. Bol porsiyonları ve geleneksel tarifleriyle biliniyor.',
        },
        address: 'Kısıklı Mah, Alemdağ Cd. No:119, Üsküdar',
        status: 'approved' as const,
        vote_score: 228,
        vote_count: 185
      },
      {
        location_id: istanbul.id,
        category_id: restaurantCat.id,
        slug: 'zubeyir-ocakbasi-etiler',
          en: 'Zübeyir Ocakbaşı (Etiler)',
          tr: 'Zübeyir Ocakbaşı (Etiler)',
        },
        descriptions: {
          en: 'Traditional charcoal grill restaurant. Perfect for authentic Turkish kebabs and grilled meats.',
          tr: 'Geleneksel mangal restoranı. Otantik Türk kebapları ve ızgara etler için mükemmel.',
        },
        address: 'Akatlar Mahallesi, Nispetiye Cd. No:13, Beşiktaş',
        status: 'approved' as const,
        vote_score: 212,
        vote_count: 176
      },

      // === HAMBURGERCI (Restaurants) ===
      {
        location_id: istanbul.id,
        category_id: restaurantCat.id,
        slug: 'kizilkayalar-hamburger-kadikoy',
          en: 'Kızılkayalar Hamburger (Kadıköy)',
          tr: 'Kızılkayalar Hamburger (Kadıköy)',
        },
        descriptions: {
          en: 'Cult classic burger joint in Kadıköy. Simple menu, exceptional quality, fair prices. A true local favorite.',
          tr: 'Kadıköy\'de kült burger mekanı. Basit menü, olağanüstü kalite, uygun fiyatlar. Gerçek bir yerel favorisi.',
        },
        address: 'Caferağa Mahallesi, Moda Cd. No:74/A, Kadıköy',
        status: 'approved' as const,
        vote_score: 267,
        vote_count: 215
      },
      {
        location_id: istanbul.id,
        category_id: restaurantCat.id,
        slug: 'duble-hamburger-cihangir',
          en: 'Duble Hamburger (Cihangir)',
          tr: 'Duble Hamburger (Cihangir)',
        },
        descriptions: {
          en: 'Tiny spot with huge flavors. Their signature double burger is a must-try for burger enthusiasts.',
          tr: 'Küçük mekan, büyük lezzetler. İmza niteliğindeki double burger, burger tutkunları için mutlaka denenmeli.',
        },
        address: 'Cihangir Mahallesi, Sıraselviler Cd. No:67/A, Beyoğlu',
        status: 'approved' as const,
        vote_score: 234,
        vote_count: 189
      },
      {
        location_id: istanbul.id,
        category_id: restaurantCat.id,
        slug: 'the-hunger-besiktas',
          en: 'The Hunger (Beşiktaş)',
          tr: 'The Hunger (Beşiktaş)',
        },
        descriptions: {
          en: 'Creative burger combinations with quality ingredients. Popular among young professionals.',
          tr: 'Kaliteli malzemelerle yaratıcı burger kombinasyonları. Genç profesyoneller arasında popüler.',
        },
        address: 'Abbasağa Mahallesi, Kumbaracı Yokuşu No:7, Beşiktaş',
        status: 'approved' as const,
        vote_score: 219,
        vote_count: 182
      },

      // === KAFELER (Cafes) ===
      {
        location_id: istanbul.id,
        category_id: cafeCat.id,
        slug: 'fazil-bey-kadikoy',
          en: 'Fazıl Bey Turkish Coffee (Kadıköy)',
          tr: 'Fazıl Bey Türk Kahvesi (Kadıköy)',
        },
        descriptions: {
          en: 'Historic Turkish coffee house since 1923. Perfectly roasted beans and traditional brewing methods.',
          tr: '1923\'ten beri tarihi Türk kahvecisi. Mükemmel kavrulmuş çekirdekler ve geleneksel demleme yöntemleri.',
        },
        address: 'Serasker Cad. No:1/A, Kadıköy',
        status: 'approved' as const,
        vote_score: 289,
        vote_count: 234
      },
      {
        location_id: istanbul.id,
        category_id: cafeCat.id,
        slug: 'kronotrop-karakoy',
          en: 'Kronotrop (Karaköy)',
          tr: 'Kronotrop (Karaköy)',
        },
        descriptions: {
          en: 'Third wave coffee pioneer in Istanbul. Own roastery, expertly trained baristas, excellent brunch.',
          tr: 'İstanbul\'da üçüncü dalga kahvenin öncüsü. Kendi kavurcusu, uzman baristalar, mükemmel brunch.',
        },
        address: 'Kemankeş Karamustafa Paşa, Karaköy',
        status: 'approved' as const,
        vote_score: 256,
        vote_count: 207
      },
      {
        location_id: istanbul.id,
        category_id: cafeCat.id,
        slug: 'petra-roasting-co-kadikoy',
          en: 'Petra Roasting Co. (Kadıköy)',
          tr: 'Petra Roasting Co. (Kadıköy)',
        },
        descriptions: {
          en: 'Specialty coffee roastery with cozy atmosphere. Great place for coffee lovers and remote workers.',
          tr: 'Samimi atmosfere sahip özel kahve kavurcusu. Kahve severler ve uzaktan çalışanlar için harika mekan.',
        },
        address: 'Caferağa Mahallesi, Moda Cd., Kadıköy',
        status: 'approved' as const,
        vote_score: 241,
        vote_count: 195
      },
      {
        location_id: istanbul.id,
        category_id: cafeCat.id,
        slug: 'mandabatmaz-beyoglu',
          en: 'Mandabatmaz (Beyoğlu)',
          tr: 'Mandabatmaz (Beyoğlu)',
        },
        descriptions: {
          en: 'Tiny coffee shop hidden in Beyoğlu alleys. Famous for rich, creamy Turkish coffee. Always crowded.',
          tr: 'Beyoğlu sokaklarında gizli küçük kahve dükkanı. Yoğun, kremalı Türk kahvesiyle ünlü. Her zaman kalabalık.',
        },
        address: 'Olivia Geçidi No:1/A, İstiklal Caddesi, Beyoğlu',
        status: 'approved' as const,
        vote_score: 278,
        vote_count: 225
      },

      // === BAR & PUB ===
      {
        location_id: istanbul.id,
        category_id: barCat.id,
        slug: 'arkaoda-kadikoy',
          en: 'Arkaoda (Kadıköy)',
          tr: 'Arkaoda (Kadıköy)',
        },
        descriptions: {
          en: 'Underground bar with live music. Alternative scene hub. Great selection of local craft beers.',
          tr: 'Canlı müzikli yeraltı barı. Alternatif sahne merkezi. Harika yerel craft beer seçkisi.',
        },
        address: 'Caferağa Mahallesi, Kadife Sok. No:18, Kadıköy',
        status: 'approved' as const,
        vote_score: 223,
        vote_count: 180
      },
      {
        location_id: istanbul.id,
        category_id: barCat.id,
        slug: 'karga-bar-kadikoy',
          en: 'Karga Bar (Kadıköy)',
          tr: 'Karga Bar (Kadıköy)',
        },
        descriptions: {
          en: 'Iconic rock bar in Kadıköy since 2001. Live rock performances, vintage atmosphere, loyal crowd.',
          tr: '2001\'den beri Kadıköy\'de ikonik rock barı. Canlı rock performansları, vintage atmosfer, sadık kitle.',
        },
        address: 'Kadife Sok. No:16, Kadıköy',
        status: 'approved' as const,
        vote_score: 245,
        vote_count: 199
      },
      {
        location_id: istanbul.id,
        category_id: barCat.id,
        slug: 'luzia-beyoglu',
          en: 'Luzia (Beyoğlu)',
          tr: 'Luzia (Beyoğlu)',
        },
        descriptions: {
          en: 'Stylish cocktail bar with creative mixology. Located in historic Pera district.',
          tr: 'Yaratıcı mixology ile şık kokteyl barı. Tarihi Pera bölgesinde.',
        },
        address: 'Asmalımescit Mahallesi, Meşrutiyet Cd. No:99, Beyoğlu',
        status: 'approved' as const,
        vote_score: 201,
        vote_count: 167
      },
      {
        location_id: istanbul.id,
        category_id: barCat.id,
        slug: 'indigo-galata',
          en: 'Indigo (Galata)',
          tr: 'Indigo (Galata)',
        },
        descriptions: {
          en: 'Live jazz and blues bar. Talented local musicians perform nightly. Intimate atmosphere.',
          tr: 'Canlı caz ve blues barı. Yetenekli yerel müzisyenler her gece performans sergiliyor. Samimi atmosfer.',
        },
        address: 'Bereketzade Mahallesi, Galata',
        status: 'approved' as const,
        vote_score: 216,
        vote_count: 175
      }
    ];

    console.log('🔥 Deleting existing Istanbul places...');
    await supabase
      .from('places')
      .delete()
      .eq('location_id', istanbul.id);

    console.log('✅ Creating new places...\n');
    for (const place of places) {
      const { error } = await supabase
        .from('places')
        .insert(place);

      if (error) {
        console.error(`❌ Error creating ${place.slug}:`, error.message);
      } else {
        console.log(`  ✅ ${place.slug}`);
      }
    }

    console.log('\n🎉 Istanbul real places seeded successfully!\n');

    // Summary
    const { data: allPlaces } = await supabase
      .from('places')
      .select('*')
      .eq('location_id', istanbul.id);

    console.log('📊 Summary:');
    console.log(`   - ${allPlaces?.length || 0} total places in Istanbul`);
    console.log(`   - Döner/Restaurant: 6 places`);
    console.log(`   - Bars: 4 places`);

  } catch (error) {
    console.error('❌ Error seeding:', error);
    throw error;
  }
}

seedIstanbulRealPlaces()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
