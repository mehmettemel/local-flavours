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
import { TURKISH_CITIES } from '@/lib/data/turkish-cities';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing');
  console.error(
    'SUPABASE_SERVICE_ROLE_KEY:',
    supabaseServiceKey ? 'Found' : 'Missing'
  );
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// Helper function to create slug from Turkish city names
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/İ/g, 'i')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// CATEGORY DEFINITIONS - FLAT STRUCTURE (NO PARENT-CHILD)
const CATEGORIES = [
  // All categories at the same level
  {
    slug: 'kebap-ocakbasi',
    names: { tr: 'Kebap & Ocakbaşı', en: 'Kebab & Grill' },
    icon: 'Flame',
    display_order: 1,
  },
  {
    slug: 'esnaf-lokantasi',
    names: { tr: 'Esnaf Lokantası', en: 'Traditional Eatery' },
    icon: 'Soup',
    display_order: 2,
  },
  {
    slug: 'doner',
    names: { tr: 'Döner', en: 'Doner Kebab' },
    icon: 'ChefHat',
    display_order: 3,
  },
  {
    slug: 'pide-lahmacun',
    names: { tr: 'Pide & Lahmacun', en: 'Pide & Lahmacun' },
    icon: 'Pizza',
    display_order: 4,
  },
  {
    slug: 'burger',
    names: { tr: 'Burger', en: 'Burger' },
    icon: 'Sandwich',
    display_order: 5,
  },
  {
    slug: 'sokak-lezzetleri',
    names: { tr: 'Sokak Lezzetleri', en: 'Street Food' },
    icon: 'Truck',
    display_order: 6,
  },
  {
    slug: 'corbaci',
    names: { tr: 'Çorbacı', en: 'Soup House' },
    icon: 'Soup',
    display_order: 7,
  },
  {
    slug: 'kahvalti',
    names: { tr: 'Kahvaltı & Börek', en: 'Breakfast' },
    icon: 'Sun',
    display_order: 8,
  },
  {
    slug: 'balik-deniz',
    names: { tr: 'Balık & Deniz Ürünleri', en: 'Seafood' },
    icon: 'Fish',
    display_order: 9,
  },
  {
    slug: 'dunya-mutfagi',
    names: { tr: 'Dünya Mutfağı', en: 'World Cuisine' },
    icon: 'Globe',
    display_order: 10,
  },
  {
    slug: 'nitelikli-kahve',
    names: { tr: 'Nitelikli Kahve', en: 'Specialty Coffee' },
    icon: 'Coffee',
    display_order: 11,
  },
  {
    slug: 'turk-kahvesi',
    names: { tr: 'Türk Kahvesi & Çay', en: 'Turkish Coffee & Tea' },
    icon: 'CupSoda',
    display_order: 12,
  },
  {
    slug: 'kitap-kafe',
    names: { tr: 'Kitap Kafe', en: 'Book Cafe' },
    icon: 'BookOpen',
    display_order: 13,
  },
  {
    slug: 'calisma-dostu',
    names: { tr: 'Çalışma Dostu', en: 'Work Friendly' },
    icon: 'Laptop',
    display_order: 14,
  },
  {
    slug: 'pub',
    names: { tr: 'Pub & Bar', en: 'Pub & Bar' },
    icon: 'Beer',
    display_order: 15,
  },
  {
    slug: 'meyhane',
    names: { tr: 'Meyhane', en: 'Meyhane (Tavern)' },
    icon: 'GlassWater',
    display_order: 16,
  },
  {
    slug: 'sarap-evi',
    names: { tr: 'Şarap Evi', en: 'Wine House' },
    icon: 'Wine',
    display_order: 17,
  },
  {
    slug: 'kokteyl-bar',
    names: { tr: 'Kokteyl Bar', en: 'Cocktail Bar' },
    icon: 'Martini',
    display_order: 18,
  },
  {
    slug: 'baklava-serbetli',
    names: { tr: 'Baklava & Şerbetli', en: 'Baklava & Traditional' },
    icon: 'Gem',
    display_order: 19,
  },
  {
    slug: 'pastane',
    names: { tr: 'Pastane & Fırın', en: 'Patisserie & Bakery' },
    icon: 'Cake',
    display_order: 20,
  },
  {
    slug: 'dondurma',
    names: { tr: 'Dondurma', en: 'Ice Cream' },
    icon: 'IceCream2',
    display_order: 21,
  },
  {
    slug: 'cikolata',
    names: { tr: 'Çikolatacı', en: 'Chocolatier' },
    icon: 'Candy',
    display_order: 22,
  },
  {
    slug: 'genel',
    names: { tr: 'Genel / Diğer', en: 'General / Other' },
    icon: 'MapPin',
    display_order: 99,
  },
];

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // ============================================
    // 1. CLEAN UP OLD CATEGORIES
    // ============================================
    console.log('🧹 Cleaning up old categories...');

    const expectedSlugs = CATEGORIES.map((c) => c.slug);
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id, slug');

    const categoriesToDelete = (existingCategories || []).filter(
      (cat: any) => !expectedSlugs.includes(cat.slug)
    );

    if (categoriesToDelete && categoriesToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .in(
          'id',
          categoriesToDelete.map((c: any) => c.id)
        );

      if (deleteError) throw deleteError;
      console.log(`  ✅ Deleted ${categoriesToDelete.length} old categories`);
    } else {
      console.log('  ✅ No old categories to delete');
    }

    // ============================================
    // 2. SEED CATEGORIES (FLAT STRUCTURE)
    // ============================================
    console.log('\n📦 Seeding categories...');

    // All categories at the same level (no parent-child hierarchy)
    for (const category of CATEGORIES) {
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', category.slug)
        .single();

      if (!existingCategory) {
        const { error } = await supabase
          .from('categories')
          .insert({
            slug: category.slug,
            names: category.names,
            icon: category.icon,
            display_order: category.display_order,
            parent_id: null, // Always null for flat structure
          } as any)
          .select()
          .single();

        if (error) throw error;
        console.log(`  ✅ ${category.slug} created`);
      } else {
        // Update existing category to ensure parent_id is null
        const { error } = await supabase
          .from('categories')
          .update({
            parent_id: null,
            display_order: category.display_order,
          } as any)
          .eq('slug', category.slug);

        if (error) throw error;
        console.log(`  ✅ ${category.slug} already exists (updated to flat structure)`);
      }
    }

    // ============================================
    // 3. SEED TURKEY (COUNTRY)
    // ============================================
    console.log('\n🇹🇷 Seeding Turkey...');
    let { data: turkey } = (await supabase
      .from('locations')
      .select('*')
      .eq('slug', 'turkey')
      .eq('type', 'country')
      .single()) as { data: { id: string } | null };

    if (!turkey) {
      const { data: newTurkey, error: turkeyError } = await supabase
        .from('locations')
        .insert({
          type: 'country',
          slug: 'turkey',
          names: { en: 'Turkey', tr: 'Türkiye' },
          path: '/turkey',
          has_districts: false,
          latitude: 38.9637,
          longitude: 35.2433,
        } as any)
        .select()
        .single();

      if (turkeyError) throw turkeyError;
      turkey = newTurkey;
      console.log('  ✅ Turkey created');
    } else {
      console.log('  ✅ Turkey already exists');
    }

    if (!turkey) {
      throw new Error('Turkey location not found after insert/check');
    }

    // ============================================
    // 4. SEED ALL 81 TURKISH CITIES
    // ============================================
    console.log('\n🏙️ Seeding all 81 Turkish cities...');

    const cities = TURKISH_CITIES.map((city) => {
      const slug = createSlug(city.name);
      return {
        parent_id: turkey.id,
        type: 'city' as const,
        slug: slug,
        names: { en: city.name, tr: city.name },
        path: `/turkey/${slug}`,
        has_districts: city.name === 'İstanbul', // Only Istanbul has districts for now
        latitude: city.latitude,
        longitude: city.longitude,
      };
    });

    // Check which cities already exist
    const existingCities = await supabase
      .from('locations')
      .select('*')
      .eq('type', 'city')
      .in(
        'slug',
        cities.map((c) => c.slug)
      );

    type LocationRow = Database['public']['Tables']['locations']['Row'];

    const existingSlugs = new Set(
      (existingCities.data as LocationRow[] || []).map((c) => c.slug)
    );
    const citiesToInsert = cities.filter((c) => !existingSlugs.has(c.slug));

    if (citiesToInsert.length > 0) {
      // Insert in batches of 20 to avoid overwhelming the database
      const batchSize = 20;
      let insertedCount = 0;

      for (let i = 0; i < citiesToInsert.length; i += batchSize) {
        const batch = citiesToInsert.slice(i, i + batchSize);
        const { error } = await supabase.from('locations').insert(batch as any);

        if (error) throw error;
        insertedCount += batch.length;
        console.log(
          `  📍 Inserted ${insertedCount}/${citiesToInsert.length} cities...`
        );
      }

      console.log(
        `  ✅ Cities seeded: ${citiesToInsert.length} new, ${existingSlugs.size} already existed`
      );
    } else {
      console.log(`  ✅ All 81 cities already exist`);
    }

    // ============================================
    // 5. SEED ISTANBUL DISTRICTS (OPTIONAL)
    // ============================================
    const { data: allCities } = await supabase
      .from('locations')
      .select('*')
      .eq('type', 'city')
      .eq('slug', 'istanbul')
      .single();

    const istanbul = allCities as LocationRow | null;

    if (istanbul) {
      console.log('\n📍 Seeding Istanbul districts...');
      const districts = [
        {
          parent_id: istanbul.id,
          type: 'district' as const,
          slug: 'kadikoy',
          names: { en: 'Kadıköy', tr: 'Kadıköy' },
          path: '/turkey/istanbul/kadikoy',
          has_districts: false,
          latitude: 40.9904,
          longitude: 29.0254,
        },
        {
          parent_id: istanbul.id,
          type: 'district' as const,
          slug: 'besiktas',
          names: { en: 'Beşiktaş', tr: 'Beşiktaş' },
          path: '/turkey/istanbul/besiktas',
          has_districts: false,
          latitude: 41.0422,
          longitude: 29.0092,
        },
        {
          parent_id: istanbul.id,
          type: 'district' as const,
          slug: 'beyoglu',
          names: { en: 'Beyoğlu', tr: 'Beyoğlu' },
          path: '/turkey/istanbul/beyoglu',
          has_districts: false,
          latitude: 41.0351,
          longitude: 28.977,
        },
      ];

      const existingDistricts = await supabase
        .from('locations')
        .select('*')
        .eq('type', 'district')
        .in(
          'slug',
          districts.map((d) => d.slug)
        );

      const existingDistrictSlugs = new Set(
        ((existingDistricts.data as LocationRow[]) || []).map((d) => d.slug)
      );
      const districtsToInsert = districts.filter(
        (d) => !existingDistrictSlugs.has(d.slug)
      );

      if (districtsToInsert.length > 0) {
        const { error } = await supabase
          .from('locations')
          .insert(districtsToInsert as any);

        if (error) throw error;
        console.log(
          `  ✅ Districts seeded: ${districtsToInsert.length} new, ${existingDistrictSlugs.size} already existed`
        );
      } else {
        console.log(`  ✅ All districts already exist`);
      }
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n📊 Database Summary:');

    const { data: allCategories } = await supabase.from('categories').select('*');

    const { data: allLocations } = await supabase.from('locations').select('*');

    const { data: cityLocations } = await supabase
      .from('locations')
      .select('*')
      .eq('type', 'city');

    const { data: districtLocations } = await supabase
      .from('locations')
      .select('*')
      .eq('type', 'district');

    console.log('\n  Categories:');
    console.log(`    - ${allCategories?.length || 0} total categories (flat structure)`);

    console.log('\n  Locations:');
    console.log(`    - ${allLocations?.length || 0} total locations`);
    console.log(`    - 1 country (Turkey)`);
    console.log(`    - ${cityLocations?.length || 0} cities`);
    console.log(`    - ${districtLocations?.length || 0} districts`);

    console.log('\n🎉 Database seeding completed successfully!\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seeding (only if run directly)
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
