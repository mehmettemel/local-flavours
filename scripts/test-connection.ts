
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...');
console.log('URL exists:', !!supabaseUrl);
console.log('Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables!');
  process.exit(1);
}

console.log('URL:', supabaseUrl); // Safe to show URL usually, helps debug typos

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('categories').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase Error:', error);
    } else {
      console.log('Connection Successful! Categories count:', data);
    }
  } catch (err) {
    console.error('Unexpected Error:', err);
  }
}

testConnection();
