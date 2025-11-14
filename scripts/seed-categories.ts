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

async function seedCategories() {
  console.log('🌱 Starting category seeding...\n');

  try {
    // Main categories (flat structure for now)
    const categories = [
      { slug: 'restaurant', names: { en: 'Restaurant', tr: 'Restoran' }, icon: '🍽️', display_order: 1 },
      { slug: 'cafe', names: { en: 'Cafe', tr: 'Kafe' }, icon: '☕', display_order: 2 },
      { slug: 'bar', names: { en: 'Bar & Pub', tr: 'Bar & Pub' }, icon: '🍺', display_order: 3 },
    ];

    // Create categories
    for (const category of categories) {
      console.log(`Creating category: ${category.slug}...`);

      // Check if category exists
      let { data: existingCategory } = await supabase
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
            display_order: category.display_order
          });

        if (error) throw error;
        console.log(`  ✅ ${category.slug} created`);
      } else {
        console.log(`  ✅ ${category.slug} already exists`);
      }
    }

    console.log('\n🎉 Category seeding completed successfully!\n');

    // Count total categories
    const { data: allCategories } = await supabase
      .from('categories')
      .select('*');

    console.log('📊 Summary:');
    console.log(`   - ${allCategories?.length} total categories`);

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

// Run the seeding
seedCategories()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
