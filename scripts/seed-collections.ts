/**
 * Collection Seed Script
 *
 * Kullanım:
 *   npm run seed:collections              # Local DB'ye ekle
 *   npm run seed:collections:prod         # Production DB'ye ekle
 *   npm run seed:collections -- --clear   # Önce temizle sonra ekle
 *
 * Data dosyaları: lib/data/collections/*.json
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Argument parsing
const args = process.argv.slice(2);
const isProd = args.includes('--prod');
const shouldClear = args.includes('--clear');

// Load environment
dotenv.config({ path: isProd ? '.env.production' : '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error(`   Check your ${isProd ? '.env.production' : '.env.local'} file`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);
const COLLECTIONS_DIR = 'lib/data/collections';

// Turkish character slug helper
function generateSlug(text: string): string {
  const trMap: Record<string, string> = {
    ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u',
    Ç: 'c', Ğ: 'g', Ö: 'o', Ş: 's', Ü: 'u',
  };
  return text
    .split('')
    .map((char) => trMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Get creator by email from auth.users
async function getCreatorId(): Promise<string> {
  const targetEmail = 'temel.dev1@gmail.com';

  const { data, error } = await supabase.auth.admin.listUsers();

  if (error || !data?.users) {
    throw new Error('❌ Could not fetch users from auth');
  }

  const user = data.users.find(u => u.email === targetEmail);

  if (!user) {
    throw new Error(`❌ User not found with email: ${targetEmail}`);
  }
  return user.id;
}

// Get city ID by name
async function getCityId(cityName: string): Promise<string> {
  const { data, error } = await supabase
    .from('locations')
    .select('id')
    .ilike('names->>tr', cityName)
    .eq('type', 'city')
    .single();

  if (error || !data) {
    throw new Error(`❌ City not found: ${cityName}`);
  }
  return data.id;
}

// Get category ID by slug
async function getCategoryId(slug: string): Promise<string> {
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    // Try fallback categories
    const fallbacks = ['kebap-ocakbasi', 'yemek'];
    for (const fallback of fallbacks) {
      const { data: fbData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', fallback)
        .single();
      if (fbData) {
        console.log(`   ⚠️  Category "${slug}" not found, using "${fallback}"`);
        return fbData.id;
      }
    }
    throw new Error(`❌ Category not found: ${slug}`);
  }
  return data.id;
}

// Clear all data
async function clearData() {
  console.log('🗑️  Clearing existing data...');

  await supabase.from('collection_places').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('collections').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('places').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('✅ Data cleared\n');
}

// Import single collection
async function importCollection(filePath: string, creatorId: string) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const { collection, places } = data;

  console.log(`\n📦 Importing: ${collection.name}`);

  // Get IDs
  const cityId = await getCityId(collection.cityName);
  const categoryId = await getCategoryId(collection.categorySlug);

  // Check if collection exists
  const { data: existing } = await supabase
    .from('collections')
    .select('id')
    .ilike('names->>tr', collection.name)
    .eq('location_id', cityId)
    .single();

  let collectionId: string;

  if (existing) {
    console.log(`   ⏭️  Collection already exists, updating places...`);
    collectionId = existing.id;
  } else {

  // Create collection
  const collectionSlug = generateSlug(collection.name) + '-' + Math.random().toString(36).substring(2, 6);

  const { data: newCollection, error: colError } = await supabase
    .from('collections')
    .insert({
      slug: collectionSlug,
      names: { tr: collection.name, en: collection.name },
      descriptions: { tr: collection.description, en: collection.description },
      creator_id: creatorId,
      location_id: cityId,
      category_id: categoryId,
      status: 'active',
    })
    .select()
    .single();

  if (colError) {
    console.error(`   ❌ Failed to create collection: ${colError.message}`);
    return;
  }

  collectionId = newCollection.id;
  console.log(`   ✅ Collection created: ${collectionSlug}`);
  }

  // Import places
  for (let i = 0; i < places.length; i++) {
    const p = places[i];

    // Check if place exists
    const { data: existingPlace } = await supabase
      .from('places')
      .select('id')
      .ilike('names->>tr', p.name)
      .eq('location_id', cityId);

    let placeId: string;

    if (existingPlace && existingPlace.length > 0) {
      placeId = existingPlace[0].id;
      // Update google_maps_url if provided
      if (p.googleMapsUrl) {
        await supabase
          .from('places')
          .update({ google_maps_url: p.googleMapsUrl })
          .eq('id', placeId);
      }
      console.log(`   🔄 Existing place (updated): ${p.name}`);
    } else {
      const placeSlug = generateSlug(p.name) + '-' + Math.random().toString(36).substring(2, 6);

      const { data: newPlace, error: placeError } = await supabase
        .from('places')
        .insert({
          slug: placeSlug,
          names: { tr: p.name, en: p.name },
          descriptions: { tr: p.description, en: p.description },
          address: p.address,
          google_maps_url: p.googleMapsUrl || null,
          location_id: cityId,
          category_id: categoryId,
          status: 'approved',
          vote_count: 0,
          vote_score: 0,
        })
        .select()
        .single();

      if (placeError) {
        console.error(`   ❌ Failed to create place "${p.name}": ${placeError.message}`);
        continue;
      }
      placeId = newPlace.id;
      console.log(`   ✨ New place: ${p.name}`);
    }

    // Link to collection (upsert to avoid duplicates)
    await supabase.from('collection_places').upsert({
      collection_id: collectionId,
      place_id: placeId,
      display_order: i,
      curator_note: p.description,
      recommended_items: p.recommendedItems || [],
    });
  }
}

// Main
async function main() {
  console.log('🚀 Collection Seed Script');
  console.log(`📍 Target: ${isProd ? 'PRODUCTION' : 'LOCAL'}\n`);

  if (shouldClear) {
    await clearData();
  }

  // Get creator
  const creatorId = await getCreatorId();
  console.log(`👤 Creator: ${creatorId}`);

  // Find all JSON files
  const collectionsDir = path.resolve(process.cwd(), COLLECTIONS_DIR);

  if (!fs.existsSync(collectionsDir)) {
    fs.mkdirSync(collectionsDir, { recursive: true });
    console.log(`📁 Created directory: ${COLLECTIONS_DIR}`);
    console.log(`   Add JSON files to this directory and run again.`);
    return;
  }

  const files = fs.readdirSync(collectionsDir).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.log(`📁 No JSON files found in ${COLLECTIONS_DIR}`);
    console.log(`   Add collection JSON files and run again.`);
    return;
  }

  console.log(`📂 Found ${files.length} collection file(s)`);

  // Import each
  for (const file of files) {
    const filePath = path.join(collectionsDir, file);
    try {
      await importCollection(filePath, creatorId);
    } catch (err: any) {
      console.error(`❌ Error importing ${file}: ${err.message}`);
    }
  }

  console.log('\n🎉 Done!');
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
