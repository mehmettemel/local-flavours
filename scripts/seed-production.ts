/**
 * Production Database Seeding Script
 *
 * IMPORTANT: This script will update the PRODUCTION database.
 * Make sure you have a backup before running this script.
 *
 * Usage:
 *   1. Set production credentials in .env.production file
 *   2. Run: DOTENV_CONFIG_PATH=.env.production npx tsx scripts/seed-production.ts
 */

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
import { config } from 'dotenv';
import { resolve } from 'path';
import * as readline from 'readline';

// Load environment variables from .env.production or DOTENV_CONFIG_PATH
const envPath = process.env.DOTENV_CONFIG_PATH || resolve(process.cwd(), '.env.production');
config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('\n🚨 PRODUCTION DATABASE SEEDING 🚨\n');
console.log('Environment file:', envPath);
console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key:', supabaseServiceKey ? '***' + supabaseServiceKey.slice(-4) : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('\n❌ Missing environment variables!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set\n');
  process.exit(1);
}

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('\n⚠️  WARNING: This will modify the PRODUCTION database!');
  console.log('This script will:');
  console.log('  1. Delete old/unused categories');
  console.log('  2. Add new category structure (5 main + 22 sub categories)');
  console.log('  3. Keep existing data (places, collections, etc.)\n');

  const answer = await askQuestion('Are you sure you want to continue? (yes/no): ');

  if (answer.toLowerCase() !== 'yes') {
    console.log('\n❌ Operation cancelled.\n');
    rl.close();
    process.exit(0);
  }

  console.log('\n🔄 Starting production seed...\n');

  // Import and run the seed script
  const { seedDatabase } = await import('./seed-database');

  try {
    await seedDatabase();
    console.log('\n✅ Production database seeded successfully!\n');
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding production database:', error);
    rl.close();
    process.exit(1);
  }
}

main();
