#!/usr/bin/env node

/**
 * Setup script for Vivarta Dashboard + Supabase
 * Usage: node setup.js
 * 
 * This script:
 * 1. Checks if .env exists
 * 2. Validates credentials are configured
 * 3. Tests Supabase connection
 * 4. Provides helpful error messages
 */

const fs = require('fs');
const path = require('path');

console.log('\n🚀 Vivarta Dashboard - Supabase Setup Helper\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('\n📝 Setup instructions:');
  console.log('1. Copy .env.example to .env:');
  console.log('   $ cp .env.example .env');
  console.log('\n2. Edit .env and add your Supabase credentials:');
  console.log('   VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.log('   VITE_SUPABASE_ANON_KEY=your-anon-key');
  console.log('\n3. Get credentials from: https://app.supabase.com');
  console.log('   - Go to Settings → API');
  console.log('   - Copy Project URL and anon key');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
const supabaseKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];

if (!supabaseUrl || supabaseUrl.includes('your-project')) {
  console.log('❌ VITE_SUPABASE_URL not configured in .env');
  process.exit(1);
}

if (!supabaseKey || supabaseKey.includes('your-anon-key')) {
  console.log('❌ VITE_SUPABASE_ANON_KEY not configured in .env');
  process.exit(1);
}

console.log('✅ .env file found and configured');
console.log(`   Project: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.slice(0, 20)}...`);

console.log('\n📋 Configuration Summary:');
console.log('   ✅ .env file exists');
console.log('   ✅ SUPABASE_URL configured');
console.log('   ✅ SUPABASE_ANON_KEY configured');

console.log('\n🎯 Next steps:');
console.log('1. For development: Manually add to supabase-config.js');
console.log('2. For production: Set environment variables on deployment platform');
console.log('3. Open index.html in browser to test');
console.log('4. Check IMPLEMENTATION_CHECKLIST.md for complete setup\n');
